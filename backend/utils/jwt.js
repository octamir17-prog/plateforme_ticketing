const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const DUREE_ACCESS = process.env.JWT_ACCESS_EXPIRES || '15m';
const DUREE_REFRESH = process.env.JWT_REFRESH_EXPIRES || '7d';

function genererAccessToken(compte, typeCompte) {
  const payload = { id: compte.id, typeCompte };

  if (typeCompte === 'UTILISATEUR') {
    payload.agentMatricule = compte.agentMatricule;
  }

  if (typeCompte === 'RESPONSABLE' || typeCompte === 'POINT_FOCAL') {
    payload.structureId = compte.structureId;
    payload.agentMatricule = compte.agentMatricule;
  }

  if (typeCompte === 'TECHNICIEN') {
    payload.responsableId = compte.responsableId;
    payload.agentMatricule = compte.agentMatricule;

    if (compte.responsable) {
      payload.structureId = compte.responsable.structureId;
    }
  }

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: DUREE_ACCESS });
}

function genererRefreshToken(compte, typeCompte) {
  const jti = randomUUID();
  const token = jwt.sign({ id: compte.id, typeCompte, jti }, process.env.JWT_REFRESH_SECRET, { expiresIn: DUREE_REFRESH });
  return { token, jti };
}

function verifierAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifierRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = { genererAccessToken, genererRefreshToken, verifierAccessToken, verifierRefreshToken };