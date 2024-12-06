-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `barang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
