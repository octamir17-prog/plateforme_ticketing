/*
  Warnings:

  - You are about to drop the column `codeActivation` on the `points_focaux` table. All the data in the column will be lost.
  - You are about to drop the column `codeActivationExpiration` on the `points_focaux` table. All the data in the column will be lost.
  - You are about to drop the column `codeActivation` on the `responsables_equipe_technique` table. All the data in the column will be lost.
  - You are about to drop the column `codeActivationExpiration` on the `responsables_equipe_technique` table. All the data in the column will be lost.
  - You are about to drop the column `codeActivation` on the `techniciens` table. All the data in the column will be lost.
  - You are about to drop the column `codeActivationExpiration` on the `techniciens` table. All the data in the column will be lost.
  - You are about to drop the column `estCompteJumeau` on the `techniciens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenActivation]` on the table `points_focaux` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenActivation]` on the table `responsables_equipe_technique` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenActivation]` on the table `techniciens` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `agents` DROP FOREIGN KEY `agents_createdByPointFocalId_fkey`;

-- DropForeignKey
ALTER TABLE `responsables_equipe_technique` DROP FOREIGN KEY `responsables_equipe_technique_agentMatricule_fkey`;

-- DropForeignKey
ALTER TABLE `techniciens` DROP FOREIGN KEY `techniciens_agentMatricule_fkey`;

-- DropIndex
DROP INDEX `agents_createdByPointFocalId_fkey` ON `agents`;

-- AlterTable
ALTER TABLE `agents` MODIFY `createdByPointFocalId` INTEGER NULL;

-- AlterTable
ALTER TABLE `points_focaux` DROP COLUMN `codeActivation`,
    DROP COLUMN `codeActivationExpiration`,
    ADD COLUMN `tokenActivation` VARCHAR(191) NULL,
    ADD COLUMN `tokenActivationExpiration` DATETIME(3) NULL,
    MODIFY `nom` VARCHAR(191) NULL,
    MODIFY `prenom` VARCHAR(191) NULL,
    MODIFY `telephone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `responsables_equipe_technique` DROP COLUMN `codeActivation`,
    DROP COLUMN `codeActivationExpiration`,
    ADD COLUMN `tokenActivation` VARCHAR(191) NULL,
    ADD COLUMN `tokenActivationExpiration` DATETIME(3) NULL,
    MODIFY `telephone` VARCHAR(191) NULL,
    MODIFY `agentMatricule` INTEGER NULL;

-- AlterTable
ALTER TABLE `techniciens` DROP COLUMN `codeActivation`,
    DROP COLUMN `codeActivationExpiration`,
    DROP COLUMN `estCompteJumeau`,
    ADD COLUMN `tokenActivation` VARCHAR(191) NULL,
    ADD COLUMN `tokenActivationExpiration` DATETIME(3) NULL,
    MODIFY `telephone` VARCHAR(191) NULL,
    MODIFY `agentMatricule` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `points_focaux_tokenActivation_key` ON `points_focaux`(`tokenActivation`);

-- CreateIndex
CREATE UNIQUE INDEX `responsables_equipe_technique_tokenActivation_key` ON `responsables_equipe_technique`(`tokenActivation`);

-- CreateIndex
CREATE UNIQUE INDEX `techniciens_tokenActivation_key` ON `techniciens`(`tokenActivation`);

-- AddForeignKey
ALTER TABLE `responsables_equipe_technique` ADD CONSTRAINT `responsables_equipe_technique_agentMatricule_fkey` FOREIGN KEY (`agentMatricule`) REFERENCES `agents`(`matricule`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `techniciens` ADD CONSTRAINT `techniciens_agentMatricule_fkey` FOREIGN KEY (`agentMatricule`) REFERENCES `agents`(`matricule`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agents` ADD CONSTRAINT `agents_createdByPointFocalId_fkey` FOREIGN KEY (`createdByPointFocalId`) REFERENCES `points_focaux`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
