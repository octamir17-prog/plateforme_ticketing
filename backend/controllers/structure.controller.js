const prisma = require('../prisma/client');

function masquerOrdre(structure) {
  if (!structure.niveau) {
    return structure;
  }

  const { ordre, ...niveauSansOrdre } = structure.niveau;

  return { ...structure, niveau: niveauSansOrdre };
}

async function lister(req, res) {
  const structures = await prisma.structure.findMany({
    include: { type: true, niveau: true },
    orderBy: { designation: 'asc' },
  });

  return res.status(200).json({ success: true, data: structures.map(masquerOrdre) });
}

async function creer(req, res) {
  const { codeStructure, designation, typeId, niveauId, nomResponsable, prenomResponsable, mailResponsable, numResponsable } = req.body;

  if (!codeStructure || !designation || !typeId || !niveauId) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants.', errors: [] });
  }

  const structure = await prisma.structure.create({
    data: {
      codeStructure,
      designation,
      typeId: Number(typeId),
      niveauId: Number(niveauId),
      nomResponsable,
      prenomResponsable,
      mailResponsable,
      numResponsable,
    },
  });

  return res.status(201).json({ success: true, message: 'Structure creee.', data: structure });
}

async function modifier(req, res) {
  const { codeStructure, designation, typeId, niveauId, nomResponsable, prenomResponsable, mailResponsable, numResponsable } = req.body;

  const structure = await prisma.structure.update({
    where: { id: Number(req.params.id) },
    data: {
      codeStructure,
      designation,
      typeId: typeId ? Number(typeId) : undefined,
      niveauId: niveauId ? Number(niveauId) : undefined,
      nomResponsable,
      prenomResponsable,
      mailResponsable,
      numResponsable,
    },
  });

  return res.status(200).json({ success: true, message: 'Structure modifiee.', data: structure });
}

async function supprimer(req, res) {
  const structureId = Number(req.params.id);

  const agentsLies = await prisma.agent.count({ where: { structureId } });

  if (agentsLies > 0) {
    return res.status(409).json({ success: false, message: 'Impossible de supprimer une structure liee a des agents.', errors: [] });
  }

  const responsableLie = await prisma.responsableEquipeTechnique.count({ where: { structureId } });

  if (responsableLie > 0) {
    return res.status(409).json({ success: false, message: 'Impossible de supprimer une structure qui a un responsable equipe technique.', errors: [] });
  }

  const pointFocalLie = await prisma.pointFocal.count({ where: { structureId } });

  if (pointFocalLie > 0) {
    return res.status(409).json({ success: false, message: 'Impossible de supprimer une structure qui a un point focal.', errors: [] });
  }

  await prisma.structure.delete({ where: { id: structureId } });

  return res.status(200).json({ success: true, message: 'Structure supprimee.' });
}

async function escaladables(req, res) {
  const structure = await prisma.structure.findUnique({
    where: { id: Number(req.params.id) },
    include: { niveau: true },
  });

  if (!structure) {
    return res.status(404).json({ success: false, message: 'Structure introuvable.', errors: [] });
  }

  const structures = await prisma.structure.findMany({
    where: {
      id: { not: structure.id },
      niveau: { ordre: { lte: structure.niveau.ordre } },
    },
    include: { type: true, niveau: true },
    orderBy: { niveau: { ordre: 'asc' } },
  });

  return res.status(200).json({ success: true, data: structures.map(masquerOrdre) });
}

async function retournables(req, res) {
  const structure = await prisma.structure.findUnique({
    where: { id: Number(req.params.id) },
    include: { niveau: true },
  });

  if (!structure) {
    return res.status(404).json({ success: false, message: 'Structure introuvable.', errors: [] });
  }

  const structures = await prisma.structure.findMany({
    where: { niveau: { ordre: { gt: structure.niveau.ordre } } },
    include: { type: true, niveau: true },
    orderBy: { niveau: { ordre: 'asc' } },
  });

  return res.status(200).json({ success: true, data: structures.map(masquerOrdre) });
}

module.exports = { lister, creer, modifier, supprimer, escaladables, retournables };