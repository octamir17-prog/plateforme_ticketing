const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/dashboard.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');

routeur.use(authentifier);

routeur.get('/utilisateur', autoriser('UTILISATEUR'), controleur.utilisateur);
routeur.get('/technicien', autoriser('TECHNICIEN'), controleur.technicien);
routeur.get('/responsable', autoriser('RESPONSABLE'), controleur.responsable);
routeur.get('/admin', autoriser('ADMIN'), controleur.admin);

module.exports = routeur;