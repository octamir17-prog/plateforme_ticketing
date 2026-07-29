const cron = require('node-cron');
const prisma = require('../prisma/client');
const { envoyerRelanceAutomatique } = require('../utils/email');

const DELAI_JOURS = 2;

async function verifierRetards() {
  const seuil = new Date();
  seuil.setDate(seuil.getDate() - DELAI_JOURS);

  const affectationsEnRetard = await prisma.affectation.findMany({
    where: {
      statut: 'EN_ATTENTE',
      technicienId: { not: null },
      dateDebutTrait: null,
      dateAffectation: { lte: seuil },
      relanceAutoEnvoyee: false,
      transfere: false,
      escalade: false,
      retourne: false,
    },
    include: {
      ticket: true,
      technicien: { include: { agent: true } },
      responsable: { include: { agent: true } },
    },
  });

  for (const affectation of affectationsEnRetard) {
    const technicien = affectation.technicien;
    const responsable = affectation.responsable;

    if (technicien && technicien.agent) {
      await envoyerRelanceAutomatique(
        technicien.agent.email,
        `${technicien.agent.prenom} ${technicien.agent.nom}`,
        affectation.ticket.reference,
        affectation.ticket.titre,
        DELAI_JOURS,
      );
    }

    if (responsable && responsable.agent) {
      await envoyerRelanceAutomatique(
        responsable.agent.email,
        `${responsable.agent.prenom} ${responsable.agent.nom}`,
        affectation.ticket.reference,
        affectation.ticket.titre,
        DELAI_JOURS,
      );
    }

    await prisma.affectation.update({
      where: { id: affectation.id },
      data: { relanceAutoEnvoyee: true },
    });
  }

  if (affectationsEnRetard.length > 0) {
    console.log(`Relance : ${affectationsEnRetard.length} affectation(s) en retard, emails envoyes.`);
  }
}

function demarrerTacheRelance() {
  cron.schedule('0 * * * *', verifierRetards);
  console.log('Tache de relance demarree (verification toutes les heures).');
}

module.exports = { demarrerTacheRelance, verifierRetards };