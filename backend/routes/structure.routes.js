const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/structure.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');

routeur.use(authentifier);

routeur.get('/', controleur.lister);
routeur.get('/:id/escaladables', controleur.escaladables);
routeur.get('/:id/retournables', controleur.retournables);
routeur.post('/', autoriser('ADMIN'), controleur.creer);
routeur.put('/:id', autoriser('ADMIN'), controleur.modifier);
routeur.delete('/:id', autoriser('ADMIN'), controleur.supprimer);

module.exports = routeur;