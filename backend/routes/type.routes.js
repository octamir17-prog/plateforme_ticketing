const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/type.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');

routeur.use(authentifier);

routeur.get('/', controleur.lister);
routeur.post('/', autoriser('ADMIN'), controleur.creer);
routeur.put('/:id', autoriser('ADMIN'), controleur.modifier);
routeur.delete('/:id', autoriser('ADMIN'), controleur.supprimer);

module.exports = routeur;