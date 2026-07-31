const prisma = require('../prisma/client');
const { deriverStatutTicket } = require('../utils/statut');

async function mettreAJourStatutTicket(tx, ticketId, technicienId, statutAffectation) {
  const statut = deriverStatutTicket(technicienId, statutAffectation);

  await tx.ticket.update({
    where: { id: ticketId },
    data: { statut },
  });
}

function estLigneActive(affectation) {
  return !affectation.transfere && !affectation.escalade && !affectation.retourne;
}

function aEteRecuParEscalade(affectation) {
  if (!affectation.affectationPrecedente) {
    return false;
  }
  return affectation.affectationPrecedente.escalade === true;
}

async function chargerAffectation(id) {
  return prisma.affectation.findUnique({
    where: { id: Number(id) },
    include: {
      ticket: true,
      technicien: true,
      affectationPrecedente: {
        include: {
          responsable: {
            include: { structure: true },
          },
        },
      },
      responsable: {
        include: {
          structure: { include: { niveau: true } },
        },
      },
    },
  });
}

async function assignerTechnicien(req, res) {
  const { technicienId, priorite } = req.body;

  if (!technicienId) {
    return res.status(400).json({ success: false, message: 'Le technicien est obligatoire.', errors: [] });
  }

  if (!priorite) {
    return res.status(400).json({ success: false, message: 'La priorite est obligatoire.', errors: [] });
  }

  const affectation = await chargerAffectation(req.params.id);

  if (!affectation) {
    return res.status(404).json({ success: false, message: 'Affectation introuvable.', errors: [] });
  }

  if (affectation.responsableId !== req.compte.id) {
    return res.status(403).json({ success: false, message: 'Cette affectation ne vous appartient pas.', errors: [] });
  }

  const technicien = await prisma.technicien.findUnique({ where: { id: Number(technicienId) } });

  if (!technicien || technicien.responsableId !== req.compte.id) {
    return res.status(403).json({ success: false, message: 'Ce technicien ne fait pas partie de votre equipe.', errors: [] });
  }

  if (!technicien.actif) {
    return res.status(409).json({ success: false, message: 'Ce technicien est desactive.', errors: [] });
  }

  const ligneMiseAJour = await prisma.$transaction(async (tx) => {
    const resultat = await tx.affectation.updateMany({
      where: {
        id: affectation.id,
        technicienId: null,
        transfere: false,
        escalade: false,
        retourne: false,
      },
      data: {
        technicienId: technicien.id,
        dateAffectation: new Date(),
        priorite: priorite || affectation.priorite,
      },
    });

    if (resultat.count === 0) {
      return null;
    }

    await mettreAJourStatutTicket(tx, affectation.ticketId, technicien.id, affectation.statut);

    return tx.affectation.findUnique({ where: { id: affectation.id } });
  });

  if (!ligneMiseAJour) {
    return res.status(409).json({
      success: false,
      message: 'Cette affectation a change d\'etat entre-temps (technicien deja assigne ou ligne inactive).',
      errors: [],
    });
  }

  return res.status(200).json({ success: true, message: 'Technicien assigne.', data: ligneMiseAJour });
}

async function demarrer(req, res) {
  const affectation = await chargerAffectation(req.params.id);

  if (!affectation) {
    return res.status(404).json({ success: false, message: 'Affectation introuvable.', errors: [] });
  }

  if (affectation.technicienId !== req.compte.id) {
    return res.status(403).json({ success: false, message: 'Cette affectation ne vous appartient pas.', errors: [] });
  }

  const ligneMiseAJour = await prisma.$transaction(async (tx) => {
    const resultat = await tx.affectation.updateMany({
      where: {
        id: affectation.id,
        statut: 'EN_ATTENTE',
        transfere: false,
        escalade: false,
        retourne: false,
      },
      data: { statut: 'EN_TRAITEMENT', dateDebutTrait: new Date() },
    });

    if (resultat.count === 0) {
      return null;
    }

    await mettreAJourStatutTicket(tx, affectation.ticketId, affectation.technicienId, 'EN_TRAITEMENT');

    return tx.affectation.findUnique({ where: { id: affectation.id } });
  });

  if (!ligneMiseAJour) {
    return res.status(409).json({
      success: false,
      message: 'Ce traitement ne peut pas etre demarre dans son etat actuel.',
      errors: [],
    });
  }

  return res.status(200).json({ success: true, message: 'Traitement demarre.', data: ligneMiseAJour });
}

