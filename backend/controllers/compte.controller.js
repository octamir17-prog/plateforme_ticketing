// ===== IMPORTS =====
const prisma = require('../prisma/client');
const { TABLE_PAR_ROLE, LIBELLE_ROLE } = require('../utils/roles');
const { envoyerLienPourEmplacement } = require('../utils/activation');

// ===== CONSTANTES GLOBALES =====
// (aucune constante globale supplémentaire, utils et prisma suffisent)

// ===== FONCTIONS UTILITAIRES =====

function statutEmplacement(compte, role) {
  if (compte.motdepasse) {
    return 'ACTIVE';
  }

  if (compte.agentMatricule) {
    return 'ATTRIBUE';
  }

  if (role === 'TECHNICIEN') {
    return 'LIBRE_DEFINITIF';
  }

  return 'LIBRE';
}

function retirerChampsSensibles(compte) {
  const { motdepasse, tokenActivation, tokenActivationExpiration, ...reste } = compte;
  return reste;
}

// ===== CONTRÔLEURS =====

async function listerEmplacements(req, res) {
  const { role, codeStructure, statut } = req.query;

  if (role && !TABLE_PAR_ROLE[role]) {
    return res.status(400).json({ success: false, message: 'Role invalide.', errors: [] });
  }

  const rolesAParcourir = role ? [role] : Object.keys(TABLE_PAR_ROLE);
  let donnees = [];

  for (const roleCourant of rolesAParcourir) {
    const table = TABLE_PAR_ROLE[roleCourant]();
    const where = {};

    if (roleCourant === 'TECHNICIEN') {
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
      include: roleCourant === 'TECHNICIEN'
        ? { responsable: { include: { structure: true } }, agent: true }
        : { structure: true, agent: true },
      orderBy: { username: 'asc' },
    });

    donnees = donnees.concat(
      emplacements.map((emplacement) => ({
        id: emplacement.id,
        username: emplacement.username,
        role: roleCourant,
        statut: statutEmplacement(emplacement, roleCourant),
        structure: roleCourant === 'TECHNICIEN' ? emplacement.responsable.structure : emplacement.structure,
        agentMatricule: emplacement.agentMatricule,
        agent: emplacement.agent ? { nom: emplacement.agent.nom, prenom: emplacement.agent.prenom } : null,
      }))
    );
  }

  donnees = donnees.filter((emplacement) => emplacement.statut !== 'LIBRE');
  donnees = donnees.filter((emplacement) => !statut || emplacement.statut === statut);

  const ordreStatut = { ACTIVE: 0, ATTRIBUE: 1, LIBRE: 2, LIBRE_DEFINITIF: 3 };
  donnees.sort((a, b) => (ordreStatut[a.statut] ?? 99) - (ordreStatut[b.statut] ?? 99));

  return res.status(200).json({ success: true, data: donnees });
}

