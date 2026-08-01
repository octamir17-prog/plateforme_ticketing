-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "StatutTicket" AS ENUM ('SOUMIS', 'AFFECTE', 'EN_COURS', 'CLOTURE');

-- CreateEnum
CREATE TYPE "StatutAffectation" AS ENUM ('EN_ATTENTE', 'EN_TRAITEMENT', 'CLOTUREE');

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "motdepasse" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "niveaux" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,

    CONSTRAINT "niveaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,

    CONSTRAINT "types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "structures" (
    "id" SERIAL NOT NULL,
    "codeStructure" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "nomResponsable" TEXT,
    "prenomResponsable" TEXT,
    "mailResponsable" TEXT,
    "numResponsable" TEXT,
    "typeId" INTEGER NOT NULL,
    "niveauId" INTEGER NOT NULL,

    CONSTRAINT "structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_focaux" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "motdepasse" TEXT,
    "telephone" TEXT,
    "tokenActivation" TEXT,
    "tokenActivationExpiration" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "structureId" INTEGER NOT NULL,
    "agentMatricule" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "points_focaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "motdepasse" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentMatricule" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responsables_equipe_technique" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "motdepasse" TEXT,
    "telephone" TEXT,
    "tokenActivation" TEXT,
    "tokenActivationExpiration" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "structureId" INTEGER NOT NULL,
    "agentMatricule" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "responsables_equipe_technique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "techniciens" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "motdepasse" TEXT,
    "telephone" TEXT,
    "tokenActivation" TEXT,
    "tokenActivationExpiration" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsableId" INTEGER NOT NULL,
    "agentMatricule" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "techniciens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statut" "StatutTicket" NOT NULL DEFAULT 'SOUMIS',
    "pieceJointe" TEXT,
    "derniereRelanceAt" TIMESTAMP(3),
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentMatricule" INTEGER NOT NULL,
    "categorieId" INTEGER NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affectations" (
    "id" SERIAL NOT NULL,
    "dateAffectation" TIMESTAMP(3),
    "statut" "StatutAffectation" NOT NULL DEFAULT 'EN_ATTENTE',
    "commentaire" TEXT,
    "priorite" TEXT,
    "dateDebutTrait" TIMESTAMP(3),
    "dateFinTrait" TIMESTAMP(3),
    "transfere" BOOLEAN NOT NULL DEFAULT false,
    "dateTransfert" TIMESTAMP(3),
    "raisonTransfert" TEXT,
    "commentaireTransfert" TEXT,
    "escalade" BOOLEAN NOT NULL DEFAULT false,
    "dateEscalade" TIMESTAMP(3),
    "raisonEscalade" TEXT,
    "commentaireEscalade" TEXT,
    "retourne" BOOLEAN NOT NULL DEFAULT false,
    "dateRetour" TIMESTAMP(3),
    "raisonRetour" TEXT,
    "commentaireRetour" TEXT,
    "relanceAutoEnvoyee" BOOLEAN NOT NULL DEFAULT false,
    "ticketId" INTEGER NOT NULL,
    "responsableId" INTEGER NOT NULL,
    "technicienId" INTEGER,
    "affectationPrecedenteId" INTEGER,

    CONSTRAINT "affectations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_tokens" (
    "id" SERIAL NOT NULL,
    "jti" TEXT NOT NULL,
    "typeCompte" TEXT NOT NULL,
    "compteId" INTEGER NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateExpiration" TIMESTAMP(3) NOT NULL,
    "revoque" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "matricule" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "sexe" "Sexe" NOT NULL,
    "numero" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "codeVerification" TEXT,
    "codeVerificationExpiration" TIMESTAMP(3),
    "structureId" INTEGER NOT NULL,
    "createdByPointFocalId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("matricule")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "niveaux_libelle_key" ON "niveaux"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "niveaux_ordre_key" ON "niveaux"("ordre");

-- CreateIndex
CREATE UNIQUE INDEX "types_libelle_key" ON "types"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "structures_codeStructure_key" ON "structures"("codeStructure");

-- CreateIndex
CREATE UNIQUE INDEX "points_focaux_username_key" ON "points_focaux"("username");

-- CreateIndex
CREATE UNIQUE INDEX "points_focaux_tokenActivation_key" ON "points_focaux"("tokenActivation");

-- CreateIndex
CREATE UNIQUE INDEX "points_focaux_structureId_key" ON "points_focaux"("structureId");

-- CreateIndex
CREATE UNIQUE INDEX "points_focaux_agentMatricule_key" ON "points_focaux"("agentMatricule");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_username_key" ON "utilisateurs"("username");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_agentMatricule_key" ON "utilisateurs"("agentMatricule");

-- CreateIndex
CREATE UNIQUE INDEX "responsables_equipe_technique_username_key" ON "responsables_equipe_technique"("username");

-- CreateIndex
CREATE UNIQUE INDEX "responsables_equipe_technique_tokenActivation_key" ON "responsables_equipe_technique"("tokenActivation");

-- CreateIndex
CREATE UNIQUE INDEX "responsables_equipe_technique_structureId_key" ON "responsables_equipe_technique"("structureId");

-- CreateIndex
CREATE UNIQUE INDEX "responsables_equipe_technique_agentMatricule_key" ON "responsables_equipe_technique"("agentMatricule");

-- CreateIndex
CREATE UNIQUE INDEX "techniciens_username_key" ON "techniciens"("username");

-- CreateIndex
CREATE UNIQUE INDEX "techniciens_tokenActivation_key" ON "techniciens"("tokenActivation");

-- CreateIndex
CREATE UNIQUE INDEX "techniciens_agentMatricule_key" ON "techniciens"("agentMatricule");

-- CreateIndex
CREATE UNIQUE INDEX "categories_nom_key" ON "categories"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_reference_key" ON "tickets"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "affectations_affectationPrecedenteId_key" ON "affectations"("affectationPrecedenteId");

-- CreateIndex
CREATE UNIQUE INDEX "session_tokens_jti_key" ON "session_tokens"("jti");

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_key" ON "agents"("email");

-- AddForeignKey
ALTER TABLE "structures" ADD CONSTRAINT "structures_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "structures" ADD CONSTRAINT "structures_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "niveaux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_focaux" ADD CONSTRAINT "points_focaux_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_focaux" ADD CONSTRAINT "points_focaux_agentMatricule_fkey" FOREIGN KEY ("agentMatricule") REFERENCES "agents"("matricule") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_agentMatricule_fkey" FOREIGN KEY ("agentMatricule") REFERENCES "agents"("matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsables_equipe_technique" ADD CONSTRAINT "responsables_equipe_technique_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsables_equipe_technique" ADD CONSTRAINT "responsables_equipe_technique_agentMatricule_fkey" FOREIGN KEY ("agentMatricule") REFERENCES "agents"("matricule") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "techniciens" ADD CONSTRAINT "techniciens_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "responsables_equipe_technique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "techniciens" ADD CONSTRAINT "techniciens_agentMatricule_fkey" FOREIGN KEY ("agentMatricule") REFERENCES "agents"("matricule") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_agentMatricule_fkey" FOREIGN KEY ("agentMatricule") REFERENCES "agents"("matricule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affectations" ADD CONSTRAINT "affectations_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affectations" ADD CONSTRAINT "affectations_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "responsables_equipe_technique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affectations" ADD CONSTRAINT "affectations_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "techniciens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affectations" ADD CONSTRAINT "affectations_affectationPrecedenteId_fkey" FOREIGN KEY ("affectationPrecedenteId") REFERENCES "affectations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_createdByPointFocalId_fkey" FOREIGN KEY ("createdByPointFocalId") REFERENCES "points_focaux"("id") ON DELETE SET NULL ON UPDATE CASCADE;
