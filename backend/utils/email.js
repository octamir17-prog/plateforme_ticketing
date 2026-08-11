// ===== IMPORTS =====
// (aucun import externe, fetch est natif)

// ===== CONSTANTES GLOBALES =====
const EMAIL_CONFIG = {
  senderEmail: process.env.EMAIL_FROM || 'noreply@sante-benin.bj',
  senderName: 'Ministère de la Santé - Plateforme de Tickets',
  replyTo: process.env.EMAIL_FROM || 'noreply@sante-benin.bj',
};

// ===== FONCTIONS UTILITAIRES =====

function origineFrontendPourLiens() {
  const brut = process.env.FRONTEND_URL || '';
  const premiere = brut.split(',')[0].trim();
  return premiere;
}

function genererHtmlGeneral(nomComplet, titre, contenuLignes) {
  const contenuHtml = contenuLignes.map((ligne) => {
    if (ligne === '') return '<br>';
    return `<p style="margin: 12px 0; line-height: 1.6;">${ligne}</p>`;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="background-color: white; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="border-bottom: 3px solid #15aabf; padding-bottom: 15px; margin-bottom: 20px;">
      <h2 style="color: #15aabf; margin: 0; font-size: 20px;">${titre}</h2>
    </div>
    
    <!-- Contenu -->
    <div style="color: #333; font-size: 14px;">
      <p style="margin: 0 0 12px 0; line-height: 1.6;"><strong>Bonjour ${nomComplet},</strong></p>
      ${contenuHtml}
    </div>
    
    <!-- Footer -->
    <div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 15px; font-size: 12px; color: #666; text-align: center;">
      <p style="margin: 5px 0;">Ministère de la Santé — République du Bénin</p>
      <p style="margin: 5px 0;">Plateforme de Gestion des Tickets IT</p>
      <p style="margin: 5px 0; font-size: 11px; color: #999;">Ne pas répondre directement à cet email</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ===== FONCTION D'ENVOI BREVO =====

async function envoyer(destinataire, sujet, htmlContenu, textContenu) {
  try {
    const reponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: EMAIL_CONFIG.senderName, email: EMAIL_CONFIG.senderEmail },
        replyTo: { email: EMAIL_CONFIG.replyTo },
        to: [{ email: destinataire }],
        subject: sujet,
        htmlContent: htmlContenu,
        textContent: textContenu, // Fallback pour les clients qui ne supportent pas le HTML
      }),
    });

    if (!reponse.ok) {
      const erreurTexte = await reponse.text();
      console.error(`Erreur envoi email (${sujet}) :`, reponse.status, erreurTexte);
      return false;
    }

    return true;
  } catch (erreur) {
    console.error(`Erreur envoi email (${sujet}) :`, erreur.message);
    return false;
  }
}

// ===== CONTRÔLEURS D'ENVOI =====

async function envoyerCodeInscription(destinataire, nomComplet, code) {
  const sujet = 'Code de vérification - Connexion au portail de tickets du Ministère de la Santé';
  const contenuTexte = `Bonjour ${nomComplet},\n\nVotre code de vérification est : ${code}\n\nCe code est valable 3 minutes.`;
  const contenuHtml = genererHtmlGeneral(
    nomComplet,
    'Code de vérification',
    [
      'Votre code de vérification est :',
      `<strong style="font-size: 18px; color: #15aabf; letter-spacing: 2px;">${code}</strong>`,
      '',
      'Ce code est valable <strong>3 minutes</strong>.',
    ]
  );

  return envoyer(destinataire, sujet, contenuHtml, contenuTexte);
}

async function envoyerCodeReinitialisation(destinataire, nomComplet, code) {
  const sujet = 'Réinitialisation de votre mot de passe';
  const contenuTexte = `Bonjour ${nomComplet},\n\nVous avez demandé la réinitialisation de votre mot de passe.\n\nVotre code de vérification est : ${code}\n\nCe code est valable 3 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.`;
  const contenuHtml = genererHtmlGeneral(
    nomComplet,
    'Réinitialisation de mot de passe',
    [
      'Vous avez demandé la réinitialisation de votre mot de passe.',
      '',
      'Votre code de vérification est :',
      `<strong style="font-size: 18px; color: #15aabf; letter-spacing: 2px;">${code}</strong>`,
      '',
      'Ce code est valable <strong>3 minutes</strong>.',
      '',
      '<em>Si vous n\'êtes pas à l\'origine de cette demande, ignorez ce message.</em>',
    ]
  );

  return envoyer(destinataire, sujet, contenuHtml, contenuTexte);
}

