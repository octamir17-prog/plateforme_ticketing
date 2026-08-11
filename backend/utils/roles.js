// ===== IMPORTS =====
const prisma = require('../prisma/client');

// ===== CONSTANTES GLOBALES =====

const TABLE_PAR_ROLE = {
  RESPONSABLE: () => prisma.responsableEquipeTechnique,
  TECHNICIEN: () => prisma.technicien,
  POINT_FOCAL: () => prisma.pointFocal,
};

const LIBELLE_ROLE = {
  RESPONSABLE: 'Responsable equipe technique',
  TECHNICIEN: 'Technicien',
  POINT_FOCAL: 'Point focal',
};

const PREFIXE_PAR_ROLE = {
  RESPONSABLE: 'RES-',
  TECHNICIEN: 'TEC-',
  POINT_FOCAL: 'PTF-',
};

// ===== FONCTIONS UTILITAIRES =====

function inclusionPourRole(role) {
  if (role === 'TECHNICIEN') {
    return { responsable: { include: { structure: true } }, agent: true };
  }

  return { structure: true, agent: true };
}

function extraireStructure(role, compte) {
  if (role === 'TECHNICIEN') {
    return compte.responsable.structure;
  }

  return compte.structure;
}

// ===== MODULE EXPORTS =====
module.exports = { TABLE_PAR_ROLE, LIBELLE_ROLE, PREFIXE_PAR_ROLE, inclusionPourRole, extraireStructure };