/*
  Warnings:

  - Made the column `userId` on table `nodes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `tags` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "nodes" DROP CONSTRAINT "nodes_userId_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_userId_fkey";

-- AlterTable
ALTER TABLE "nodes" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "tags" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
