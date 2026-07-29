const prisma = require('../prisma/client');

async function lister(req, res) {
  const categories = await prisma.categorie.findMany({
    orderBy: { id: 'asc' },
  });

  return res.status(200).json({ success: true, data: categories });
}

module.exports = { lister };
