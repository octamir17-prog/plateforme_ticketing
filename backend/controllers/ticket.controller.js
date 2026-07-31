const prisma = require('../prisma/client');
const { envoyerRelanceManuelle } = require('../utils/email');

const DELAI_RELANCE_HEURES = 24;

const LIGNE_ACTIVE = { transfere: false, escalade: false, retourne: false };

function genererReference() {
  return `TCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function creer(req, res) {
  const { titre, description, categorieId } = req.body;

  if (!titre || !description || !categorieId) {
    return res.status(400).json({ success: false, message: 'Le titre, la description et la categorie sont obligatoires.', errors: [] });
  }

  const agent = await prisma.agent.findUnique({
    where: { matricule: req.compte.agentMatricule },
  });

  if (!agent || !agent.actif) {
    return res.status(403).json({ success: false, message: 'Compte agent inactif.', errors: [] });
  }

  const categorie = await prisma.categorie.findUnique({ where: { id: Number(categorieId) } });

  if (!categorie) {
    return res.status(404).json({ success: false, message: 'Categorie introuvable.', errors: [] });
  }

  const responsable = await prisma.responsableEquipeTechnique.findUnique({
    where: { structureId: agent.structureId },
  });

  if (!responsable || !responsable.actif) {
    return res.status(409).json({
      success: false,
      message: 'Aucun responsable equipe technique actif pour votre structure, le ticket ne peut pas etre enregistre.',
      errors: [],
    });
  }

  const cheminPieceJointe = req.file ? `uploads/tickets/${req.file.filename}` : null;

  const ticket = await prisma.$transaction(async (tx) => {
    const ticketCree = await tx.ticket.create({
      data: {
        reference: genererReference(),
        titre,
        description,
        categorieId: Number(categorieId),
        agentMatricule: agent.matricule,
        pieceJointe: cheminPieceJointe,
      },
    });

    await tx.affectation.create({
      data: {
        ticketId: ticketCree.id,
        responsableId: responsable.id,
      },
    });

    return ticketCree;
  });

  return res.status(201).json({ success: true, message: 'Ticket cree.', data: ticket });
}

async function listerPourUtilisateur(req, res) {
  const tickets = await prisma.ticket.findMany({
    where: { agentMatricule: req.compte.agentMatricule },
    include: { categorie: true },
    orderBy: { dateCreation: 'desc' },
  });

  return res.status(200).json({ success: true, data: tickets });
}

function formaterLigne(affectation) {
  return {
    ...affectation.ticket,
    affectation: {
      id: affectation.id,
      statut: affectation.statut,
      priorite: affectation.priorite,
      dateAffectation: affectation.dateAffectation,
      dateDebutTrait: affectation.dateDebutTrait,
      dateFinTrait: affectation.dateFinTrait,
      technicienId: affectation.technicienId,
      technicien: affectation.technicien,
      responsableId: affectation.responsableId,
      commentaire: affectation.commentaire,
      recuParEscalade: affectation.affectationPrecedente ? affectation.affectationPrecedente.escalade : false,
    },
  };
}

async function listerPourResponsable(req, res) {
  const affectations = await prisma.affectation.findMany({
    where: {
      responsableId: req.compte.id,
      ...LIGNE_ACTIVE,
    },
    include: {
      ticket: {
        include: {
          categorie: true,
          agent: { select: { matricule: true, nom: true, prenom: true, numero: true, structureId: true } },
        },
      },
      technicien: { select: { id: true, username: true } },
      affectationPrecedente: { select: { escalade: true } },
    },
    orderBy: { id: 'desc' },
  });

  return res.status(200).json({ success: true, data: affectations.map(formaterLigne) });
}

async function listerPourTechnicien(req, res) {
  const affectations = await prisma.affectation.findMany({
    where: {
      technicienId: req.compte.id,
      ...LIGNE_ACTIVE,
    },
    include: {
      ticket: {
        include: {
          categorie: true,
          agent: { select: { matricule: true, nom: true, prenom: true, numero: true, structureId: true } },
        },
      },
      technicien: { select: { id: true, username: true } },
      affectationPrecedente: { select: { escalade: true } },
    },
    orderBy: { id: 'desc' },
  });

  return res.status(200).json({ success: true, data: affectations.map(formaterLigne) });
}

async function lister(req, res) {
  if (req.compte.typeCompte === 'UTILISATEUR') {
    return listerPourUtilisateur(req, res);
  }

  if (req.compte.typeCompte === 'RESPONSABLE') {
    return listerPourResponsable(req, res);
  }

  if (req.compte.typeCompte === 'TECHNICIEN') {
    return listerPourTechnicien(req, res);
  }

  return res.status(403).json({ success: false, message: 'Ce type de compte ne consulte pas de tickets.', errors: [] });
}

async function obtenir(req, res) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      categorie: true,
      agent: { select: { matricule: true, nom: true, prenom: true, numero: true, email: true, structureId: true } },
      affectations: {
        include: {
          responsable: { select: { id: true, username: true, structureId: true } },
          technicien: { select: { id: true, username: true } },
        },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket introuvable.', errors: [] });
  }

  if (req.compte.typeCompte === 'UTILISATEUR' && ticket.agentMatricule !== req.compte.agentMatricule) {
    return res.status(403).json({ success: false, message: 'Ce ticket ne vous appartient pas.', errors: [] });
  }

  if (req.compte.typeCompte === 'RESPONSABLE') {
    const concerne = ticket.affectations.some((affectation) => affectation.responsableId === req.compte.id);

    if (!concerne) {
      return res.status(403).json({ success: false, message: 'Ce ticket ne releve pas de votre structure.', errors: [] });
    }
  }

  if (req.compte.typeCompte === 'TECHNICIEN') {
    const concerne = ticket.affectations.some((affectation) => affectation.technicienId === req.compte.id);

    if (!concerne) {
      return res.status(403).json({ success: false, message: 'Ce ticket ne vous a jamais ete affecte.', errors: [] });
    }
  }

  return res.status(200).json({ success: true, data: ticket });
}

async function relancer(req, res) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(req.params.id) },
    include: { agent: true },
  });

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket introuvable.', errors: [] });
  }

  if (ticket.agentMatricule !== req.compte.agentMatricule) {
    return res.status(403).json({ success: false, message: 'Ce ticket ne vous appartient pas.', errors: [] });
  }

  if (ticket.statut === 'CLOTURE') {
    return res.status(409).json({ success: false, message: 'Ce ticket est deja cloture.', errors: [] });
  }

  if (ticket.derniereRelanceAt) {
    const prochaineRelancePossible = new Date(ticket.derniereRelanceAt);
    prochaineRelancePossible.setHours(prochaineRelancePossible.getHours() + DELAI_RELANCE_HEURES);

    if (prochaineRelancePossible > new Date()) {
      return res.status(429).json({
        success: false,
        message: `Vous ne pouvez relancer qu'une fois toutes les ${DELAI_RELANCE_HEURES} heures pour ce ticket.`,
        errors: [],
      });
    }
  }

  const affectationActive = await prisma.affectation.findFirst({
    where: { ticketId: ticket.id, ...LIGNE_ACTIVE },
    include: { responsable: { include: { agent: true } } },
  });

  if (!affectationActive) {
    return res.status(409).json({ success: false, message: 'Aucune affectation active pour ce ticket.', errors: [] });
  }

  const responsable = affectationActive.responsable;
  const nomResponsable = responsable.agent ? `${responsable.agent.prenom} ${responsable.agent.nom}` : responsable.username;
  const emailResponsable = responsable.agent ? responsable.agent.email : null;

  if (!emailResponsable) {
    return res.status(409).json({ success: false, message: 'Adresse email du responsable introuvable.', errors: [] });
  }

  await envoyerRelanceManuelle(
    emailResponsable,
    nomResponsable,
    ticket.reference,
    ticket.titre,
    `${ticket.agent.prenom} ${ticket.agent.nom}`,
  );

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { derniereRelanceAt: new Date() },
  });

  return res.status(200).json({ success: true, message: 'Relance envoyee au responsable.' });
}

module.exports = { creer, lister, obtenir, relancer };