async function cloturer(req, res) {
  const { commentaire } = req.body;

  const affectation = await chargerAffectation(req.params.id);

  if (!affectation) {
    return res.status(404).json({ success: false, message: 'Affectation introuvable.', errors: [] });
  }

  if (affectation.technicienId !== req.compte.id) {
    return res.status(403).json({ success: false, message: 'Cette affectation ne vous appartient pas.', errors: [] });
  }

  const ligneMiseAJour = await prisma.$transaction(async (tx) => {
    const resultat = await tx.affectation.updateMany({
      where: {
        id: affectation.id,
        statut: 'EN_TRAITEMENT',
        transfere: false,
        escalade: false,
        retourne: false,
      },
      data: {
        statut: 'CLOTUREE',
        dateFinTrait: new Date(),
        commentaire: commentaire || affectation.commentaire,
      },
    });

    if (resultat.count === 0) {
      return null;
    }

    await mettreAJourStatutTicket(tx, affectation.ticketId, affectation.technicienId, 'CLOTUREE');

    return tx.affectation.findUnique({ where: { id: affectation.id } });
  });

  if (!ligneMiseAJour) {
    return res.status(409).json({
      success: false,
      message: 'Ce ticket ne peut pas etre cloture dans son etat actuel (le traitement doit etre demarre).',
      errors: [],
    });
  }

  return res.status(200).json({ success: true, message: 'Ticket cloture.', data: ligneMiseAJour });
}

async function transferer(req, res) {
  const { nouveauTechnicienId, raisonTransfert, commentaireTransfert } = req.body;

  if (!nouveauTechnicienId || !raisonTransfert) {
    return res.status(400).json({ success: false, message: 'Le nouveau technicien et la raison sont obligatoires.', errors: [] });
  }

  const affectation = await chargerAffectation(req.params.id);

  if (!affectation) {
    return res.status(404).json({ success: false, message: 'Affectation introuvable.', errors: [] });
  }

  if (affectation.responsableId !== req.compte.id) {
    return res.status(403).json({ success: false, message: 'Cette affectation ne releve pas de votre equipe.', errors: [] });
  }

  if (!affectation.technicienId) {
    return res.status(409).json({ success: false, message: 'Aucun technicien assigne, utilisez l\'assignation au lieu du transfert.', errors: [] });
  }

  if (Number(nouveauTechnicienId) === affectation.technicienId) {
    return res.status(409).json({ success: false, message: 'Ce ticket est deja affecte a ce technicien.', errors: [] });
  }

  const nouveauTechnicien = await prisma.technicien.findUnique({ where: { id: Number(nouveauTechnicienId) } });

  if (!nouveauTechnicien || nouveauTechnicien.responsableId !== req.compte.id) {
    return res.status(403).json({ success: false, message: 'Ce technicien ne fait pas partie de votre equipe.', errors: [] });
  }

  if (!nouveauTechnicien.actif) {
    return res.status(409).json({ success: false, message: 'Ce technicien est desactive.', errors: [] });
  }

  let nouvelleAffectation;

  try {
    nouvelleAffectation = await prisma.$transaction(async (tx) => {
      const resultat = await tx.affectation.updateMany({
        where: { id: affectation.id, transfere: false, escalade: false, retourne: false },
        data: {
          transfere: true,
          dateTransfert: new Date(),
          raisonTransfert,
          commentaireTransfert: commentaireTransfert || null,
        },
      });

      if (resultat.count === 0) {
        throw new Error('LIGNE_DEJA_TRAITEE');
      }

      const creee = await tx.affectation.create({
        data: {
          ticketId: affectation.ticketId,
          responsableId: affectation.responsableId,
          technicienId: nouveauTechnicien.id,
          dateAffectation: new Date(),
          priorite: affectation.priorite,
          affectationPrecedenteId: affectation.id,
        },
      });

      await mettreAJourStatutTicket(tx, affectation.ticketId, nouveauTechnicien.id, 'EN_ATTENTE');

      return creee;
    });
  } catch (erreur) {
    if (erreur.message === 'LIGNE_DEJA_TRAITEE') {
      return res.status(409).json({ success: false, message: 'Cette affectation a change d\'etat entre-temps.', errors: [] });
    }
    throw erreur;
  }

  return res.status(201).json({ success: true, message: 'Ticket transfere.', data: nouvelleAffectation });
}

