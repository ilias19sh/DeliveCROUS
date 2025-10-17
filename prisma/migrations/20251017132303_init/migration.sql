-- CreateTable
CREATE TABLE "Commande" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'en_attente',
    "pointLivraison" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Commande_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CommandeToPlat" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CommandeToPlat_A_fkey" FOREIGN KEY ("A") REFERENCES "Commande" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CommandeToPlat_B_fkey" FOREIGN KEY ("B") REFERENCES "Plat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_CommandeToPlat_AB_unique" ON "_CommandeToPlat"("A", "B");

-- CreateIndex
CREATE INDEX "_CommandeToPlat_B_index" ON "_CommandeToPlat"("B");
