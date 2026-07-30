const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const NB_TECHNICIENS_PAR_STRUCTURE = 3;

const niveauxMetier = [
  { libelle: 'Central (National)', ordre: 1 },
  { libelle: 'Intermediaire (Departemental)', ordre: 2 },
  { libelle: 'Peripherique (Local)', ordre: 3 },
];

const typesMetier = [
  'Administratif / Technique',
  'Administratif / Decisionnel',
  'Administratif / Gestion',
  'Technique / Regulation',
  'Etablissement Public / Soutien',
  'Controle / Regulation',
  'Technique / Soutien',
  'Soins (Dernier Recours)',
  'Soins (2eme Recours)',
  'Soins (1er Recours)',
  'Soins de Base',
];

const structuresMetier = [
  { codeStructure: 'DSI', designation: 'Direction des Systemes d\'Information', type: 'Administratif / Technique', niveau: 'Central (National)' },
  { codeStructure: 'CAB-MIN', designation: 'Cabinet du Ministre', type: 'Administratif / Decisionnel', niveau: 'Central (National)' },
  { codeStructure: 'SGM', designation: 'Secretariat General du Ministere', type: 'Administratif / Gestion', niveau: 'Central (National)' },
  { codeStructure: 'DPAF', designation: 'Direction de la Planification, de l\'Administration et des Finances', type: 'Administratif / Gestion', niveau: 'Central (National)' },
  { codeStructure: 'DRH', designation: 'Direction des Ressources Humaines', type: 'Administratif / Gestion', niveau: 'Central (National)' },
  { codeStructure: 'DNSP', designation: 'Direction Nationale de la Sante Publique', type: 'Technique / Regulation', niveau: 'Central (National)' },
  { codeStructure: 'ANSSP', designation: 'Agence Nationale des Soins de Sante Primaires', type: 'Etablissement Public / Soutien', niveau: 'Central (National)' },
  { codeStructure: 'ABRP', designation: 'Agence Beninoise de Regulation Pharmaceutique', type: 'Controle / Regulation', niveau: 'Central (National)' },
  { codeStructure: 'ANTS', designation: 'Agence Nationale pour la Transfusion Sanguine', type: 'Technique / Soutien', niveau: 'Central (National)' },
  { codeStructure: 'CNHU-HKM', designation: 'Centre Hospitalier Universitaire National', type: 'Soins (Dernier Recours)', niveau: 'Central (National)' },
  { codeStructure: 'DDS', designation: 'Direction Departementale de la Sante', type: 'Administratif / Gestion', niveau: 'Intermediaire (Departemental)' },
  { codeStructure: 'CHD', designation: 'Centre Hospitalier Departemental', type: 'Soins (2eme Recours)', niveau: 'Intermediaire (Departemental)' },
  { codeStructure: 'BZS', designation: 'Bureau de Zone Sanitaire', type: 'Administratif / Gestion', niveau: 'Peripherique (Local)' },
  { codeStructure: 'HZ', designation: 'Hopital de Zone', type: 'Soins (1er Recours)', niveau: 'Peripherique (Local)' },
  { codeStructure: 'CSC', designation: 'Centre de Sante de Commune', type: 'Soins de Base', niveau: 'Peripherique (Local)' },
  { codeStructure: 'CSA', designation: 'Centre de Sante d\'Arrondissement', type: 'Soins de Base', niveau: 'Peripherique (Local)' },
  { codeStructure: 'DISP', designation: 'Dispensaire isole / Unite locale', type: 'Soins de Base', niveau: 'Peripherique (Local)' },
];

const categoriesMetier = [
  { nom: 'Materiel', description: 'Ordinateur, imprimante, scanner, telephone, onduleur : appareil en panne, qui ne demarre pas ou mal installe' },
  { nom: 'Logiciel et application', description: 'Un programme ne s\'ouvre pas, affiche une erreur, se ferme seul, ou fonctionne mal' },
  { nom: 'Reseau et internet', description: 'Pas d\'acces a internet, connexion lente ou coupee, impossible d\'atteindre un service en ligne' },
  { nom: 'Compte et acces', description: 'Mot de passe oublie, compte bloque, droits insuffisants, messagerie inaccessible' },
];

