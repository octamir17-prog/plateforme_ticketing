-- AlterTable
ALTER TABLE "points_focaux" ADD COLUMN     "codeReinitialisation" TEXT,
ADD COLUMN     "codeReinitialisationExpiration" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "responsables_equipe_technique" ADD COLUMN     "codeReinitialisation" TEXT,
ADD COLUMN     "codeReinitialisationExpiration" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "techniciens" ADD COLUMN     "codeReinitialisation" TEXT,
ADD COLUMN     "codeReinitialisationExpiration" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "codeReinitialisation" TEXT,
ADD COLUMN     "codeReinitialisationExpiration" TIMESTAMP(3);
