const prisma = require('../prisma/client');
const { TABLE_PAR_ROLE, LIBELLE_ROLE } = require('../utils/roles');
const { envoyerLienPourEmplacement } = require('../utils/activation');

function statutEmplacement(compte) {
  if (compte.motdepasse) {
    return 'ACTIVE';
  }

  if (compte.agentMatricule) {
    return 'ATTRIBUE';
  }

  return 'LIBRE';
}

function retirerChampsSensibles(compte) {
  const { motdepasse, tokenActivation, tokenActivationExpiration, ...reste } = compte;
  return reste;
}

async function listerEmplacements(req, res) {
  const { role, codeStructure, statut } = req.query;

  if (!role || !TABLE_PAR_ROLE[role]) {
    return res.status(400).json({ success: false, message: 'Role invalide.', errors: [] });
  }

  const table = TABLE_PAR_ROLE[role]();
  const where = {};

  if (role === 'TECHNICIEN') {
    if (codeStructure) {
      const structure = await prisma.structure.findUnique({ where: { codeStructure } });
      const responsable = structure
        ? await prisma.responsableEquipeTechnique.findUnique({ where: { structureId: structure.id } })
        : null;
      where.responsableId = responsable ? responsable.id : 0;
    }
  } else if (codeStructure) {
    where.structure = { codeStructure };
  }

  const emplacements = await table.findMany({
    where,
    include: role === 'TECHNICIEN' ? { responsable: { include: { structure: true } } } : { structure: true },
    orderBy: { username: 'asc' },
  });

  const donnees = emplacements
    .map((emplacement) => ({
      id: emplacement.id,
      username: emplacement.username,
      statut: statutEmplacement(emplacement),
      structure: role === 'TECHNICIEN' ? emplacement.responsable.structure : emplacement.structure,
      agentMatricule: emplacement.agentMatricule,
    }))
    .filter((emplacement) => !statut || emplacement.statut === statut);

  return res.status(200).json({ success: true, data: donnees });
}

async function creerEmplacement(req, res) {
  const { role, codeStructure } = req.body;

  if (!role || !TABLE_PAR_ROLE[role] || !codeStructure) {
    return res.status(400).json({ success: false, message: 'Role et structure sont obligatoires.', errors: [] });
  }

  const structure = await prisma.structure.findUnique({ where: { codeStructure } });

  if (!structure) {
    return res.status(404).json({ success: false, message: 'Structure introuvable.', errors: [] });
  }

  if (role === 'RESPONSABLE' || role === 'POINT_FOCAL') {
    const table = TABLE_PAR_ROLE[role]();
    const existant = await table.findUnique({ where: { structureId: structure.id } });

    if (existant) {
      return res.status(409).json({
        success: false,
        message: `Cette structure a deja un emplacement ${LIBELLE_ROLE[role]}.`,
        errors: [],
      });
    }

    const suffixe = role === 'POINT_FOCAL' ? 'PF' : 'RES';

    const emplacement = await table.create({
      data: { username: `${codeStructure}-${suffixe}1`, structureId: structure.id },
    });

    return res.status(201).json({ success: true, message: 'Emplacement cree.', data: emplacement });
  }

  const responsable = await prisma.responsableEquipeTechnique.findUnique({ where: { structureId: structure.id } });

  if (!responsable) {
    return res.status(409).json({
      success: false,
      message: 'Cette structure n\'a pas encore d\'emplacement Responsable.',
      errors: [],
    });
  }

  const techniciensExistants = await prisma.technicien.count({ where: { responsableId: responsable.id } });

  const emplacement = await prisma.technicien.create({
    data: { username: `${codeStructure}-TEC${techniciensExistants + 1}`, responsableId: responsable.id },
  });

  return res.status(201).json({ success: true, message: 'Emplacement cree.', data: emplacement });
}

