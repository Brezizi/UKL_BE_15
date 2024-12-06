/*
  Warnings:

  - You are about to drop the column `quantity` on the `item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `item` DROP COLUMN `quantity`,
    ADD COLUMN `stock` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `transaksi` ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 0;