async function designer(req, res) {
  const { role, codeStructure, agentMatricule } = req.body;

  if (!role || !TABLE_PAR_ROLE[role] || !codeStructure || !agentMatricule) {
    return res.status(400).json({
      success: false,
      message: 'role, codeStructure et agentMatricule sont obligatoires.',
      errors: [],
    });
  }

  const structure = await prisma.structure.findUnique({ where: { codeStructure } });

  if (!structure) {
    return res.status(404).json({ success: false, message: 'Structure introuvable.', errors: [] });
  }

  const agent = await prisma.agent.findUnique({ where: { matricule: Number(agentMatricule) } });

  if (!agent || !agent.actif) {
    return res.status(404).json({ success: false, message: 'Agent introuvable ou inactif.', errors: [] });
  }

  if (agent.structureId !== structure.id) {
    return res.status(409).json({
      success: false,
      message: "Cet agent n'appartient pas a la structure choisie.",
      errors: [],
    });
  }

  const table = TABLE_PAR_ROLE[role]();

  // Cas RESPONSABLE / POINT_FOCAL : 1 emplacement par structure (contrainte unique)
  if (role === 'RESPONSABLE' || role === 'POINT_FOCAL') {
    const dejaTitulaire = await table.findUnique({ where: { agentMatricule: agent.matricule } });

    if (dejaTitulaire) {
      return res.status(409).json({
        success: false,
        message: `Cet agent detient deja un compte ${LIBELLE_ROLE[role]}.`,
        errors: [],
      });
    }

    let emplacement = await table.findUnique({ where: { structureId: structure.id } });

    if (emplacement && emplacement.agentMatricule) {
      return res.status(409).json({
        success: false,
        message: `Cette structure a deja un ${LIBELLE_ROLE[role]} designe.`,
        errors: [],
      });
    }

    if (emplacement) {
      emplacement = await table.update({
        where: { id: emplacement.id },
        data: { agentMatricule: agent.matricule, telephone: agent.numero, username: `PENDING-${emplacement.id}` },
      });
    } else {
      emplacement = await table.create({
        data: { structureId: structure.id, agentMatricule: agent.matricule, telephone: agent.numero, username: `PENDING-${structure.id}-${role}` },
      });
    }

    const emailEnvoye = await envoyerLienPourEmplacement(role, emplacement.id);

    return res.status(201).json({
      success: true,
      message: emailEnvoye
        ? 'Agent designe, lien d\'activation envoye.'
        : 'Agent designe, mais l\'envoi de l\'email a echoue. Utilisez "Renvoyer le lien" ou verifiez la configuration Brevo.',
      data: { emailEnvoye },
    });
  }

  // Cas TECHNICIEN : plusieurs par responsable, pas de contrainte unique sur structureId
  const responsable = await prisma.responsableEquipeTechnique.findUnique({ where: { structureId: structure.id } });

  if (!responsable) {
    return res.status(409).json({
      success: false,
      message: "Cette structure n'a pas encore de Responsable designe.",
      errors: [],
    });
  }

  const dejaTitulaire = await prisma.technicien.findUnique({ where: { agentMatricule: agent.matricule } });

  if (dejaTitulaire) {
    return res.status(409).json({ success: false, message: 'Cet agent detient deja un compte Technicien.', errors: [] });
  }

  const emplacement = await prisma.technicien.create({
    data: { responsableId: responsable.id, agentMatricule: agent.matricule, telephone: agent.numero, username: `PENDING-${structure.id}-TEC-${Date.now()}` },
  });

  const emailEnvoye = await envoyerLienPourEmplacement('TECHNICIEN', emplacement.id);

  return res.status(201).json({
    success: true,
    message: emailEnvoye
      ? 'Agent designe, lien d\'activation envoye.'
      : 'Agent designe, mais l\'envoi de l\'email a echoue. Utilisez "Renvoyer le lien" ou verifiez la configuration Brevo.',
    data: { emailEnvoye },
  });
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
    return res.status(409).json({ success: false, message: "Cet emplacement n'est rattache a aucun agent.", errors: [] });
  }

  await table.update({ where: { id: emplacement.id }, data: { motdepasse: null } });

  const emailEnvoye = await envoyerLienPourEmplacement(role, emplacement.id);

  return res.status(200).json({
    success: true,
    message: emailEnvoye
      ? 'Nouveau lien envoye.'
      : 'L\'envoi du lien a echoue. Verifiez la configuration Brevo.',
    data: { emailEnvoye },
  });
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

async function supprimerEmplacement(req, res) {
  const { role, username } = req.body;

  if (!role || !TABLE_PAR_ROLE[role] || !username) {
    return res.status(400).json({ success: false, message: 'Role et username sont obligatoires.', errors: [] });
  }

  const table = TABLE_PAR_ROLE[role]();
  const emplacement = await table.findUnique({ where: { username } });

  if (!emplacement) {
    return res.status(404).json({ success: false, message: 'Emplacement introuvable.', errors: [] });
  }

  if (role === 'RESPONSABLE') {
    const techniciensRattaches = await prisma.technicien.count({ where: { responsableId: emplacement.id } });
    if (techniciensRattaches > 0) {
      return res.status(409).json({
        success: false,
        message: 'Impossible de supprimer : des techniciens sont encore rattaches a ce responsable.',
        errors: [],
      });
    }
  }

  await table.delete({ where: { id: emplacement.id } });

  return res.status(200).json({ success: true, message: 'Emplacement supprime.' });
}

async function listerResponsables(req, res) {
  const responsables = await prisma.responsableEquipeTechnique.findMany({
    include: { structure: true },
    orderBy: { username: 'asc' },
  });

  return res.status(200).json({ success: true, data: responsables.map(retirerChampsSensibles) });
}

async function listerTechniciens(req, res) {
  const filtres = { motdepasse: { not: null }, actif: true };

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

// ===== MODULE EXPORTS =====
module.exports = {
  listerEmplacements,
  designer,
  renvoyerLien,
  liberer,
  supprimerEmplacement,
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