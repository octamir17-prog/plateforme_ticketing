// ===== IMPORTS =====
const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');
const { genererAccessToken, genererRefreshToken, verifierRefreshToken } = require('../utils/jwt');
const { envoyerCodeInscription, envoyerConfirmationActivation, envoyerCodeReinitialisation } = require('../utils/email');
const { TABLE_PAR_ROLE, LIBELLE_ROLE, PREFIXE_PAR_ROLE, inclusionPourRole, extraireStructure } = require('../utils/roles');
const { envoyerLienPourEmplacement } = require('../utils/activation');

// ===== CONSTANTES =====
const TABLES_PAR_TYPE = {
  UTILISATEUR: 'utilisateur',
  TECHNICIEN: 'technicien',
  RESPONSABLE: 'responsableEquipeTechnique',
  POINT_FOCAL: 'pointFocal',
  ADMIN: 'admin',
};

const ROLES_PAR_TYPE_COMPTE = {
  UTILISATEUR: ['UTILISATEUR'],
  STAFF: ['ADMIN', 'RESPONSABLE', 'TECHNICIEN', 'POINT_FOCAL'],
};

// ===== FONCTIONS UTILITAIRES =====

function genererCodeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function usernameExisteDeja(username, excludeTypeCompte, excludeId) {
  const verifications = [
    { type: 'UTILISATEUR', table: prisma.utilisateur },
    { type: 'TECHNICIEN', table: prisma.technicien },
    { type: 'RESPONSABLE', table: prisma.responsableEquipeTechnique },
    { type: 'POINT_FOCAL', table: prisma.pointFocal },
    { type: 'ADMIN', table: prisma.admin },
  ];

  for (const { type, table } of verifications) {
    const compteExistant = await table.findUnique({ where: { username } });
    if (compteExistant && !(type === excludeTypeCompte && compteExistant.id === excludeId)) {
      return true;
    }
  }

  return false;
}

async function trouverCompteParToken(token) {
  for (const role of Object.keys(TABLE_PAR_ROLE)) {
    const table = TABLE_PAR_ROLE[role]();

    const compte = await table.findUnique({
      where: { tokenActivation: token },
      include: inclusionPourRole(role),
    });

    if (compte) {
      return { role, compte };
    }
  }

  return null;
}

async function trouverCompteParUsername(username, rolesAutorises) {
  const comptes = [];
  const typesAParcourir = rolesAutorises || Object.keys(TABLES_PAR_TYPE);
  for (const typeCompte of typesAParcourir) {
    const compte = typeCompte === 'TECHNICIEN'
      ? await prisma.technicien.findUnique({ where: { username }, include: { responsable: true } })
      : await prisma[TABLES_PAR_TYPE[typeCompte]].findUnique({ where: { username } });

    if (compte) {
      comptes.push({ typeCompte, compte });
    }
  }

  return comptes;
}

async function trouverCompteResetParUsername(typeCompte, username) {
  if (typeCompte === 'UTILISATEUR') {
    const compte = await prisma.utilisateur.findUnique({ where: { username } });
    return compte ? { typeCompteReel: 'UTILISATEUR', compte, table: prisma.utilisateur } : null;
  }

  const rolesStaff = ['RESPONSABLE', 'TECHNICIEN', 'POINT_FOCAL'];

  for (const role of rolesStaff) {
    const table = TABLE_PAR_ROLE[role]();
    const compte = await table.findFirst({ where: { username } });

    if (compte) {
      return { typeCompteReel: role, compte, table };
    }
  }

  return null;
}

// ===== CONTRÔLEURS D'AUTHENTIFICATION =====

async function verifierAgent(req, res) {
  const { matricule, numeroTelephone, structureId } = req.body;

  if (!matricule || !numeroTelephone) {
    return res.status(400).json({ success: false, message: 'Matricule et numero de telephone sont obligatoires.', errors: [] });
  }

  if (structureId) {
    const structure = await prisma.structure.findUnique({ where: { id: Number(structureId) } });
    if (!structure) {
      return res.status(400).json({ success: false, message: 'Structure invalide.', errors: [] });
    }
  }

  const agent = await prisma.agent.findUnique({ where: { matricule: Number(matricule) } });

  if (!agent || agent.numero !== numeroTelephone) {
    return res.status(404).json({ success: false, message: 'Matricule ou numero de telephone incorrect.', errors: [] });
  }

  if (structureId && Number(agent.structureId) !== Number(structureId)) {
    return res.status(403).json({ success: false, message: 'Cette structure ne correspond pas a votre compte.', errors: [] });
  }

  if (!agent.actif) {
    return res.status(403).json({ success: false, message: 'Agent inactif.', errors: [] });
  }

  const code = genererCodeOtp();
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 3);

  await prisma.agent.update({
    where: { matricule: agent.matricule },
    data: { codeVerification: code, codeVerificationExpiration: expiration },
  });

  await envoyerCodeInscription(agent.email, `${agent.prenom} ${agent.nom}`, code);

  return res.status(200).json({ success: true, message: 'Code envoye.', data: { otpEnvoye: true } });
}

