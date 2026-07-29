const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/ticket.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

routeur.use(authentifier);

routeur.post(
  '/',
  autoriser('UTILISATEUR'),
  (req, res, next) => {
    if (req.is('multipart/form-data')) {
      return upload.single('pieceJointe')(req, res, next);
    }
    return next();
  },
  controleur.creer,
);

routeur.get('/', controleur.lister);
routeur.get('/:id', controleur.obtenir);
routeur.post('/:id/relancer', autoriser('UTILISATEUR'), controleur.relancer);

module.exports = routeur;