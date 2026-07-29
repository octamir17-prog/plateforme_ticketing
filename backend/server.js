const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth.routes');
const agentRoutes = require('./routes/agent.routes');
const structureRoutes = require('./routes/structure.routes');
const typeRoutes = require('./routes/type.routes');
const niveauRoutes = require('./routes/niveau.routes');
const compteRoutes = require('./routes/compte.routes');
const categorieRoutes = require('./routes/categorie.routes');
const ticketRoutes = require('./routes/ticket.routes');
const affectationRoutes = require('./routes/affectation.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const { gestionnaireNotFound, gestionnaireErreurs } = require('./middlewares/erreur.middleware');
const { demarrerTacheRelance } = require('./jobs/relance');

const app = express();
const PORT = process.env.PORT || 5001;

const originesAutorisees = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origine) => origine.trim())
  .filter((origine) => origine.length > 0);

function verifierOrigine(origine, callback) {
  if (!origine) {
    return callback(null, true);
  }

  if (originesAutorisees.length === 0) {
    return callback(null, true);
  }

  if (originesAutorisees.includes(origine)) {
    return callback(null, true);
  }

  return callback(new Error(`Origine non autorisee : ${origine}`));
}

app.use(cors({ origin: verifierOrigine }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/structures', structureRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/niveaux', niveauRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/affectations', affectationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', compteRoutes);

app.use(gestionnaireNotFound);
app.use(gestionnaireErreurs);

demarrerTacheRelance();

app.listen(PORT, () => {
  console.log('=== SERVEUR DEMARRE ===');
  console.log(`URL : http://localhost:${PORT}`);
  console.log(`Environnement : ${process.env.NODE_ENV || 'development'}`);
  console.log(`Origines autorisees : ${originesAutorisees.length > 0 ? originesAutorisees.join(', ') : 'toutes'}`);
});