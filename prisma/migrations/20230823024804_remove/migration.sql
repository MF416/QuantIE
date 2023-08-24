/*
  Warnings:

  - You are about to drop the column `rewardee` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Transaction_contractId_projectId_key";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "rewardee";
