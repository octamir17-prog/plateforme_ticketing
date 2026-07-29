const multer = require('multer');
const path = require('path');

const EXTENSIONS_AUTORISEES = ['.xlsx', '.xls'];

const stockageMemoire = multer.memoryStorage();

function filtrerFichier(req, file, cb) {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!EXTENSIONS_AUTORISEES.includes(extension)) {
    return cb(new Error('FORMAT_NON_AUTORISE'));
  }

  return cb(null, true);
}

const uploadExcel = multer({
  storage: stockageMemoire,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: filtrerFichier,
});

module.exports = uploadExcel;