async function renvoyerCode(req, res) {
  return verifierAgent(req, res);
}

async function verifierCode(req, res) {
  const { matricule, code } = req.body;

  if (!matricule || !code) {
    return res.status(400).json({ success: false, message: 'Matricule et code obligatoires.', errors: [] });
  }

  const agent = await prisma.agent.findUnique({ where: { matricule: Number(matricule) } });

  if (!agent || agent.codeVerification !== code || agent.codeVerificationExpiration < new Date()) {
    return res.status(401).json({ success: false, message: 'Code invalide ou expire.', errors: [] });
  }

  return res.status(200).json({
    success: true,
    message: 'Code valide.',
    data: {
      nom: agent.nom,
      prenom: agent.prenom,
      matricule: agent.matricule,
      numeroTelephone: agent.numero,
      email: agent.email,
    },
  });
}

async function corrigerProfilAgent(req, res) {
  const { matricule, code, nom, prenom } = req.body;

  if (!matricule || !code) {
    return res.status(400).json({ success: false, message: 'Matricule et code obligatoires.', errors: [] });
  }

  const agent = await prisma.agent.findUnique({ where: { matricule: Number(matricule) } });

  if (!agent || agent.codeVerification !== code || agent.codeVerificationExpiration < new Date()) {
    return res.status(401).json({ success: false, message: 'Code invalide ou expire.', errors: [] });
  }

  const agentMisAJour = await prisma.agent.update({
    where: { matricule: agent.matricule },
    data: {
      nom: nom || agent.nom,
      prenom: prenom || agent.prenom,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Profil mis a jour.',
    data: { nom: agentMisAJour.nom, prenom: agentMisAJour.prenom },
  });
}

async function finaliserInscription(req, res) {
  const { matricule, code, username, motdepasse } = req.body;
  if (!username || !motdepasse) {
    return res.status(400).json({ success: false, message: 'Identifiants obligatoires.', errors: [] });
  }

  if (motdepasse.length < 8) {
    return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caracteres.', errors: [] });
  }

  const agent = await prisma.agent.findUnique({ where: { matricule: Number(matricule) } });

  if (!agent || agent.codeVerification !== code || agent.codeVerificationExpiration < new Date()) {
    return res.status(401).json({ success: false, message: 'Code invalide ou expire.', errors: [] });
  }

  if (await usernameExisteDeja(username)) {
    return res.status(409).json({ success: false, message: 'Ce nom d\'utilisateur est deja pris.', errors: [] });
  }

  const compteExistantPourAgent = await prisma.utilisateur.findUnique({ where: { agentMatricule: agent.matricule } });

  if (compteExistantPourAgent) {
    return res.status(409).json({ success: false, message: 'Un compte existe deja pour cet agent.', errors: [] });
  }

  const motdepasseHache = await bcrypt.hash(motdepasse, 10);

  const utilisateur = await prisma.utilisateur.create({
    data: { username, motdepasse: motdepasseHache, telephone: agent.numero, agentMatricule: agent.matricule },
  });

  await prisma.agent.update({
    where: { matricule: agent.matricule },
    data: { codeVerification: null, codeVerificationExpiration: null },
  });

  const { motdepasse: _, ...utilisateurSansMotDePasse } = utilisateur;

  return res.status(201).json({ success: true, message: 'Compte cree.', data: utilisateurSansMotDePasse });
}

async function consulterActivation(req, res) {
  const { token } = req.params;

  const trouve = await trouverCompteParToken(token);

  if (!trouve) {
    return res.status(404).json({ success: false, message: 'Lien d\'activation invalide.', errors: [] });
  }

  const { role, compte } = trouve;

  if (compte.tokenActivationExpiration < new Date()) {
    return res.status(410).json({ success: false, message: 'Ce lien d\'activation a expire.', errors: [] });
  }

  const structure = extraireStructure(role, compte);

  return res.status(200).json({
    success: true,
    data: {
      role,
      prefixeUsername: PREFIXE_PAR_ROLE[role],
      structure: { codeStructure: structure.codeStructure, designation: structure.designation },
      agent: compte.agent ? { nom: compte.agent.nom, prenom: compte.agent.prenom, email: compte.agent.email } : null,
    },
  });
}

async function activerCompte(req, res) {
  const { token } = req.params;
  const { username, motdepasse } = req.body;

  if (!username || !motdepasse) {
    return res.status(400).json({ success: false, message: 'Identifiant et mot de passe obligatoires.', errors: [] });
  }

  if (motdepasse.length < 8) {
    return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caracteres.', errors: [] });
  }

  const trouve = await trouverCompteParToken(token);

  if (!trouve) {
    return res.status(404).json({ success: false, message: 'Lien d\'activation invalide.', errors: [] });
  }

  const { role, compte } = trouve;

  if (compte.tokenActivationExpiration < new Date()) {
    return res.status(410).json({ success: false, message: 'Ce lien d\'activation a expire.', errors: [] });
  }

  const prefixeAttendu = PREFIXE_PAR_ROLE[role];

  if (!username.startsWith(prefixeAttendu)) {
    return res.status(400).json({
      success: false,
      message: `Le nom d'utilisateur doit commencer par ${prefixeAttendu}.`,
      errors: [],
    });
  }

  const table = TABLE_PAR_ROLE[role]();

  if (await usernameExisteDeja(username, role, compte.id)) {
    return res.status(409).json({ success: false, message: 'Ce nom d\'utilisateur est deja pris.', errors: [] });
  }

  const motdepasseHache = await bcrypt.hash(motdepasse, 10);

  await table.update({
    where: { id: compte.id },
    data: {
      username,
      motdepasse: motdepasseHache,
      tokenActivation: null,
      tokenActivationExpiration: null,
    },
  });

  if (compte.agent) {
    await envoyerConfirmationActivation(
      compte.agent.email,
      `${compte.agent.prenom} ${compte.agent.nom}`,
      LIBELLE_ROLE[role],
    );
  }

  return res.status(200).json({ success: true, message: 'Compte active, vous pouvez vous connecter.' });
}

async function login(req, res) {
  const { username, motdepasse, typeCompte } = req.body;

  if (!username || !motdepasse) {
    return res.status(400).json({ success: false, message: 'Champs invalides.', errors: [] });
  }

  const rolesAutorises = ROLES_PAR_TYPE_COMPTE[typeCompte];
  const comptes = await trouverCompteParUsername(username, rolesAutorises);

  if (comptes.length > 1) {
    return res.status(409).json({ success: false, message: 'Ce nom d\'utilisateur correspond a plusieurs comptes. Contactez l\'administrateur.', errors: [] });
  }

  let resolvedTypeCompte;
  let compte;

  if (comptes.length === 1) {
    resolvedTypeCompte = comptes[0].typeCompte;
    compte = comptes[0].compte;
  }

  if (!compte) {
    return res.status(401).json({ success: false, message: 'Identifiants incorrects.', errors: [] });
  }

  if (resolvedTypeCompte !== 'ADMIN' && !compte.actif) {
    return res.status(403).json({ success: false, message: 'Compte desactive.', errors: [] });
  }

  if (!compte.motdepasse) {
    return res.status(403).json({
      success: false,
      message: 'Ce compte n\'est pas encore active, utilisez le lien recu par email.',
      errors: [],
    });
  }

  const motdepasseValide = await bcrypt.compare(motdepasse, compte.motdepasse);

  if (!motdepasseValide) {
    return res.status(401).json({ success: false, message: 'Identifiants incorrects.', errors: [] });
  }

  const accessToken = genererAccessToken(compte, resolvedTypeCompte);
  const { token: refreshToken, jti } = genererRefreshToken(compte, resolvedTypeCompte);

  const dateExpiration = new Date();
  dateExpiration.setDate(dateExpiration.getDate() + 7);

  await prisma.sessionToken.create({
    data: { jti, typeCompte: resolvedTypeCompte, compteId: compte.id, dateExpiration },
  });

  const { motdepasse: _, responsable, ...compteSansMotDePasse } = compte;

  if (resolvedTypeCompte === 'TECHNICIEN') {
    compteSansMotDePasse.structureId = responsable ? responsable.structureId : null;
  }

  return res.status(200).json({
    success: true,
    message: 'Connexion reussie.',
    data: { accessToken, refreshToken, profil: compteSansMotDePasse, typeCompte: resolvedTypeCompte },
  });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token requis.', errors: [] });
  }

  let payload;
  try {
    payload = verifierRefreshToken(refreshToken);
  } catch (erreur) {
    return res.status(401).json({ success: false, message: 'Refresh token invalide ou expire.', errors: [] });
  }

  const session = await prisma.sessionToken.findUnique({ where: { jti: payload.jti } });

  if (!session || session.revoque || session.dateExpiration < new Date()) {
    return res.status(401).json({ success: false, message: 'Session invalide.', errors: [] });
  }

  const compte = payload.typeCompte === 'TECHNICIEN'
    ? await prisma.technicien.findUnique({ where: { id: payload.id }, include: { responsable: true } })
    : await prisma[TABLES_PAR_TYPE[payload.typeCompte]].findUnique({ where: { id: payload.id } });

  if (!compte || (payload.typeCompte !== 'ADMIN' && !compte.actif)) {
    return res.status(401).json({ success: false, message: 'Compte introuvable ou desactive.', errors: [] });
  }

  const accessToken = genererAccessToken(compte, payload.typeCompte);

  return res.status(200).json({ success: true, message: 'Token renouvele.', data: { accessToken } });
}

