/*
  Warnings:

  - Added the required column `updated_at` to the `relations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "relations" ADD COLUMN     "evidence" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
