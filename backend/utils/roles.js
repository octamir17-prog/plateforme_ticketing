const prisma = require('../prisma/client');

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

module.exports = { TABLE_PAR_ROLE, LIBELLE_ROLE, inclusionPourRole, extraireStructure };