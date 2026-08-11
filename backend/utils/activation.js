const crypto = require('crypto');
const { envoyerLienActivation } = require('./email');
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

module.exports = { envoyerLienPourEmplacement };