async function attribuer(req, res) {
  const { agentMatricule, role, username } = req.body;

  if (!agentMatricule || !role || !TABLE_PAR_ROLE[role] || !username) {
    return res.status(400).json({ success: false, message: 'agentMatricule, role et username sont obligatoires.', errors: [] });
  }

  const agent = await prisma.agent.findUnique({ where: { matricule: Number(agentMatricule) } });

  if (!agent || !agent.actif) {
    return res.status(404).json({ success: false, message: 'Agent introuvable ou inactif.', errors: [] });
  }

  const table = TABLE_PAR_ROLE[role]();
  const emplacement = await table.findUnique({ where: { username } });

  if (!emplacement) {
    return res.status(404).json({ success: false, message: 'Emplacement introuvable.', errors: [] });
  }

  if (emplacement.agentMatricule) {
    return res.status(409).json({ success: false, message: 'Cet emplacement est deja attribue.', errors: [] });
  }

  const dejaTitulaire = await table.findUnique({ where: { agentMatricule: agent.matricule } });

  if (dejaTitulaire) {
    return res.status(409).json({
      success: false,
      message: `Cet agent detient deja un compte ${LIBELLE_ROLE[role]}.`,
      errors: [],
    });
  }

  await table.update({
    where: { id: emplacement.id },
    data: { agentMatricule: agent.matricule, telephone: agent.numero },
  });

  await envoyerLienPourEmplacement(role, emplacement.id);

  return res.status(200).json({ success: true, message: 'Agent rattache, lien d\'activation envoye.' });
}

async function renvoyerLien(req, res) {
  const { role, username } = req.body;

  if (!role || !TABLE_PAR_ROLE[role] || !username) {
    return res.status(400).json({ success: false, message: 'Role et username sont obligatoires.', errors: [] });
  }

  const table = TABLE_PAR_ROLE[role]();
  const emplacement = await table.findUnique({ where: { username } });

  if (!emplacement) {
    return res.status(404).json({ success: false, message: 'Emplacement introuvable.', errors: [] });
  }

  if (!emplacement.agentMatricule) {
    return res.status(409).json({ success: false, message: 'Cet emplacement n\'est rattache a aucun agent.', errors: [] });
  }

  await table.update({ where: { id: emplacement.id }, data: { motdepasse: null } });
  await envoyerLienPourEmplacement(role, emplacement.id);

  return res.status(200).json({ success: true, message: 'Nouveau lien envoye.' });
}

async function liberer(req, res) {
  const { role, username } = req.body;

  if (!role || !TABLE_PAR_ROLE[role] || !username) {
    return res.status(400).json({ success: false, message: 'Role et username sont obligatoires.', errors: [] });
  }

  const table = TABLE_PAR_ROLE[role]();
  const emplacement = await table.findUnique({ where: { username } });

  if (!emplacement) {
    return res.status(404).json({ success: false, message: 'Emplacement introuvable.', errors: [] });
  }

  await table.update({
    where: { id: emplacement.id },
    data: {
      agentMatricule: null,
      motdepasse: null,
      tokenActivation: null,
      tokenActivationExpiration: null,
      username: `LIBRE-${emplacement.id}`,
    },
  });

  return res.status(200).json({ success: true, message: 'Emplacement libere.' });
}

async function listerResponsables(req, res) {
  const responsables = await prisma.responsableEquipeTechnique.findMany({
    include: { structure: true },
    orderBy: { username: 'asc' },
  });

  return res.status(200).json({ success: true, data: responsables.map(retirerChampsSensibles) });
}

async function listerTechniciens(req, res) {
  const filtres = {};

  if (req.query.responsableId) {
    filtres.responsableId = Number(req.query.responsableId);
  }

  if (req.compte.typeCompte === 'RESPONSABLE') {
    filtres.responsableId = req.compte.id;
  }

  const techniciens = await prisma.technicien.findMany({
    where: filtres,
    include: { responsable: { include: { structure: true } } },
    orderBy: { username: 'asc' },
  });

  return res.status(200).json({ success: true, data: techniciens.map(retirerChampsSensibles) });
}