async function envoyerLienActivation(destinataire, nomComplet, libelleRole, structureDesignation, token) {
  const urlActivation = `${origineFrontendPourLiens()}/activation/${token}`;
  const sujet = `Activation de votre compte ${libelleRole}`;
  const contenuTexte = `Bonjour ${nomComplet},\n\nVous avez été désigné ${libelleRole} pour la structure : ${structureDesignation}.\n\nRendez-vous sur le lien ci-dessous pour choisir votre identifiant et votre mot de passe :\n${urlActivation}\n\nCe lien est valable 24 heures et ne peut être utilisé qu'une seule fois.`;
  const contenuHtml = genererHtmlGeneral(
    nomComplet,
    `Activation de compte ${libelleRole}`,
    [
      `Vous avez été désigné <strong>${libelleRole}</strong> pour la structure :`,
      `<strong style="color: #15aabf;">${structureDesignation}</strong>`,
      '',
      'Rendez-vous sur le lien ci-dessous pour choisir votre identifiant et votre mot de passe :',
      `<a href="${urlActivation}" style="display: inline-block; background-color: #15aabf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Activer mon compte</a>`,
      '',
      'Ou copiez ce lien :',
      `<code style="background-color: #f0f0f0; padding: 8px; border-radius: 4px; display: block; word-break: break-all;">${urlActivation}</code>`,
      '',
      '<em>Ce lien est valable <strong>24 heures</strong> et ne peut être utilisé qu\'une seule fois.</em>',
    ]
  );

  return envoyer(destinataire, sujet, contenuHtml, contenuTexte);
}

async function envoyerConfirmationActivation(destinataire, nomComplet, libelleRole) {
  const urlConnexionStaff = `${origineFrontendPourLiens()}/connexion-staff`;
  const sujet = 'Votre compte est actif';
  const contenuTexte = `Bonjour ${nomComplet},\n\nVotre compte ${libelleRole} est maintenant actif.\n\nConnectez-vous ici : ${urlConnexionStaff}\n\nConservez ce lien, il vous servira pour vos prochaines connexions.`;
  const contenuHtml = genererHtmlGeneral(
    nomComplet,
    'Votre compte est actif',
    [
      `Votre compte <strong>${libelleRole}</strong> est maintenant actif.`,
      '',
      'Connectez-vous ici :',
      `<a href="${urlConnexionStaff}" style="display: inline-block; background-color: #15aabf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Accéder à la plateforme</a>`,
      '',
      'Ou copiez ce lien :',
      `<code style="background-color: #f0f0f0; padding: 8px; border-radius: 4px; display: block; word-break: break-all;">${urlConnexionStaff}</code>`,
      '',
      '<em>Conservez ce lien, il vous servira pour vos prochaines connexions.</em>',
    ]
  );

  return envoyer(destinataire, sujet, contenuHtml, contenuTexte);
}

async function envoyerRelanceManuelle(destinataire, nomComplet, referenceTicket, titreTicket, nomAgent) {
  const sujet = `Relance sur le ticket ${referenceTicket}`;
  const contenuTexte = `Bonjour ${nomComplet},\n\n${nomAgent} vous relance concernant le ticket ${referenceTicket} : ${titreTicket}\n\nCe ticket est en attente de prise en charge.`;
  const contenuHtml = genererHtmlGeneral(
    nomComplet,
    `Relance - Ticket ${referenceTicket}`,
    [
      `<strong>${nomAgent}</strong> vous relance concernant :`,
      `<strong style="color: #15aabf;">Ticket ${referenceTicket}</strong> : ${titreTicket}`,
      '',
      'Ce ticket est en attente de prise en charge.',
    ]
  );

  return envoyer(destinataire, sujet, contenuHtml, contenuTexte);
}

async function envoyerRelanceAutomatique(destinataire, nomComplet, referenceTicket, titreTicket, nombreJours) {
  const sujet = `Retard de traitement - ticket ${referenceTicket}`;
  const contenuTexte = `Bonjour ${nomComplet},\n\nLe ticket ${referenceTicket} (${titreTicket}) n'a pas été démarré depuis plus de ${nombreJours} jours.\n\nMerci de prendre en charge ce ticket ou de le réaffecter.`;
  const contenuHtml = genererHtmlGeneral(
    nomComplet,
    `Retard de traitement - Ticket ${referenceTicket}`,
    [
      `Le ticket <strong style="color: #15aabf;">Ticket ${referenceTicket}</strong> (${titreTicket})`,
      `n'a pas été démarré depuis plus de <strong style="color: #d9534f;">${nombreJours} jours</strong>.`,
      '',
      'Merci de prendre en charge ce ticket ou de le réaffecter.',
    ]
  );

  return envoyer(destinataire, sujet, contenuHtml, contenuTexte);
}

// ===== MODULE EXPORTS =====
module.exports = {
  envoyerCodeInscription,
  envoyerCodeReinitialisation,
  envoyerLienActivation,
  envoyerConfirmationActivation,
  envoyerRelanceManuelle,
  envoyerRelanceAutomatique,
};