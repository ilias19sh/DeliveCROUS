/*
  Warnings:

  - The primary key for the `Commande` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Commande` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `userId` on the `Commande` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `A` on the `_CommandeToPlat` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Commande" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "total" REAL NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'en_attente',
    "pointLivraison" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Commande_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Commande" ("createdAt", "id", "pointLivraison", "statut", "total", "updatedAt", "userId") SELECT "createdAt", "id", "pointLivraison", "statut", "total", "updatedAt", "userId" FROM "Commande";
DROP TABLE "Commande";
ALTER TABLE "new_Commande" RENAME TO "Commande";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "role") SELECT "createdAt", "email", "id", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new__CommandeToPlat" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CommandeToPlat_A_fkey" FOREIGN KEY ("A") REFERENCES "Commande" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CommandeToPlat_B_fkey" FOREIGN KEY ("B") REFERENCES "Plat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__CommandeToPlat" ("A", "B") SELECT "A", "B" FROM "_CommandeToPlat";
DROP TABLE "_CommandeToPlat";
ALTER TABLE "new__CommandeToPlat" RENAME TO "_CommandeToPlat";
CREATE UNIQUE INDEX "_CommandeToPlat_AB_unique" ON "_CommandeToPlat"("A", "B");
CREATE INDEX "_CommandeToPlat_B_index" ON "_CommandeToPlat"("B");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
