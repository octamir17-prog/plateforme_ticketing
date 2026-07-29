const prisma = require('../prisma/client');

function retirerOrdre(niveau) {
  const { ordre, ...reste } = niveau;
  return reste;
}

async function lister(req, res) {
  const niveaux = await prisma.niveau.findMany({ orderBy: { ordre: 'asc' } });

  if (req.compte.typeCompte === 'ADMIN') {
    return res.status(200).json({ success: true, data: niveaux });
  }

  return res.status(200).json({ success: true, data: niveaux.map(retirerOrdre) });
}

async function creer(req, res) {
  const { libelle, ordre } = req.body;

  if (!libelle || ordre === undefined) {
    return res.status(400).json({ success: false, message: 'Libelle et ordre obligatoires.', errors: [] });
  }

  const niveau = await prisma.niveau.create({ data: { libelle, ordre: Number(ordre) } });

  return res.status(201).json({ success: true, message: 'Niveau cree.', data: niveau });
}

module.exports = { lister, creer };