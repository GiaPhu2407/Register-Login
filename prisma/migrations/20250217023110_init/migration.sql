/*
  Warnings:

  - A unique constraint covering the columns `[Sdt]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `users_Sdt_key` ON `users`(`Sdt`);
