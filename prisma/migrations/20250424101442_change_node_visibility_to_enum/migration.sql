-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "nodes" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';
