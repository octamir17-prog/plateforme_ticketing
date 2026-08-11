const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const prisma = require('../prisma/client');

// ===== COMPTAGE =====
async function compterDonnees() {
  const [tickets, affectations, utilisateurs, techniciens, responsables, pointsFocaux, agents, structures, niveaux, types] = await Promise.all([
    prisma.ticket.count(),
    prisma.affectation.count(),
    prisma.utilisateur.count(),
    prisma.technicien.count(),
    prisma.responsableEquipeTechnique.count(),
    prisma.pointFocal.count(),
    prisma.agent.count(),
    prisma.structure.count(),
    prisma.niveau.count(),
    prisma.type.count(),
  ]);
  return { tickets, affectations, utilisateurs, techniciens, responsables, pointsFocaux, agents, structures, niveaux, types };
}

// ===== NETTOYAGE =====
async function nettoyer() {
  console.log('  → Suppression des affectations...');
  await prisma.affectation.deleteMany({});

  console.log('  → Suppression des tickets...');
  await prisma.ticket.deleteMany({});

  console.log('  → Suppression des tokens de session...');
  await prisma.sessionToken.deleteMany({
    where: { typeCompte: { in: ['UTILISATEUR', 'TECHNICIEN', 'RESPONSABLE', 'POINT_FOCAL'] } },
  });

  console.log('  → Suppression des techniciens...');
  await prisma.technicien.deleteMany({});

  console.log('  → Suppression des responsables...');
  await prisma.responsableEquipeTechnique.deleteMany({});

  console.log('  → Suppression des points focaux...');
  await prisma.pointFocal.deleteMany({});

  console.log('  → Suppression des utilisateurs...');
  await prisma.utilisateur.deleteMany({});

  console.log('  → Désassociation des agents...');
  await prisma.agent.updateMany({ data: { createdByPointFocalId: null } });

  console.log('  → Suppression des agents...');
  await prisma.agent.deleteMany({});

  console.log('  → Suppression des structures...');
  await prisma.structure.deleteMany({});

  console.log('  → Suppression des types...');
  await prisma.type.deleteMany({});

  console.log('  → Suppression des niveaux...');
  await prisma.niveau.deleteMany({});
}

// ===== REPEUPLEMENT =====
async function repeupler() {
  console.log('');
  console.log('  → Création des niveaux hiérarchiques...');
  
  // Créer les niveaux et récupérer leurs IDs
  const niveauxData = [
    { ordre: 1, libelle: 'Cabinet & Directions Centrales' },
    { ordre: 2, libelle: 'Directions Départementales' },
    { ordre: 3, libelle: 'Zones Sanitaires' },
    { ordre: 4, libelle: 'Structures Spécialisées' },
  ];

  await prisma.niveau.createMany({
    data: niveauxData,
  });

  // Récupérer les IDs des niveaux
  const niveauxMap = {};
  for (const niveauData of niveauxData) {
    const niveau = await prisma.niveau.findUnique({
      where: { ordre: niveauData.ordre },
    });
    niveauxMap[niveauData.ordre] = niveau.id;
  }

  console.log('  → Création des types de structures...');
  const typesData = [
    'Cabinet du Ministre',
    'Secrétariat Général',
    'Direction Centrale',
    'Inspection Générale',
    'Direction Technique',
    'Direction Départementale',
    'Zone Sanitaire',
    'Agence',
    'Hôpital Universitaire',
  ];

  await prisma.type.createMany({
    data: typesData.map(libelle => ({ libelle })),
  });

  // Récupérer les IDs des types
  const typesMap = {};
  for (const typeLibelle of typesData) {
    const type = await prisma.type.findUnique({
      where: { libelle: typeLibelle },
    });
    typesMap[typeLibelle] = type.id;
  }

  console.log('  → Création des structures...');
  await prisma.structure.createMany({
    data: [
      // Niveau 1 : Cabinet & Directions Centrales
      { codeStructure: 'CAB-MIN', designation: 'Cabinet du Ministre de la Santé', typeId: typesMap['Cabinet du Ministre'], niveauId: niveauxMap[1] },
      { codeStructure: 'SGM', designation: 'Secrétariat Général du Ministère', typeId: typesMap['Secrétariat Général'], niveauId: niveauxMap[1] },
      { codeStructure: 'DSI', designation: 'Direction des Systèmes d\'Information', typeId: typesMap['Direction Centrale'], niveauId: niveauxMap[1] },
      { codeStructure: 'DPAF', designation: 'Direction de la Planification, Administration et Finances', typeId: typesMap['Direction Centrale'], niveauId: niveauxMap[1] },
      { codeStructure: 'IG', designation: 'Inspection Générale', typeId: typesMap['Inspection Générale'], niveauId: niveauxMap[1] },
      { codeStructure: 'DGMHED', designation: 'Direction Générale de la Médecine Hospitalière et Explorations Diagnostiques', typeId: typesMap['Direction Technique'], niveauId: niveauxMap[1] },
      { codeStructure: 'DNSP', designation: 'Direction Nationale de la Santé Publique', typeId: typesMap['Direction Technique'], niveauId: niveauxMap[1] },
      { codeStructure: 'DFRS', designation: 'Direction de la Formation et de la Recherche en Santé', typeId: typesMap['Direction Technique'], niveauId: niveauxMap[1] },

      // Niveau 2 : Directions Départementales
      { codeStructure: 'DDS-ALIBORI', designation: 'Direction Départementale de la Santé - Alibori (Kandi)', typeId: typesMap['Direction Départementale'], niveauId: niveauxMap[2] },
      { codeStructure: 'DDS-ATACORA', designation: 'Direction Départementale de la Santé - Atacora (Natitingou)', typeId: typesMap['Direction Départementale'], niveauId: niveauxMap[2] },
      { codeStructure: 'DDS-BORGOU', designation: 'Direction Départementale de la Santé - Borgou (Parakou)', typeId: typesMap['Direction Départementale'], niveauId: niveauxMap[2] },
      { codeStructure: 'DDS-COLLINES', designation: 'Direction Départementale de la Santé - Collines (Savalou)', typeId: typesMap['Direction Départementale'], niveauId: niveauxMap[2] },
      { codeStructure: 'DDS-COUFFO', designation: 'Direction Départementale de la Santé - Couffo (Dogbo-Tota)', typeId: typesMap['Direction Départementale'], niveauId: niveauxMap[2] },
      { codeStructure: 'DDS-DONGA', designation: 'Direction Départementale de la Santé - Donga (Djougou)', typeId: typesMap['Direction Départementale'], niveauId: niveauxMap[2] },
      { codeStructure: 'DDS-LITTORAL', designation: 'Direction Départementale de la Santé - Littoral (Cotonou)', typeId: typesMap['Direction Départementale'], niveauId: niveauxMap[2] },
      { codeStructure: 'DDS-MONO', designation: 'Direction Départementale de la Santé - Mono (Lokossa)', typeId: typesMap['Direction Départementale'], niveauId: niveauxMap[2] },
      { codeStructure: 'DDS-OUEME', designation: 'Direction Départementale de la Santé - Ouémé (Porto-Novo)', typeId: typesMap['Direction Départementale'], niveauId: niveauxMap[2] },
      { codeStructure: 'DDS-PLATEAU', designation: 'Direction Départementale de la Santé - Plateau (Segboroué)', typeId: typesMap['Direction Départementale'], niveauId: niveauxMap[2] },
      { codeStructure: 'DDS-ZOU', designation: 'Direction Départementale de la Santé - Zou (Abomey)', typeId: typesMap['Direction Départementale'], niveauId: niveauxMap[2] },
      { codeStructure: 'DDS-ATLANTIQUE', designation: 'Direction Départementale de la Santé - Atlantique (Ouidah)', typeId: typesMap['Direction Départementale'], niveauId: niveauxMap[2] },

      // Niveau 3 : Zones Sanitaires
      { codeStructure: 'ZS-COTONOU-C', designation: 'Zone Sanitaire Cotonou Centre', typeId: typesMap['Zone Sanitaire'], niveauId: niveauxMap[3] },
      { codeStructure: 'ZS-COTONOU-N', designation: 'Zone Sanitaire Cotonou Nord', typeId: typesMap['Zone Sanitaire'], niveauId: niveauxMap[3] },
      { codeStructure: 'ZS-COTONOU-S', designation: 'Zone Sanitaire Cotonou Sud', typeId: typesMap['Zone Sanitaire'], niveauId: niveauxMap[3] },

      // Niveau 4 : Structures Spécialisées
      { codeStructure: 'ABMed', designation: 'Agence Béninoise du Médicament (ABMed)', typeId: typesMap['Agence'], niveauId: niveauxMap[4] },
      { codeStructure: 'AISEM', designation: 'Agence des Infrastructures Sanitaires et de Maintenance', typeId: typesMap['Agence'], niveauId: niveauxMap[4] },
      { codeStructure: 'SAMU', designation: 'Service d\'Aide Médicale d\'Urgence', typeId: typesMap['Agence'], niveauId: niveauxMap[4] },
      { codeStructure: 'ANSP', designation: 'Agence Nationale des Soins de Santé Primaires', typeId: typesMap['Agence'], niveauId: niveauxMap[4] },
      { codeStructure: 'ANTBS', designation: 'Agence Nationale pour la Transfusion Sanguine', typeId: typesMap['Agence'], niveauId: niveauxMap[4] },
      { codeStructure: 'CNHU', designation: 'Centre National Hospitalier Universitaire Hubert Koutoukou Maga', typeId: typesMap['Hôpital Universitaire'], niveauId: niveauxMap[4] },
      { codeStructure: 'CHIC', designation: 'Centre Hospitalier International de Calavi', typeId: typesMap['Hôpital Universitaire'], niveauId: niveauxMap[4] },
    ],
  });
}

