/*
  Warnings:

  - You are about to drop the column `nom` on the `points_focaux` table. All the data in the column will be lost.
  - You are about to drop the column `prenom` on the `points_focaux` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `points_focaux` DROP COLUMN `nom`,
    DROP COLUMN `prenom`;