const agentsTest = [
  { matricule: 1001, nom: 'TEST', prenom: 'Elmira', sexe: 'F', numero: '97000001', email: 'elmira.test@sante.bj', codeStructure: 'CSA' },
  { matricule: 1002, nom: 'TEST', prenom: 'Vladimir', sexe: 'M', numero: '97000002', email: 'vladimir.test@sante.bj', codeStructure: 'CSA' },
  { matricule: 1003, nom: 'TEST', prenom: 'Naruto', sexe: 'M', numero: '97000003', email: 'naruto.test@sante.bj', codeStructure: 'CSA' },
  { matricule: 1004, nom: 'ADJOVI', prenom: 'Clarisse', sexe: 'F', numero: '97000004', email: 'clarisse.adjovi@sante.bj', codeStructure: 'CSA' },
  { matricule: 1005, nom: 'KOUTON', prenom: 'Paul', sexe: 'M', numero: '97000005', email: 'paul.kouton@sante.bj', codeStructure: 'CSA' },
  { matricule: 1006, nom: 'DOSSOU', prenom: 'Jean', sexe: 'M', numero: '97000006', email: 'jean.dossou@sante.bj', codeStructure: 'DSI' },
  { matricule: 1007, nom: 'HOUNKPE', prenom: 'Alice', sexe: 'F', numero: '97000007', email: 'alice.hounkpe@sante.bj', codeStructure: 'DSI' },
  { matricule: 1008, nom: 'TCHIBOZO', prenom: 'Serge', sexe: 'M', numero: '97000008', email: 'serge.tchibozo@sante.bj', codeStructure: 'DSI' },
  { matricule: 1009, nom: 'ZINSOU', prenom: 'Bertrand', sexe: 'M', numero: '97000009', email: 'bertrand.zinsou@sante.bj', codeStructure: 'DDS' },
  { matricule: 1010, nom: 'AGBODJAN', prenom: 'Rachel', sexe: 'F', numero: '97000010', email: 'rachel.agbodjan@sante.bj', codeStructure: 'DDS' },
  { matricule: 1011, nom: 'SOSSOU', prenom: 'Isidore', sexe: 'M', numero: '97000011', email: 'isidore.sossou@sante.bj', codeStructure: 'CHD' },
  { matricule: 1012, nom: 'AHOUANSOU', prenom: 'Delphine', sexe: 'F', numero: '97000012', email: 'delphine.ahouansou@sante.bj', codeStructure: 'HZ' },
];


function genererMotDePasseAleatoire() {
  return crypto.randomBytes(12).toString('base64url');
}

async function viderBase() {
  await prisma.affectation.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.sessionToken.deleteMany({});
  await prisma.technicien.deleteMany({});
  await prisma.responsableEquipeTechnique.deleteMany({});
  await prisma.utilisateur.deleteMany({});
  await prisma.pointFocal.updateMany({ data: { agentMatricule: null } });
  await prisma.agent.updateMany({ data: { createdByPointFocalId: null } });
  await prisma.agent.deleteMany({});
  await prisma.pointFocal.deleteMany({});
  await prisma.categorie.deleteMany({});
  await prisma.structure.deleteMany({});
  await prisma.type.deleteMany({});
  await prisma.niveau.deleteMany({});
}

async function creerAdmin() {
  const nombreAdmins = await prisma.admin.count();

  if (nombreAdmins > 0) {
    console.log('Un compte administrateur existe deja, creation ignoree.');
    return null;
  }

  const username = process.env.ADMIN_USERNAME || 'admin';
  let motDePasse = process.env.ADMIN_PASSWORD;
  let motDePasseGenere = false;

  if (!motDePasse) {
    motDePasse = genererMotDePasseAleatoire();
    motDePasseGenere = true;
  }

  const motDePasseHache = await bcrypt.hash(motDePasse, 10);

  await prisma.admin.create({
    data: { username, motdepasse: motDePasseHache },
  });

  return { username, motDePasse, motDePasseGenere };
}

