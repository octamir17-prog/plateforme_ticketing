const XLSX = require('xlsx');
const prisma = require('../prisma/client');

const COLONNES_OBLIGATOIRES = ['matricule', 'nom', 'prenom', 'sexe', 'numero', 'email', 'codestructure'];

function normaliserEntete(entete) {
  return entete.toString().trim().toLowerCase().replace(/\s+/g, '');
}

function normaliserLigne(ligneBrute) {
  const ligne = {};

  for (const cle of Object.keys(ligneBrute)) {
    ligne[normaliserEntete(cle)] = ligneBrute[cle];
  }

  return ligne;
}

function lireLignesExcel(buffer) {
  const classeur = XLSX.read(buffer, { type: 'buffer' });
  const premiereFeuille = classeur.SheetNames[0];
  const feuille = classeur.Sheets[premiereFeuille];
  return XLSX.utils.sheet_to_json(feuille, { defval: '' });
}

function validerEntetes(lignesBrutes) {
  const entetesTrouvees = Object.keys(lignesBrutes[0]).map(normaliserEntete);
  const entetesManquantes = COLONNES_OBLIGATOIRES.filter((colonne) => !entetesTrouvees.includes(colonne));
  return entetesManquantes;
}

async function creer(req, res) {
  const { matricule, nom, prenom, sexe, numero, email } = req.body;

  if (!matricule || !nom || !prenom || !sexe || !numero || !email) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants.', errors: [] });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Adresse email invalide.', errors: [] });
  }

  const existant = await prisma.agent.findUnique({ where: { matricule: Number(matricule) } });

  if (existant) {
    return res.status(409).json({ success: false, message: 'Un agent avec ce matricule existe deja.', errors: [] });
  }

  const emailExistant = await prisma.agent.findUnique({ where: { email } });

  if (emailExistant) {
    return res.status(409).json({ success: false, message: 'Cet email est deja utilise par un autre agent.', errors: [] });
  }

  const agent = await prisma.agent.create({
    data: {
      matricule: Number(matricule),
      nom,
      prenom,
      sexe,
      numero,
      email,
      structureId: req.compte.structureId,
      createdByPointFocalId: req.compte.id,
    },
  });

  return res.status(201).json({ success: true, message: 'Agent enregistre.', data: agent });
}

async function lister(req, res) {
  const agents = await prisma.agent.findMany({
    where: { structureId: req.compte.structureId },
    orderBy: { nom: 'asc' },
  });

  return res.status(200).json({ success: true, data: agents });
}

async function modifier(req, res) {
  const agent = await prisma.agent.findUnique({ where: { matricule: Number(req.params.matricule) } });

  if (!agent) {
    return res.status(404).json({ success: false, message: 'Agent introuvable.', errors: [] });
  }

  if (agent.structureId !== req.compte.structureId) {
    return res.status(403).json({ success: false, message: 'Cet agent n\'appartient pas a votre structure.', errors: [] });
  }

  const { nom, prenom, sexe, numero, email } = req.body;

  if (email && email !== agent.email) {
    const emailExistant = await prisma.agent.findUnique({ where: { email } });

    if (emailExistant) {
      return res.status(409).json({ success: false, message: 'Cet email est deja utilise par un autre agent.', errors: [] });
    }
  }

  const agentMisAJour = await prisma.agent.update({
    where: { matricule: agent.matricule },
    data: { nom, prenom, sexe, numero, email },
  });

  return res.status(200).json({ success: true, message: 'Agent modifie.', data: agentMisAJour });
}

async function desactiver(req, res) {
  const agent = await prisma.agent.findUnique({ where: { matricule: Number(req.params.matricule) } });

  if (!agent) {
    return res.status(404).json({ success: false, message: 'Agent introuvable.', errors: [] });
  }

  if (agent.structureId !== req.compte.structureId) {
    return res.status(403).json({ success: false, message: 'Cet agent n\'appartient pas a votre structure.', errors: [] });
  }

  await prisma.agent.update({
    where: { matricule: agent.matricule },
    data: { actif: false },
  });

  const utilisateur = await prisma.utilisateur.findUnique({ where: { agentMatricule: agent.matricule } });

  if (utilisateur) {
    await prisma.utilisateur.update({ where: { id: utilisateur.id }, data: { actif: false } });
    await prisma.sessionToken.updateMany({
      where: { typeCompte: 'UTILISATEUR', compteId: utilisateur.id },
      data: { revoque: true },
    });
  }

  return res.status(200).json({ success: true, message: 'Agent desactive.' });
}

