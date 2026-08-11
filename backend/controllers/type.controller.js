const prisma = require('../prisma/client');

async function lister(req, res) {
  const types = await prisma.type.findMany({ orderBy: { libelle: 'asc' } });
  return res.status(200).json({ success: true, data: types });
}

async function creer(req, res) {
  const { libelle } = req.body;

  if (!libelle) {
    return res.status(400).json({ success: false, message: 'Le libellé est obligatoire.', errors: [] });
  }

  const type = await prisma.type.create({ data: { libelle } });
  return res.status(201).json({ success: true, message: 'Type créé.', data: type });
}

async function modifier(req, res) {
  const { libelle } = req.body;

  if (!libelle) {
    return res.status(400).json({ success: false, message: 'Le libellé est obligatoire.', errors: [] });
  }

  const type = await prisma.type.update({
    where: { id: Number(req.params.id) },
    data: { libelle },
  });

  return res.status(200).json({ success: true, message: 'Type modifié.', data: type });
}

async function supprimer(req, res) {
  const typeId = Number(req.params.id);

  const structuresLiees = await prisma.structure.count({ where: { typeId } });

  if (structuresLiees > 0) {
    return res.status(409).json({ success: false, message: 'Impossible de supprimer un type utilisé par une structure.', errors: [] });
  }

  await prisma.type.delete({ where: { id: typeId } });

  return res.status(200).json({ success: true, message: 'Type supprimé.' });
}

module.exports = { lister, creer, modifier, supprimer };