async function creerDonneesReference() {
  const niveauxParLibelle = {};
  for (const niveau of niveauxMetier) {
    const cree = await prisma.niveau.create({ data: niveau });
    niveauxParLibelle[cree.libelle] = cree;
  }

  const typesParLibelle = {};
  for (const libelle of typesMetier) {
    const cree = await prisma.type.create({ data: { libelle } });
    typesParLibelle[cree.libelle] = cree;
  }

  const structuresParCode = {};
  for (const structure of structuresMetier) {
    const cree = await prisma.structure.create({
      data: {
        codeStructure: structure.codeStructure,
        designation: structure.designation,
        typeId: typesParLibelle[structure.type].id,
        niveauId: niveauxParLibelle[structure.niveau].id,
      },
    });
    structuresParCode[cree.codeStructure] = cree;
  }

  for (const categorie of categoriesMetier) {
    await prisma.categorie.create({ data: categorie });
  }

  return structuresParCode;
}

async function creerEmplacements(structuresParCode) {
  let nombreEmplacements = 0;

  for (const code of Object.keys(structuresParCode)) {
    const structure = structuresParCode[code];

    await prisma.pointFocal.create({
      data: {
        username: `${code}-PF1`,
        structureId: structure.id,
      },
    });
    nombreEmplacements = nombreEmplacements + 1;

    const responsable = await prisma.responsableEquipeTechnique.create({
      data: {
        username: `${code}-RES1`,
        structureId: structure.id,
      },
    });
    nombreEmplacements = nombreEmplacements + 1;

    for (let numero = 1; numero <= NB_TECHNICIENS_PAR_STRUCTURE; numero++) {
      await prisma.technicien.create({
        data: {
          username: `${code}-TEC${numero}`,
          responsableId: responsable.id,
        },
      });
      nombreEmplacements = nombreEmplacements + 1;
    }
  }

  return nombreEmplacements;
}

async function creerAgentsTest(structuresParCode) {
  for (const agent of agentsTest) {
    await prisma.agent.create({
      data: {
        matricule: agent.matricule,
        nom: agent.nom,
        prenom: agent.prenom,
        sexe: agent.sexe,
        numero: agent.numero,
        email: agent.email,
        structureId: structuresParCode[agent.codeStructure].id,
      },
    });
  }

  return agentsTest.length;
}

function tableDuRole(role) {
  if (role === 'RESPONSABLE') {
    return prisma.responsableEquipeTechnique;
  }

  if (role === 'TECHNICIEN') {
    return prisma.technicien;
  }

  return prisma.pointFocal;
}

async function main() {
  await viderBase();

  const structuresParCode = await creerDonneesReference();
  const admin = await creerAdmin();
  const nombreEmplacements = await creerEmplacements(structuresParCode);
  const nombreAgents = await creerAgentsTest(structuresParCode);

  console.log('=== SEED TERMINE ===');
  console.log(`Structures     : ${Object.keys(structuresParCode).length}`);
  console.log(`Categories     : ${categoriesMetier.length}`);
  console.log(`Emplacements   : ${nombreEmplacements}`);
  console.log(`Agents de test : ${nombreAgents}`);
  console.log('');

  if (admin) {
    console.log(`Administrateur : ${admin.username}`);

    if (admin.motDePasseGenere) {
      console.log('');
      console.log('  MOT DE PASSE GENERE AUTOMATIQUEMENT, NOTEZ-LE MAINTENANT :');
      console.log(`  ${admin.motDePasse}`);
      console.log('  Il ne sera plus jamais affiche.');
      console.log('');
    } else {
      console.log('Mot de passe   : celui defini dans ADMIN_PASSWORD');
    }
  }

  console.log('');
  console.log('Emplacements libres : CODE-PF1, CODE-RES1, CODE-TEC1 a TEC3');
  console.log('Escalade testable   : CSA (niveau 3) vers DSI (niveau 1)');
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });