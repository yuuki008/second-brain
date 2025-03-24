/*
  Warnings:

  - You are about to drop the column `parent_id` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the `_TermToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `terms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TermToTag" DROP CONSTRAINT "_TermToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_TermToTag" DROP CONSTRAINT "_TermToTag_B_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_parent_id_fkey";

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "parent_id";

-- DropTable
DROP TABLE "_TermToTag";

-- DropTable
DROP TABLE "terms";

-- CreateTable
CREATE TABLE "nodes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "image_url" TEXT,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relations" (
    "id" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_NodeToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NodeToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "nodes_name_key" ON "nodes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "relations_fromNodeId_toNodeId_key" ON "relations"("fromNodeId", "toNodeId");

-- CreateIndex
CREATE INDEX "_NodeToTag_B_index" ON "_NodeToTag"("B");

-- AddForeignKey
ALTER TABLE "relations" ADD CONSTRAINT "relations_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relations" ADD CONSTRAINT "relations_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NodeToTag" ADD CONSTRAINT "_NodeToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NodeToTag" ADD CONSTRAINT "_NodeToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
