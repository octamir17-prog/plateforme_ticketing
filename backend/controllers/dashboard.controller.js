const prisma = require('../prisma/client');

const LIGNE_ACTIVE = { transfere: false, escalade: false, retourne: false };

function debutDuMois() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function utilisateur(req, res) {
  const agentMatricule = req.compte.agentMatricule;

  const [total, soumis, enCours, clotures] = await Promise.all([
    prisma.ticket.count({ where: { agentMatricule } }),
    prisma.ticket.count({ where: { agentMatricule, statut: 'SOUMIS' } }),
    prisma.ticket.count({ where: { agentMatricule, statut: { in: ['AFFECTE', 'EN_COURS'] } } }),
    prisma.ticket.count({ where: { agentMatricule, statut: 'CLOTURE' } }),
  ]);

  return res.status(200).json({ success: true, data: { total, soumis, enCours, clotures } });
}

async function technicien(req, res) {
  const technicienId = req.compte.id;

  const [affectes, enTraitement, cloturesDuMois] = await Promise.all([
    prisma.affectation.count({
      where: { technicienId, statut: 'EN_ATTENTE', ...LIGNE_ACTIVE },
    }),
    prisma.affectation.count({
      where: { technicienId, statut: 'EN_TRAITEMENT', ...LIGNE_ACTIVE },
    }),
    prisma.affectation.count({
      where: { technicienId, statut: 'CLOTUREE', dateFinTrait: { gte: debutDuMois() } },
    }),
  ]);

  return res.status(200).json({ success: true, data: { affectes, enTraitement, cloturesDuMois } });
}

async function responsable(req, res) {
  const responsableId = req.compte.id;

  const [nonAffectes, enCours, escaladesEnCours, techniciensCount] = await Promise.all([
    prisma.affectation.count({
      where: { responsableId, technicienId: null, ...LIGNE_ACTIVE },
    }),
    prisma.affectation.count({
      where: { responsableId, technicienId: { not: null }, statut: { in: ['EN_ATTENTE', 'EN_TRAITEMENT'] }, ...LIGNE_ACTIVE },
    }),
    prisma.affectation.count({
      where: { responsableId, escalade: true },
    }),
    prisma.technicien.count({
      where: { responsableId, actif: true },
    }),
  ]);

  return res.status(200).json({ success: true, data: { nonAffectes, enCours, escaladesEnCours, techniciensCount } });
}

async function admin(req, res) {
  const [agents, structures, ticketsTotal, ticketsSoumis, ticketsEnCours, ticketsClotures] = await Promise.all([
    prisma.agent.count(),
    prisma.structure.count(),
    prisma.ticket.count(),
    prisma.ticket.count({ where: { statut: 'SOUMIS' } }),
    prisma.ticket.count({ where: { statut: { in: ['AFFECTE', 'EN_COURS'] } } }),
    prisma.ticket.count({ where: { statut: 'CLOTURE' } }),
  ]);

  return res.status(200).json({
    success: true,
    data: { agents, structures, ticketsTotal, ticketsSoumis, ticketsEnCours, ticketsClotures },
  });
}

module.exports = { utilisateur, technicien, responsable, admin };