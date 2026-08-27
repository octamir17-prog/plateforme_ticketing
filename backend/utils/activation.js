const crypto = require('crypto');
const { envoyerLienActivation, envoyerLienActivationDouble } = require('./email');
const { TABLE_PAR_ROLE, LIBELLE_ROLE, inclusionPourRole, extraireStructure } = require('./roles');

const DUREE_TOKEN_ACTIVATION_HEURES = 24;

async function envoyerLienPourEmplacement(role, compteId) {
  const table = TABLE_PAR_ROLE[role]();
  const compte = await table.findUnique({ where: { id: compteId }, include: inclusionPourRole(role) });

  const token = crypto.randomBytes(32).toString('hex');
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + DUREE_TOKEN_ACTIVATION_HEURES);

  await table.update({
    where: { id: compteId },
    data: { tokenActivation: token, tokenActivationExpiration: expiration },
  });

  const structure = extraireStructure(role, compte);

  return envoyerLienActivation(
    compte.agent.email,
    `${compte.agent.prenom} ${compte.agent.nom}`,
    LIBELLE_ROLE[role],
    structure.designation,
    token,
  );
}

// Cas du compte jumeau (Responsable + Technicien) : le compte qui vient d'etre cree
// recoit toujours un nouveau token. Le compte jumeau existant n'en recoit un que s'il
// n'est pas deja actif (motdepasse null) -- sinon un seul lien est envoye.
async function envoyerLiensActivationJumeaux(nouveauRole, nouveauCompteId, roleJumeau, compteJumeauId) {
  const tableNouveau = TABLE_PAR_ROLE[nouveauRole]();
  const tableJumeau = TABLE_PAR_ROLE[roleJumeau]();

  const [compteNouveau, compteJumeau] = await Promise.all([
    tableNouveau.findUnique({ where: { id: nouveauCompteId }, include: inclusionPourRole(nouveauRole) }),
    tableJumeau.findUnique({ where: { id: compteJumeauId }, include: inclusionPourRole(roleJumeau) }),
  ]);

  const expiration = new Date();
  expiration.setHours(expiration.getHours() + DUREE_TOKEN_ACTIVATION_HEURES);

  const tokenNouveau = crypto.randomBytes(32).toString('hex');
  await tableNouveau.update({
    where: { id: nouveauCompteId },
    data: { tokenActivation: tokenNouveau, tokenActivationExpiration: expiration },
  });

  const structure = extraireStructure(nouveauRole, compteNouveau);
  const nomComplet = `${compteNouveau.agent.prenom} ${compteNouveau.agent.nom}`;

  // Compte jumeau deja actif : un seul lien a envoyer, pour le nouveau compte.
  if (compteJumeau.motdepasse) {
    return envoyerLienActivation(
      compteNouveau.agent.email,
      nomComplet,
      LIBELLE_ROLE[nouveauRole],
      structure.designation,
      tokenNouveau,
    );
  }

  const tokenJumeau = crypto.randomBytes(32).toString('hex');
  await tableJumeau.update({
    where: { id: compteJumeauId },
    data: { tokenActivation: tokenJumeau, tokenActivationExpiration: expiration },
  });

  return envoyerLienActivationDouble(
    compteNouveau.agent.email,
    nomComplet,
    structure.designation,
    { libelleRole: LIBELLE_ROLE[nouveauRole], token: tokenNouveau },
    { libelleRole: LIBELLE_ROLE[roleJumeau], token: tokenJumeau },
  );
}

module.exports = { envoyerLienPourEmplacement, envoyerLiensActivationJumeaux };
