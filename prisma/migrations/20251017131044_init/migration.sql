/*
  Warnings:

  - The primary key for the `Plat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Plat` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "allergenes" TEXT NOT NULL,
    "availability" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Plat" ("allergenes", "availability", "category", "createdAt", "description", "id", "image", "name", "price") SELECT "allergenes", "availability", "category", "createdAt", "description", "id", "image", "name", "price" FROM "Plat";
DROP TABLE "Plat";
ALTER TABLE "new_Plat" RENAME TO "Plat";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