async function logout(req, res) {
  const { refreshToken } = req.body;

  if (refreshToken) {
    try {
      const payload = verifierRefreshToken(refreshToken);
      await prisma.sessionToken.updateMany({ where: { jti: payload.jti }, data: { revoque: true } });
    } catch (erreur) {
      // token deja invalide, rien a faire
    }
  }

  return res.status(200).json({ success: true, message: 'Deconnexion reussie.' });
}

async function moi(req, res) {
  const table = prisma[TABLES_PAR_TYPE[req.compte.typeCompte]];

  const compte = req.compte.typeCompte === 'TECHNICIEN'
    ? await table.findUnique({ where: { id: req.compte.id }, include: { responsable: true } })
    : await table.findUnique({ where: { id: req.compte.id } });

  if (!compte) {
    return res.status(404).json({ success: false, message: 'Compte introuvable.', errors: [] });
  }

  const { motdepasse: _, responsable, ...compteSansMotDePasse } = compte;

  if (req.compte.typeCompte === 'TECHNICIEN') {
    compteSansMotDePasse.structureId = responsable ? responsable.structureId : null;
  }

  return res.status(200).json({ success: true, data: { ...compteSansMotDePasse, typeCompte: req.compte.typeCompte } });
}

async function demanderReinitialisationMotDePasse(req, res) {
  const { typeCompte, username, telephone, structure } = req.body;

  if (!username || !telephone) {
    return res.status(400).json({ success: false, message: 'Username et telephone obligatoires.', errors: [] });
  }

  if (typeCompte === 'STAFF' && !structure) {
    return res.status(400).json({ success: false, message: 'La structure est obligatoire pour le personnel.', errors: [] });
  }

  let compteTrouve = null;
  let typeCompteReel = null;

  if (typeCompte === 'UTILISATEUR') {
    const candidat = await prisma.utilisateur.findUnique({
      where: { username },
      include: { agent: true },
    });

    if (candidat && candidat.telephone === String(telephone)) {
      compteTrouve = candidat;
      typeCompteReel = 'UTILISATEUR';
    }
  } else {
    const rolesStaff = ['RESPONSABLE', 'TECHNICIEN', 'POINT_FOCAL'];

    for (const role of rolesStaff) {
      const table = TABLE_PAR_ROLE[role]();
      const whereStructure = role === 'TECHNICIEN'
        ? { responsable: { structure: { codeStructure: { equals: String(structure), mode: 'insensitive' } } } }
        : { structure: { codeStructure: { equals: String(structure), mode: 'insensitive' } } };

      const candidat = await table.findFirst({
        where: { username, telephone: String(telephone), ...whereStructure },
        include: inclusionPourRole(role),
      });

      if (candidat) {
        compteTrouve = candidat;
        typeCompteReel = role;
        break;
      }
    }
  }

  if (!compteTrouve) {
    return res.status(404).json({
      success: false,
      message: typeCompte === 'STAFF'
        ? 'Informations incorrectes. Verifiez votre username, telephone et structure.'
        : 'Informations incorrectes. Verifiez votre username et telephone.',
      errors: [],
    });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiration = new Date(Date.now() + 3 * 60 * 1000);

  const tablePourEcriture = typeCompteReel === 'UTILISATEUR' ? prisma.utilisateur : TABLE_PAR_ROLE[typeCompteReel]();

  await tablePourEcriture.update({
    where: { id: compteTrouve.id },
    data: {
      codeReinitialisation: code,
      codeReinitialisationExpiration: expiration,
    },
  });

  const email = compteTrouve.agent?.email;
  const nomComplet = compteTrouve.agent ? `${compteTrouve.agent.prenom} ${compteTrouve.agent.nom}` : username;

  if (email) {
    await envoyerCodeReinitialisation(email, nomComplet, code);
  } else {
    console.error(`Reset mot de passe : aucun email associe pour ${typeCompteReel}:${username}`);
  }

  return res.status(200).json({ success: true, message: 'Code de verification envoye.', data: { resetReady: true } });
}

async function verifierReinitialisationMotDePasse(req, res) {
  const { typeCompte, username, code } = req.body;

  if (!typeCompte || !username || !code) {
    return res.status(400).json({ success: false, message: 'Type, username et code obligatoires.', errors: [] });
  }

  const trouve = await trouverCompteResetParUsername(typeCompte, username);

  if (!trouve || !trouve.compte.codeReinitialisation) {
    return res.status(404).json({ success: false, message: 'Aucune demande de reinitialisation trouvee.', errors: [] });
  }

  const { compte } = trouve;

  if (compte.codeReinitialisation !== String(code)) {
    return res.status(400).json({ success: false, message: 'Code invalide.', errors: [] });
  }

  if (!compte.codeReinitialisationExpiration || compte.codeReinitialisationExpiration < new Date()) {
    return res.status(410).json({ success: false, message: 'Code expire.', errors: [] });
  }

  return res.status(200).json({ success: true, message: 'Code valide.', data: { verified: true } });
}

async function finaliserReinitialisationMotDePasse(req, res) {
  const { typeCompte, username, code, nouveauMotDePasse } = req.body;

  if (!typeCompte || !username || !code || !nouveauMotDePasse) {
    return res.status(400).json({ success: false, message: 'Champs requis manquants.', errors: [] });
  }

  if (nouveauMotDePasse.length < 8) {
    return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit contenir au moins 8 caracteres.', errors: [] });
  }

  const trouve = await trouverCompteResetParUsername(typeCompte, username);

  if (!trouve || !trouve.compte.codeReinitialisation) {
    return res.status(404).json({ success: false, message: 'Aucune demande de reinitialisation trouvee.', errors: [] });
  }

  const { compte, table } = trouve;

  if (compte.codeReinitialisation !== String(code)) {
    return res.status(400).json({ success: false, message: 'Code invalide.', errors: [] });
  }

  if (!compte.codeReinitialisationExpiration || compte.codeReinitialisationExpiration < new Date()) {
    return res.status(410).json({ success: false, message: 'Code expire.', errors: [] });
  }

  const motdepasseHache = await bcrypt.hash(nouveauMotDePasse, 10);

  await table.update({
    where: { id: compte.id },
    data: {
      motdepasse: motdepasseHache,
      codeReinitialisation: null,
      codeReinitialisationExpiration: null,
    },
  });

  return res.status(200).json({ success: true, message: 'Mot de passe reinitialise.' });
}

async function changerMotDePasse(req, res) {
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;

  if (!ancienMotDePasse || !nouveauMotDePasse) {
    return res.status(400).json({ success: false, message: 'Champs requis manquants.', errors: [] });
  }

  if (nouveauMotDePasse.length < 8) {
    return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit contenir au moins 8 caracteres.', errors: [] });
  }

  const table = prisma[TABLES_PAR_TYPE[req.compte.typeCompte]];
  const compte = await table.findUnique({ where: { id: req.compte.id } });

  const motdepasseValide = await bcrypt.compare(ancienMotDePasse, compte.motdepasse);

  if (!motdepasseValide) {
    return res.status(401).json({ success: false, message: 'Ancien mot de passe incorrect.', errors: [] });
  }

  const nouveauMotDePasseHache = await bcrypt.hash(nouveauMotDePasse, 10);

  await table.update({ where: { id: compte.id }, data: { motdepasse: nouveauMotDePasseHache } });

  return res.status(200).json({ success: true, message: 'Mot de passe modifie.' });
}

// ===== EXPORTS =====
module.exports = {
  verifierAgent,
  renvoyerCode,
  verifierCode,
  corrigerProfilAgent,
  finaliserInscription,
  consulterActivation,
  activerCompte,
  login,
  refresh,
  logout,
  moi,
  demanderReinitialisationMotDePasse,
  verifierReinitialisationMotDePasse,
  finaliserReinitialisationMotDePasse,
  changerMotDePasse,
};