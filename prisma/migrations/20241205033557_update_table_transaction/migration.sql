/*
  Warnings:

  - Made the column `actualReturnDate` on table `transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `transaction` MODIFY `actualReturnDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
