/*
  Warnings:

  - You are about to drop the column `nom` on the `Plat` table. All the data in the column will be lost.
  - Added the required column `name` to the `Plat` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "allergenes" TEXT NOT NULL,
    "availability" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Plat" ("allergenes", "availability", "category", "createdAt", "description", "id", "image", "price") SELECT "allergenes", "availability", "category", "createdAt", "description", "id", "image", "price" FROM "Plat";
DROP TABLE "Plat";
ALTER TABLE "new_Plat" RENAME TO "Plat";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