async function listerPointsFocaux(req, res) {
  const pointsFocaux = await prisma.pointFocal.findMany({
    include: { structure: true },
    orderBy: { username: 'asc' },
  });

  return res.status(200).json({ success: true, data: pointsFocaux.map(retirerChampsSensibles) });
}

async function desactiverResponsable(req, res) {
  const responsable = await prisma.responsableEquipeTechnique.findUnique({ where: { id: Number(req.params.id) } });

  if (!responsable) {
    return res.status(404).json({ success: false, message: 'Responsable introuvable.', errors: [] });
  }

  await prisma.responsableEquipeTechnique.update({ where: { id: responsable.id }, data: { actif: false } });
  await prisma.sessionToken.updateMany({
    where: { typeCompte: 'RESPONSABLE', compteId: responsable.id },
    data: { revoque: true },
  });

  return res.status(200).json({ success: true, message: 'Responsable desactive.' });
}

async function reactiverResponsable(req, res) {
  const responsable = await prisma.responsableEquipeTechnique.findUnique({ where: { id: Number(req.params.id) } });

  if (!responsable) {
    return res.status(404).json({ success: false, message: 'Responsable introuvable.', errors: [] });
  }

  await prisma.responsableEquipeTechnique.update({ where: { id: responsable.id }, data: { actif: true } });

  return res.status(200).json({ success: true, message: 'Responsable reactive.' });
}

async function desactiverTechnicien(req, res) {
  const technicien = await prisma.technicien.findUnique({ where: { id: Number(req.params.id) } });

  if (!technicien) {
    return res.status(404).json({ success: false, message: 'Technicien introuvable.', errors: [] });
  }

  await prisma.technicien.update({ where: { id: technicien.id }, data: { actif: false } });
  await prisma.sessionToken.updateMany({
    where: { typeCompte: 'TECHNICIEN', compteId: technicien.id },
    data: { revoque: true },
  });

  return res.status(200).json({ success: true, message: 'Technicien desactive.' });
}

async function reactiverTechnicien(req, res) {
  const technicien = await prisma.technicien.findUnique({ where: { id: Number(req.params.id) } });

  if (!technicien) {
    return res.status(404).json({ success: false, message: 'Technicien introuvable.', errors: [] });
  }

  await prisma.technicien.update({ where: { id: technicien.id }, data: { actif: true } });

  return res.status(200).json({ success: true, message: 'Technicien reactive.' });
}

async function desactiverPointFocal(req, res) {
  const pointFocal = await prisma.pointFocal.findUnique({ where: { id: Number(req.params.id) } });

  if (!pointFocal) {
    return res.status(404).json({ success: false, message: 'Point focal introuvable.', errors: [] });
  }

  await prisma.pointFocal.update({ where: { id: pointFocal.id }, data: { actif: false } });
  await prisma.sessionToken.updateMany({
    where: { typeCompte: 'POINT_FOCAL', compteId: pointFocal.id },
    data: { revoque: true },
  });

  return res.status(200).json({ success: true, message: 'Point focal desactive.' });
}

async function reactiverPointFocal(req, res) {
  const pointFocal = await prisma.pointFocal.findUnique({ where: { id: Number(req.params.id) } });

  if (!pointFocal) {
    return res.status(404).json({ success: false, message: 'Point focal introuvable.', errors: [] });
  }

  await prisma.pointFocal.update({ where: { id: pointFocal.id }, data: { actif: true } });

  return res.status(200).json({ success: true, message: 'Point focal reactive.' });
}

module.exports = {
  listerEmplacements,
  creerEmplacement,
  attribuer,
  renvoyerLien,
  liberer,
  listerResponsables,
  listerTechniciens,
  listerPointsFocaux,
  desactiverResponsable,
  reactiverResponsable,
  desactiverTechnicien,
  reactiverTechnicien,
  desactiverPointFocal,
  reactiverPointFocal,
};