async function escalader(req, res) {
  const { codeStructureCible, raisonEscalade, commentaireEscalade } = req.body;

  if (!codeStructureCible) {
    return res.status(400).json({ success: false, message: 'La structure cible est obligatoire.', errors: [] });
  }

  const affectation = await chargerAffectation(req.params.id);

  if (!affectation) {
    return res.status(404).json({ success: false, message: 'Affectation introuvable.', errors: [] });
  }

  const estResponsableTitulaire = req.compte.typeCompte === 'RESPONSABLE' && affectation.responsableId === req.compte.id;
  const estTechnicienTitulaire = req.compte.typeCompte === 'TECHNICIEN' && affectation.technicienId === req.compte.id;

  if (!estResponsableTitulaire && !estTechnicienTitulaire) {
    return res.status(403).json({ success: false, message: 'Vous n\'avez pas la main sur ce ticket.', errors: [] });
  }

  if (!estLigneActive(affectation)) {
    return res.status(409).json({ success: false, message: 'Cette affectation a deja ete transferee, escaladee ou retournee.', errors: [] });
  }

  if (affectation.statut === 'CLOTUREE') {
    return res.status(409).json({ success: false, message: 'Ce ticket est deja cloture.', errors: [] });
  }

  const structureCible = await prisma.structure.findUnique({
    where: { codeStructure: codeStructureCible },
    include: { niveau: true },
  });

  if (!structureCible) {
    return res.status(404).json({ success: false, message: 'Structure cible introuvable.', errors: [] });
  }

  const structureActuelle = affectation.responsable.structure;

  if (structureCible.id === structureActuelle.id) {
    return res.status(409).json({ success: false, message: 'La structure cible est la structure actuelle.', errors: [] });
  }

  if (structureCible.niveau.ordre > structureActuelle.niveau.ordre) {
    return res.status(409).json({
      success: false,
      message: 'L\'escalade doit se faire vers une structure de niveau superieur ou de meme niveau.',
      errors: [],
    });
  }

  const vientDUneEscalade = affectation.affectationPrecedente && affectation.affectationPrecedente.escalade === true;
  const structureOrigine = vientDUneEscalade ? affectation.affectationPrecedente.responsable.structure : null;

  if (structureOrigine && structureOrigine.id === structureCible.id) {
    return res.status(409).json({
      success: false,
      message: 'Impossible d\'escalader vers la structure dont ce ticket vient d\'etre recu.',
      errors: [],
    });
  }

  const responsableCible = await prisma.responsableEquipeTechnique.findUnique({
    where: { structureId: structureCible.id },
  });

  if (!responsableCible || !responsableCible.actif) {
    return res.status(409).json({
      success: false,
      message: 'Cette structure n\'a pas de responsable equipe technique actif.',
      errors: [],
    });
  }

  let nouvelleAffectation;

  try {
    nouvelleAffectation = await prisma.$transaction(async (tx) => {
      const resultat = await tx.affectation.updateMany({
        where: { id: affectation.id, transfere: false, escalade: false, retourne: false },
        data: {
          escalade: true,
          dateEscalade: new Date(),
          raisonEscalade: raisonEscalade || null,
          commentaireEscalade: commentaireEscalade || null,
        },
      });

      if (resultat.count === 0) {
        throw new Error('LIGNE_DEJA_TRAITEE');
      }

      const creee = await tx.affectation.create({
        data: {
          ticketId: affectation.ticketId,
          responsableId: responsableCible.id,
          priorite: affectation.priorite,
          affectationPrecedenteId: affectation.id,
        },
      });

      await mettreAJourStatutTicket(tx, affectation.ticketId, null, 'EN_ATTENTE');

      return creee;
    });
  } catch (erreur) {
    if (erreur.message === 'LIGNE_DEJA_TRAITEE') {
      return res.status(409).json({ success: false, message: 'Cette affectation a change d\'etat entre-temps.', errors: [] });
    }
    throw erreur;
  }

  return res.status(201).json({ success: true, message: 'Ticket escalade.', data: nouvelleAffectation });
}

