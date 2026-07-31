const nodemailer = require('nodemailer');

function origineFrontendPourLiens() {
  const brut = process.env.FRONTEND_URL || '';
  const premiere = brut.split(',')[0].trim();
  return premiere;
}

const transporteur = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function envoyer(destinataire, sujet, contenu) {
  try {
    await transporteur.sendMail({
      from: process.env.EMAIL_FROM,
      to: destinataire,
      subject: sujet,
      text: contenu,
    });
    return true;
  } catch (erreur) {
    console.error(`Erreur envoi email (${sujet}) :`, erreur.message);
    return false;
  }
}

async function envoyerCodeInscription(destinataire, nomComplet, code) {
  const sujet = 'Code de verification - Inscription';
  const contenu = `Bonjour ${nomComplet},

Votre code de verification est : ${code}

Ce code est valable 1 heure.`;

  return envoyer(destinataire, sujet, contenu);
}

async function envoyerLienActivation(destinataire, nomComplet, libelleRole, structureDesignation, token, suggestionUsername) {
  const urlActivation = `${origineFrontendPourLiens()}/activation/${token}`;
  const sujet = `Activation de votre compte ${libelleRole}`;
  const contenu = `Bonjour ${nomComplet},

Vous avez ete designe ${libelleRole} pour la structure : ${structureDesignation}.

Rendez-vous sur le lien ci-dessous pour choisir votre identifiant et votre mot de passe :
${urlActivation}

Suggestion de nom d'utilisateur : ${suggestionUsername} (vous pouvez en choisir un autre si vous preferez).

Ce lien est valable 24 heures et ne peut etre utilise qu'une seule fois.`;

  return envoyer(destinataire, sujet, contenu);
}

async function envoyerConfirmationActivation(destinataire, nomComplet, libelleRole) {
  const urlConnexionStaff = `${origineFrontendPourLiens()}/connexion-staff`;
  const sujet = 'Votre compte est actif';
  const contenu = `Bonjour ${nomComplet},

Votre compte ${libelleRole} est maintenant actif.

Connectez-vous ici : ${urlConnexionStaff}

Conservez ce lien, il vous servira pour vos prochaines connexions.`;

  return envoyer(destinataire, sujet, contenu);
}

async function envoyerRelanceManuelle(destinataire, nomComplet, referenceTicket, titreTicket, nomAgent) {
  const sujet = `Relance sur le ticket ${referenceTicket}`;
  const contenu = `Bonjour ${nomComplet},

${nomAgent} vous relance concernant le ticket ${referenceTicket} : ${titreTicket}

Ce ticket est en attente de prise en charge.`;

  return envoyer(destinataire, sujet, contenu);
}

async function envoyerRelanceAutomatique(destinataire, nomComplet, referenceTicket, titreTicket, nombreJours) {
  const sujet = `Retard de traitement - ticket ${referenceTicket}`;
  const contenu = `Bonjour ${nomComplet},

Le ticket ${referenceTicket} (${titreTicket}) n'a pas ete demarre depuis plus de ${nombreJours} jours.

Merci de prendre en charge ce ticket ou de le reaffecter.`;

  return envoyer(destinataire, sujet, contenu);
}

module.exports = {
  envoyerCodeInscription,
  envoyerLienActivation,
  envoyerConfirmationActivation,
  envoyerRelanceManuelle,
  envoyerRelanceAutomatique,
};