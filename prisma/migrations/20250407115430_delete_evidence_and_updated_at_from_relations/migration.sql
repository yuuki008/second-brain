/*
  Warnings:

  - You are about to drop the column `evidence` on the `relations` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `relations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "relations" DROP COLUMN "evidence",
DROP COLUMN "updated_at";