async function retourner(req, res) {
  const { raisonRetour, commentaireRetour } = req.body;

  if (!raisonRetour) {
    return res.status(400).json({ success: false, message: 'La raison du retour est obligatoire.', errors: [] });
  }

  const affectation = await chargerAffectation(req.params.id);

  if (!affectation) {
    return res.status(404).json({ success: false, message: 'Affectation introuvable.', errors: [] });
  }

  if (affectation.responsableId !== req.compte.id) {
    return res.status(403).json({ success: false, message: 'Cette affectation ne vous appartient pas.', errors: [] });
  }

  if (!estLigneActive(affectation)) {
    return res.status(409).json({ success: false, message: 'Cette affectation a deja ete transferee, escaladee ou retournee.', errors: [] });
  }

  if (affectation.statut === 'CLOTUREE') {
    return res.status(409).json({ success: false, message: 'Ce ticket est deja cloture.', errors: [] });
  }

  if (!aEteRecuParEscalade(affectation)) {
    return res.status(409).json({
      success: false,
      message: 'Seul un ticket recu par escalade peut etre retourne a la structure d\'origine.',
      errors: [],
    });
  }

  const responsableOrigineId = affectation.affectationPrecedente.responsableId;

  const responsableOrigine = await prisma.responsableEquipeTechnique.findUnique({
    where: { id: responsableOrigineId },
  });

  if (!responsableOrigine || !responsableOrigine.actif) {
    return res.status(409).json({
      success: false,
      message: 'Le responsable de la structure d\'origine n\'est plus actif.',
      errors: [],
    });
  }

  let nouvelleAffectation;

  try {
    nouvelleAffectation = await prisma.$transaction(async (tx) => {
      const resultat = await tx.affectation.updateMany({
        where: { id: affectation.id, transfere: false, escalade: false, retourne: false },
        data: {
          retourne: true,
          dateRetour: new Date(),
          raisonRetour,
          commentaireRetour: commentaireRetour || null,
        },
      });

      if (resultat.count === 0) {
        throw new Error('LIGNE_DEJA_TRAITEE');
      }

      const creee = await tx.affectation.create({
        data: {
          ticketId: affectation.ticketId,
          responsableId: responsableOrigine.id,
          priorite: affectation.priorite,
          affectationPrecedenteId: affectation.id,
        },
      });

      await mettreAJourStatutTicket(tx, affectation.ticketId, null, 'EN_ATTENTE');

      return creee;
    });
  } catch (erreur) {
    if (erreur.message === 'LIGNE_DEJA_TRAITEE') {
      return res.status(409).json({ success: false, message: 'Cette affectation a change d\'etat entre-temps.', errors: [] });
    }
    throw erreur;
  }

  return res.status(201).json({ success: true, message: 'Ticket retourne a la structure d\'origine.', data: nouvelleAffectation });
}

module.exports = { assignerTechnicien, demarrer, cloturer, transferer, escalader, retourner };