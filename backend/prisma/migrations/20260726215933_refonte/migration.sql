-- CreateTable
CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `motdepasse` VARCHAR(191) NOT NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admins_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `niveaux` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `libelle` VARCHAR(191) NOT NULL,
    `ordre` INTEGER NOT NULL,

    UNIQUE INDEX `niveaux_libelle_key`(`libelle`),
    UNIQUE INDEX `niveaux_ordre_key`(`ordre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `libelle` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `types_libelle_key`(`libelle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `structures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeStructure` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `nomResponsable` VARCHAR(191) NULL,
    `prenomResponsable` VARCHAR(191) NULL,
    `mailResponsable` VARCHAR(191) NULL,
    `numResponsable` VARCHAR(191) NULL,
    `typeId` INTEGER NOT NULL,
    `niveauId` INTEGER NOT NULL,

    UNIQUE INDEX `structures_codeStructure_key`(`codeStructure`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `points_focaux` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `motdepasse` VARCHAR(191) NULL,
    `codeActivation` VARCHAR(191) NULL,
    `codeActivationExpiration` DATETIME(3) NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `structureId` INTEGER NOT NULL,
    `agentMatricule` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `points_focaux_username_key`(`username`),
    UNIQUE INDEX `points_focaux_structureId_key`(`structureId`),
    UNIQUE INDEX `points_focaux_agentMatricule_key`(`agentMatricule`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilisateurs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `motdepasse` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `agentMatricule` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `utilisateurs_username_key`(`username`),
    UNIQUE INDEX `utilisateurs_agentMatricule_key`(`agentMatricule`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `responsables_equipe_technique` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `motdepasse` VARCHAR(191) NULL,
    `codeActivation` VARCHAR(191) NULL,
    `codeActivationExpiration` DATETIME(3) NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `structureId` INTEGER NOT NULL,
    `agentMatricule` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `responsables_equipe_technique_username_key`(`username`),
    UNIQUE INDEX `responsables_equipe_technique_structureId_key`(`structureId`),
    UNIQUE INDEX `responsables_equipe_technique_agentMatricule_key`(`agentMatricule`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `techniciens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `motdepasse` VARCHAR(191) NULL,
    `codeActivation` VARCHAR(191) NULL,
    `codeActivationExpiration` DATETIME(3) NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `estCompteJumeau` BOOLEAN NOT NULL DEFAULT false,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `responsableId` INTEGER NOT NULL,
    `agentMatricule` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `techniciens_username_key`(`username`),
    UNIQUE INDEX `techniciens_agentMatricule_key`(`agentMatricule`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `categories_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `statut` ENUM('SOUMIS', 'AFFECTE', 'EN_COURS', 'CLOTURE') NOT NULL DEFAULT 'SOUMIS',
    `pieceJointe` VARCHAR(191) NULL,
    `derniereRelanceAt` DATETIME(3) NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `agentMatricule` INTEGER NOT NULL,
    `categorieId` INTEGER NOT NULL,

    UNIQUE INDEX `tickets_reference_key`(`reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `affectations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dateAffectation` DATETIME(3) NULL,
    `statut` ENUM('EN_ATTENTE', 'EN_TRAITEMENT', 'CLOTUREE') NOT NULL DEFAULT 'EN_ATTENTE',
    `commentaire` TEXT NULL,
    `priorite` VARCHAR(191) NULL,
    `dateDebutTrait` DATETIME(3) NULL,
    `dateFinTrait` DATETIME(3) NULL,
    `transfere` BOOLEAN NOT NULL DEFAULT false,
    `dateTransfert` DATETIME(3) NULL,
    `raisonTransfert` VARCHAR(191) NULL,
    `commentaireTransfert` VARCHAR(191) NULL,
    `escalade` BOOLEAN NOT NULL DEFAULT false,
    `dateEscalade` DATETIME(3) NULL,
    `raisonEscalade` VARCHAR(191) NULL,
    `commentaireEscalade` VARCHAR(191) NULL,
    `retourne` BOOLEAN NOT NULL DEFAULT false,
    `dateRetour` DATETIME(3) NULL,
    `raisonRetour` VARCHAR(191) NULL,
    `commentaireRetour` VARCHAR(191) NULL,
    `relanceAutoEnvoyee` BOOLEAN NOT NULL DEFAULT false,
    `ticketId` INTEGER NOT NULL,
    `responsableId` INTEGER NOT NULL,
    `technicienId` INTEGER NULL,
    `affectationPrecedenteId` INTEGER NULL,

    UNIQUE INDEX `affectations_affectationPrecedenteId_key`(`affectationPrecedenteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jti` VARCHAR(191) NOT NULL,
    `typeCompte` VARCHAR(191) NOT NULL,
    `compteId` INTEGER NOT NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateExpiration` DATETIME(3) NOT NULL,
    `revoque` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `session_tokens_jti_key`(`jti`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agents` (
    `matricule` INTEGER NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `sexe` ENUM('M', 'F') NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `codeVerification` VARCHAR(191) NULL,
    `codeVerificationExpiration` DATETIME(3) NULL,
    `structureId` INTEGER NOT NULL,
    `createdByPointFocalId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `agents_email_key`(`email`),
    PRIMARY KEY (`matricule`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `structures` ADD CONSTRAINT `structures_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `structures` ADD CONSTRAINT `structures_niveauId_fkey` FOREIGN KEY (`niveauId`) REFERENCES `niveaux`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `points_focaux` ADD CONSTRAINT `points_focaux_structureId_fkey` FOREIGN KEY (`structureId`) REFERENCES `structures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `points_focaux` ADD CONSTRAINT `points_focaux_agentMatricule_fkey` FOREIGN KEY (`agentMatricule`) REFERENCES `agents`(`matricule`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `utilisateurs` ADD CONSTRAINT `utilisateurs_agentMatricule_fkey` FOREIGN KEY (`agentMatricule`) REFERENCES `agents`(`matricule`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `responsables_equipe_technique` ADD CONSTRAINT `responsables_equipe_technique_structureId_fkey` FOREIGN KEY (`structureId`) REFERENCES `structures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `responsables_equipe_technique` ADD CONSTRAINT `responsables_equipe_technique_agentMatricule_fkey` FOREIGN KEY (`agentMatricule`) REFERENCES `agents`(`matricule`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `techniciens` ADD CONSTRAINT `techniciens_responsableId_fkey` FOREIGN KEY (`responsableId`) REFERENCES `responsables_equipe_technique`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `techniciens` ADD CONSTRAINT `techniciens_agentMatricule_fkey` FOREIGN KEY (`agentMatricule`) REFERENCES `agents`(`matricule`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_agentMatricule_fkey` FOREIGN KEY (`agentMatricule`) REFERENCES `agents`(`matricule`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_categorieId_fkey` FOREIGN KEY (`categorieId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affectations` ADD CONSTRAINT `affectations_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affectations` ADD CONSTRAINT `affectations_responsableId_fkey` FOREIGN KEY (`responsableId`) REFERENCES `responsables_equipe_technique`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affectations` ADD CONSTRAINT `affectations_technicienId_fkey` FOREIGN KEY (`technicienId`) REFERENCES `techniciens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `affectations` ADD CONSTRAINT `affectations_affectationPrecedenteId_fkey` FOREIGN KEY (`affectationPrecedenteId`) REFERENCES `affectations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agents` ADD CONSTRAINT `agents_structureId_fkey` FOREIGN KEY (`structureId`) REFERENCES `structures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agents` ADD CONSTRAINT `agents_createdByPointFocalId_fkey` FOREIGN KEY (`createdByPointFocalId`) REFERENCES `points_focaux`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
