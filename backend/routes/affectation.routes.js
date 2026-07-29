const express = require('express');
const routeur = express.Router();
const controleur = require('../controllers/affectation.controller');
const { authentifier, autoriser } = require('../middlewares/auth.middleware');

routeur.use(authentifier);

routeur.patch('/:id/assigner-technicien', autoriser('RESPONSABLE'), controleur.assignerTechnicien);
routeur.post('/:id/demarrer', autoriser('TECHNICIEN'), controleur.demarrer);
routeur.post('/:id/cloturer', autoriser('TECHNICIEN'), controleur.cloturer);
routeur.post('/:id/transferer', autoriser('RESPONSABLE'), controleur.transferer);
routeur.post('/:id/escalader', autoriser('TECHNICIEN', 'RESPONSABLE'), controleur.escalader);
routeur.post('/:id/retourner', autoriser('RESPONSABLE'), controleur.retourner);

module.exports = routeur;