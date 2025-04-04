/*
  Warnings:

  - You are about to drop the column `count` on the `reactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nodeId,emoji,visitorId]` on the table `reactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `visitorId` to the `reactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "reactions_nodeId_emoji_key";

-- AlterTable
ALTER TABLE "reactions" DROP COLUMN "count",
ADD COLUMN     "visitorId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reactions_nodeId_emoji_visitorId_key" ON "reactions"("nodeId", "emoji", "visitorId");