// ===== MAIN =====
async function main() {
  const avant = await compterDonnees();
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   RESET DONNEES DE TEST - PLATEFORME   ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('Données actuellement en base :');
  console.log(`  Tickets              : ${avant.tickets}`);
  console.log(`  Affectations         : ${avant.affectations}`);
  console.log(`  Utilisateurs         : ${avant.utilisateurs}`);
  console.log(`  Techniciens          : ${avant.techniciens}`);
  console.log(`  Responsables         : ${avant.responsables}`);
  console.log(`  Points focaux        : ${avant.pointsFocaux}`);
  console.log(`  Agents               : ${avant.agents}`);
  console.log(`  Structures           : ${avant.structures}`);
  console.log(`  Types                : ${avant.types}`);
  console.log(`  Niveaux              : ${avant.niveaux}`);
  console.log('');
  console.log('Seront SUPPRIMÉS : Tickets, Affectations, Agents, Utilisateurs, Techniciens, Responsables, PointsFocaux, Structures, Types, Niveaux');
  console.log('Seront CONSERVÉS : Admin, Categories');
  console.log('');

  if (process.env.CONFIRMER_RESET !== 'oui') {
    console.log('⚠️  MODE APERÇU UNIQUEMENT — Aucune donnée supprimée.');
    console.log('');
    console.log('Pour exécuter le reset réellement :');
    console.log('  (Windows)  set CONFIRMER_RESET=oui && node scripts/reset-donnees.js');
    console.log('  (Linux)    CONFIRMER_RESET=oui node scripts/reset-donnees.js');
    console.log('');
    return;
  }

  console.log('✓ Confirmation reçue. Exécution en cours...');
  console.log('');

  try {
    console.log('Nettoyage de la base...');
    await nettoyer();

    console.log('Repeuplement de la base...');
    await repeupler();

    const apres = await compterDonnees();
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║         RESET TERMINÉ AVEC SUCCÈS      ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log('État final de la base :');
    console.log(`  Tickets              : ${apres.tickets}`);
    console.log(`  Affectations         : ${apres.affectations}`);
    console.log(`  Utilisateurs         : ${apres.utilisateurs}`);
    console.log(`  Techniciens          : ${apres.techniciens}`);
    console.log(`  Responsables         : ${apres.responsables}`);
    console.log(`  Points focaux        : ${apres.pointsFocaux}`);
    console.log(`  Agents               : ${apres.agents}`);
    console.log(`  Structures           : ${apres.structures}`);
    console.log(`  Types                : ${apres.types}`);
    console.log(`  Niveaux              : ${apres.niveaux}`);
    console.log('');
  } catch (erreur) {
    console.error('');
    console.error('❌ ERREUR LORS DU RESET :');
    console.error(erreur.message);
    console.error('');
    process.exit(1);
  }
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });