const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/categorie.controller');
const { authentifier } = require('../middlewares/auth.middleware');

routeur.use(authentifier);
routeur.get('/', controleur.lister);

module.exports = routeur;
