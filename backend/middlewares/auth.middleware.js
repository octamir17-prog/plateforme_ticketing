const prisma = require('../prisma/client');
const { verifierAccessToken } = require('../utils/jwt');

const TABLES_PAR_TYPE = {
  UTILISATEUR: 'utilisateur',
  TECHNICIEN: 'technicien',
  RESPONSABLE: 'responsableEquipeTechnique',
  POINT_FOCAL: 'pointFocal',
  ADMIN: 'admin',
};

async function authentifier(req, res, next) {
  const enTete = req.headers.authorization;

  if (!enTete || !enTete.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant.', errors: [] });
  }

  const token = enTete.split(' ')[1];

  let payload;
  try {
    payload = verifierAccessToken(token);
  } catch (erreur) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expire.', errors: [] });
  }

  const table = prisma[TABLES_PAR_TYPE[payload.typeCompte]];
  const compte = await table.findUnique({ where: { id: payload.id } });

  if (!compte) {
    return res.status(401).json({ success: false, message: 'Compte introuvable.', errors: [] });
  }

  if (payload.typeCompte !== 'ADMIN' && !compte.actif) {
    return res.status(403).json({ success: false, message: 'Compte desactive.', errors: [] });
  }

  req.compte = payload;
  next();
}

function autoriser(...typesAutorises) {
  return (req, res, next) => {
    if (!typesAutorises.includes(req.compte.typeCompte)) {
      return res.status(403).json({ success: false, message: 'Acces refuse.', errors: [] });
    }
    next();
  };
}

module.exports = { authentifier, autoriser };