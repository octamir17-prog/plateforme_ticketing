const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/type.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');

routeur.use(authentifier);

routeur.get('/', controleur.lister);
routeur.post('/', autoriser('ADMIN'), controleur.creer);

module.exports = routeur;