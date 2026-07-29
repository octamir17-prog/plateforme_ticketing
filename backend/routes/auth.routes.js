const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/auth.controller');
const { authentifier } = require('../middlewares/auth.middleware');

routeur.post('/verifier-agent', controleur.verifierAgent);
routeur.post('/renvoyer-code', controleur.renvoyerCode);
routeur.post('/verifier-code', controleur.verifierCode);
routeur.patch('/profil-agent', controleur.corrigerProfilAgent);
routeur.post('/inscription/finaliser', controleur.finaliserInscription);

routeur.get('/activation/:token', controleur.consulterActivation);
routeur.post('/activation/:token', controleur.activerCompte);

routeur.post('/login', controleur.login);
routeur.post('/refresh', controleur.refresh);
routeur.post('/logout', authentifier, controleur.logout);
routeur.get('/me', authentifier, controleur.moi);
routeur.put('/changer-mot-de-passe', authentifier, controleur.changerMotDePasse);

module.exports = routeur;