async function reactiver(req, res) {
  const agent = await prisma.agent.findUnique({ where: { matricule: Number(req.params.matricule) } });

  if (!agent) {
    return res.status(404).json({ success: false, message: 'Agent introuvable.', errors: [] });
  }

  if (agent.structureId !== req.compte.structureId) {
    return res.status(403).json({ success: false, message: 'Cet agent n\'appartient pas a votre structure.', errors: [] });
  }

  await prisma.agent.update({
    where: { matricule: agent.matricule },
    data: { actif: true },
  });

  const utilisateur = await prisma.utilisateur.findUnique({ where: { agentMatricule: agent.matricule } });

  if (utilisateur) {
    await prisma.utilisateur.update({ where: { id: utilisateur.id }, data: { actif: true } });
  }

  return res.status(200).json({ success: true, message: 'Agent reactive.' });
}

async function importerAgents(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Aucun fichier envoye.', errors: [] });
  }

  let lignesBrutes;

  try {
    lignesBrutes = lireLignesExcel(req.file.buffer);
  } catch (erreur) {
    return res.status(400).json({ success: false, message: 'Fichier Excel illisible.', errors: [] });
  }

  if (lignesBrutes.length === 0) {
    return res.status(400).json({ success: false, message: 'Le fichier ne contient aucune ligne de donnees.', errors: [] });
  }

  const entetesManquantes = validerEntetes(lignesBrutes);

  if (entetesManquantes.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Colonnes manquantes dans le fichier : ${entetesManquantes.join(', ')}.`,
      errors: [],
    });
  }

  const structures = await prisma.structure.findMany();
  const structureParCode = {};

  structures.forEach((structure) => {
    structureParCode[structure.codeStructure.toUpperCase()] = structure;
  });

  const matriculesDejaVus = new Set();
  const reussites = [];
  const echecs = [];

  for (let index = 0; index < lignesBrutes.length; index++) {
    const numeroLigne = index + 2;
    const ligne = normaliserLigne(lignesBrutes[index]);

    const matriculeBrut = ligne.matricule;
    const matricule = Number(matriculeBrut);
    const nom = ligne.nom.toString().trim();
    const prenom = ligne.prenom.toString().trim();
    const sexe = ligne.sexe.toString().trim().toUpperCase();
    const numero = ligne.numero.toString().trim();
    const email = ligne.email.toString().trim().toLowerCase();
    const codeStructure = ligne.codestructure.toString().trim().toUpperCase();

    if (!matriculeBrut || Number.isNaN(matricule)) {
      echecs.push({ ligne: numeroLigne, matricule: matriculeBrut || null, raison: 'Matricule manquant ou invalide.' });
      continue;
    }

    if (!nom || !prenom || !numero || !email) {
      echecs.push({ ligne: numeroLigne, matricule, raison: 'Nom, prenom, numero et email sont obligatoires.' });
      continue;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      echecs.push({ ligne: numeroLigne, matricule, raison: 'Adresse email invalide.' });
      continue;
    }

    if (sexe !== 'M' && sexe !== 'F') {
      echecs.push({ ligne: numeroLigne, matricule, raison: 'Le sexe doit etre M ou F.' });
      continue;
    }

    if (!structureParCode[codeStructure]) {
      echecs.push({ ligne: numeroLigne, matricule, raison: `Structure "${ligne.codestructure}" introuvable.` });
      continue;
    }

    if (matriculesDejaVus.has(matricule)) {
      echecs.push({ ligne: numeroLigne, matricule, raison: 'Matricule en double dans le fichier.' });
      continue;
    }

    matriculesDejaVus.add(matricule);

    try {
      await prisma.agent.create({
        data: {
          matricule,
          nom,
          prenom,
          sexe,
          numero,
          email,
          structureId: structureParCode[codeStructure].id,
        },
      });

      reussites.push({ ligne: numeroLigne, matricule });
    } catch (erreur) {
      if (erreur.code === 'P2002') {
        echecs.push({ ligne: numeroLigne, matricule, raison: 'Matricule ou email deja present en base.' });
      } else {
        echecs.push({ ligne: numeroLigne, matricule, raison: 'Erreur inattendue lors de l\'enregistrement.' });
      }
    }
  }

  return res.status(200).json({
    success: true,
    message: `${reussites.length} agent(s) importe(s), ${echecs.length} ligne(s) en erreur sur ${lignesBrutes.length}.`,
    data: {
      totalLignes: lignesBrutes.length,
      reussites: reussites.length,
      echecs,
    },
  });
}

module.exports = { creer, lister, modifier, desactiver, reactiver, importerAgents };