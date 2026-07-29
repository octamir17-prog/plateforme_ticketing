const fs = require('fs');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const FORMATS_AUTORISES = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.xls', '.xlsx', '.txt'];

const destination = path.join(__dirname, '..', 'uploads', 'tickets');
fs.mkdirSync(destination, { recursive: true });

const stockage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, destination),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

function filtrerFichier(req, file, cb) {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!FORMATS_AUTORISES.includes(extension)) {
    return cb(new Error('FORMAT_NON_AUTORISE'));
  }

  return cb(null, true);
}

const upload = multer({
  storage: stockage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: filtrerFichier,
});

module.exports = upload;