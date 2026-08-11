// ===== IMPORTS =====
const prisma = require('../prisma/client');
const { verifierAccessToken } = require('../utils/jwt');

// ===== CONSTANTES GLOBALES =====
const TABLES_PAR_TYPE = {
  UTILISATEUR: 'utilisateur',
  TECHNICIEN: 'technicien',
  RESPONSABLE: 'responsableEquipeTechnique',
  POINT_FOCAL: 'pointFocal',
  ADMIN: 'admin',
};

// ===== FONCTIONS UTILITAIRES =====

function extraireTokenDuHeader(enTete) {
  if (!enTete || !enTete.startsWith('Bearer ')) {
    return null;
  }
  return enTete.split(' ')[1];
}

async function chargerCompte(typeCompte, compteId) {
  const nomTable = TABLES_PAR_TYPE[typeCompte];
  if (!nomTable) {
    return null;
  }

  const table = prisma[nomTable];
  return table.findUnique({ where: { id: compteId } });
}

// ===== MIDDLEWARES =====

async function authentifier(req, res, next) {
  const enTete = req.headers.authorization;
  const token = extraireTokenDuHeader(enTete);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token manquant.', errors: [] });
  }

  let payload;
  try {
    payload = verifierAccessToken(token);
  } catch (erreur) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expire.', errors: [] });
  }

  const compte = await chargerCompte(payload.typeCompte, payload.id);

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

// ===== MODULE EXPORTS =====
module.exports = { authentifier, autoriser };