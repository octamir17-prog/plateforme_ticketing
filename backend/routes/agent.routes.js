const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/agent.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');
const uploadExcel = require('../middlewares/importExcel.middleware');

routeur.use(authentifier);

routeur.post('/import', autoriser('ADMIN'), uploadExcel.single('fichier'), controleur.importerAgents);

routeur.post('/', autoriser('POINT_FOCAL'), controleur.creer);
routeur.get('/', autoriser('POINT_FOCAL'), controleur.lister);
routeur.put('/:matricule', autoriser('POINT_FOCAL'), controleur.modifier);
routeur.patch('/:matricule/desactiver', autoriser('POINT_FOCAL'), controleur.desactiver);
routeur.patch('/:matricule/reactiver', autoriser('POINT_FOCAL'), controleur.reactiver);

module.exports = routeur;