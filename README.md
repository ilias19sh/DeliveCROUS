bla bla# 🍽️ DeliveCROUS

## Équipe
| Membre | Rôle principal | Contribution |
|---------|----------------|---------------|
| **Ilias Hafnaoui** | Développeur Back-End | Initialisation du serveur Express, création des routes `users`, et gestion de la logique serveur principale |
| **Koman BONI** | Développeur Authentification & Données | Mise en place du système **JWT**, création du modèle `Plat`, intégration de la base SQLite avec Prisma,creation de front |
| **Anas CHEBBI** | finalisation du modèle `Commande`, creation du Rapport PDF, Développeur Tests & Intégration | Création et automatisation des **tests Jest/Supertest**, ajout du fichier `.env.test`,  |

---

##  Description du projet:
**DeliveCROUS** est une application web de livraison de repas pour les étudiants.  
Elle permet :
- de gérer l’inscription et la connexion des utilisateurs,
- de passer et consulter des commandes,
- d’accéder aux informations d’un plat,
- et de gérer les statuts des commandes (en préparation, livrée, etc.).

Le projet repose sur une **API REST** développée en **Node.js / Express**, avec **Prisma ORM** et une base **SQLite**.

---

## ⚙️ Technologies utilisées

| Technologie | Utilisation |
|--------------|-------------|
| **Node.js / Express** | Serveur web et API REST |
| **Prisma ORM** | Gestion et mapping de la base de données |
| **SQLite** | Base de données locale relationnelle |
| **JWT (jsonwebtoken)** | Authentification sécurisée des utilisateurs |
| **dotenv** | Gestion des variables d’environnement |
| **Jest / Supertest** | Tests unitaires et d’intégration de l’API |

---

##  Installation

### 1 Cloner le dépôt
```bash
git clone https://github.com/ilias19sh/DeliveCROUS.git
cd DeliveCROUS
2️ Installer les dépendances
npm install

3️ Créer la base de données avec Prisma
npx prisma db push

4️ Lancer le serveur
npm start


Le serveur démarre par défaut sur le port 3000.
 Accès : http://localhost:3000

 Variables d’environnement

Créer un fichier .env à la racine du projet :

DATABASE_URL="file:./dev.db"
JWT_SECRET="change_me"
PORT=3000


Pour les tests (.env.test) :

DATABASE_URL="file:./test.db"
JWT_SECRET="test_secret_change_me"
PORT=3001

Routes principales de l’API :
Utilisateurs:
Méthode	       Route	                 Description
POST	      /register	         Inscription d’un nouvel utilisateur
POST	      /login	         Connexion et génération d’un token JWT
GET	          /profile	         Récupération du profil de l’utilisateur connecté
    Plats:
Méthode	                   Route	Description
GET	                      /plats	Liste de tous les plats disponibles
POST                      /plats	Ajout d’un plat (si route protégée admin)
GET	                      /plats/:id	Récupère les détails d’un plat spécifique
 Commandes:
Méthode	                  Route	          Description
POST	                /commande    	Crée une nouvelle commande pour un utilisateur connecté
GET	                    /commande/:id	Récupère une commande par son identifiant
PUT                  	/commande/:id	Met à jour une commande (ex : statut, modification de plat)
DELETE               	/commande/:id	Supprime une commande (si elle n’est pas encore livrée)
 
 
 Tests:

Les tests ont été développés avec Jest et Supertest :

Vérifient les routes /register, /login, /profile

Utilisent une base isolée test.db

Réinitialisent automatiquement le schéma avant chaque exécution

Lancer les tests :
npm test



   Exemple de schéma Prisma
model User {
  id        Int        @id @default(autoincrement())
  name      String?
  email     String     @unique
  password  String
  commandes Commande[] }


model Commande {
  id        Int        @id @default(autoincrement())
  plat      String
  status    String     @default("en préparation")
  createdAt DateTime   @default(now())
  userId    Int
  user      User       @relation(fields: [userId], references: [id])}


     Commandes utiles:
Commande	          Description
npm start	          Lance le serveur
npm run dev        	Lance le serveur en mode développement (avec nodemon)
npx prisma studio	 Interface web pour visualiser la base SQLite
npm test	         Exécute les tests Jest
