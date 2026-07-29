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

module.exports = { lister, creer };