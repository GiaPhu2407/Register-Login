-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `Users_idRole_fkey`;

-- CreateTable
CREATE TABLE `permission` (
    `idPermission` INTEGER NOT NULL AUTO_INCREMENT,
    `TenQuyen` VARCHAR(45) NULL,

    UNIQUE INDEX `permission_TenQuyen_key`(`TenQuyen`),
    PRIMARY KEY (`idPermission`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idPermission` INTEGER NOT NULL,
    `idRole` INTEGER NOT NULL,

    UNIQUE INDEX `role_permission_idPermission_idRole_key`(`idPermission`, `idRole`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_idRole_fkey` FOREIGN KEY (`idRole`) REFERENCES `role`(`idrole`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_idRole_fkey` FOREIGN KEY (`idRole`) REFERENCES `role`(`idrole`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_idPermission_fkey` FOREIGN KEY (`idPermission`) REFERENCES `permission`(`idPermission`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `Users_Email_key` TO `users_Email_key`;
