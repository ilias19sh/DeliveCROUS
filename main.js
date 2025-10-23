require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('./generated/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient()
const app = express();
const PORT = 3000

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'cle_secrete_anas_koman_ilias_delivecrous_2024';

app.use(express.json());
app.use(express.static('public'));

// Authentification JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Token manquant. Accès non autorisé.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Token invalide ou expiré.'
      });
    }

    req.user = user;
    next();
  });
}

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/public/index.html');
})

//---------------------Routes d'authentification------------------//

// Route de connexion (login)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route d'inscription 
app.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
        role: role || 'student'
      }
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Compte créé avec succès',
      token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour vérifier le token
app.get('/verify-token', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Token valide',
    user: req.user 
  });
});


app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

//---------------------Route pour les users----------------------------------//
// Route publique pour voir les utilisateurs 
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
  res.json(users);
});


app.get('/users/:id', authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    
    
    if (req.user.userId !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const user = await prisma.user.findUnique({
       where : { id },
       select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
});

// Route admin pour créer un utilisateur
app.post('/users', authenticateToken, async (req,res) => {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé - Admin requis' });
    }
    
    const { name, email, password, role } = req.body; 
    
    try {
     
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
          data : {name, email, password: hashedPassword, role}
      });
      
      res.json({
        message: `${user.name} créé avec succès`,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la création' });
    }
})

app.put('/users/:id', async (req,res) => {
    const id = parseInt(req.params.id);
    const {name, email, password, role} = req.body
    const user = await prisma.user.update({
        where : {id},
        data : {name, email, password, role}
    })

    res.send(`${name} bien modifié`)
})

app.delete('/users/:id', async(req,res) => {
    const id = parseInt(req.params.id);
    const user = await prisma.user.delete({
        where : {id}
    })
    res.send(`${user.name} bien supprimé`)
})

//--------------------Route pour les plats---------------------//
app.get('/plats', async (req,res) =>{
    const plats = await prisma.plat.findMany();
    res.json(plats);
})

app.get('/plats/:id', async (req, res) => {
    const id = parseInt(req.params.id)
  const plats = await prisma.plat.findUnique({
     where : { id }
});
  res.json(plats);
});

app.post('/plats', async (req,res)=>{
    const {name, description, price, category, allergenes} = req.body;
    const plat = await prisma.plat.create({
        data : {name, description, price, category, allergenes}
    })
    res.send(`${plat.name} bien posté`)
})

app.put ('/plats/:id', async (req,res)=>{
    const id = parseInt(req.params.id);
    const {name, description, price, category, allergenes} = req.body;
    const plats = await prisma.plat.update({
        where : {id},
        data : {name, description, price, category, allergenes}
    })
    res.send(`${plats.name} bien modifié`)
})
app.delete('/plats/:id', async (req,res)=>{
    const id = parseInt(req.params.id);
    const plats = await prisma.plat.delete({
        where : {id}
    })
    res.send(`${plats.name} bien supprimé`)
})

//----------------------------------Routes pour Commande---------------------// 
// Route pour voir ses propres commandes (utilisateur connecté)
app.get('/mes-commandes', authenticateToken, async (req,res) =>{
    try {
      const commandes = await prisma.commande.findMany({
        where: { userId: req.user.userId },
        include: {
          plat: true,
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(commandes);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route admin pour voir toutes les commandes
app.get('/admin/commandes', authenticateToken, async (req,res) =>{
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé - Admin requis' });
    }
    
    try {
      const commandes = await prisma.commande.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          plat: true
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(commandes);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour voir une commande spécifique
app.get('/commande/:id', authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
      const commande = await prisma.commande.findUnique({
         where : { id },
         include: {
           user: {
             select: { id: true, name: true, email: true }
           },
           plat: true
         }
      });
      
      if (!commande) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
      
      
      if (commande.userId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès refusé' });
      }
      
      res.json(commande);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
});


app.post('/commande', authenticateToken, async (req, res) => {
    const { plats, total, pointLivraison } = req.body;
    
    if (!plats || plats.length === 0) {
      return res.status(400).json({ error: "Au moins un plat est requis." });
    }

    try {
      const commande = await prisma.commande.create({
        data: {
          user: { connect: { id: req.user.userId } }, // Utilise l'ID de l'utilisateur connecté
          plat: { connect: plats.map((platId) => ({ id: platId })) },
          total,
          pointLivraison,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          plat: true,
        },
      });

      res.json({
        message: `Commande créée avec succès`,
        commande,
      });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la création de la commande' });
    }
});

app.put('/commande/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { total, statut, pointLivraison, plats } = req.body;

    const dataToUpdate = {};
    if (total !== undefined) dataToUpdate.total = total;
    if (statut !== undefined) dataToUpdate.statut = statut;
    if (pointLivraison !== undefined) dataToUpdate.pointLivraison = pointLivraison;

    if (plats && plats.length > 0) {
      dataToUpdate.plat = {
        set: plats.map((platId) => ({ id: platId })),
      };
    }

    const updatedCommande = await prisma.commande.update({
      where: { id },
      data: dataToUpdate,
      include: { user: true, plat: true },
    });

    res.json({
      message: `Commande ${updatedCommande.id} mise à jour avec succès.`,
      commande: updatedCommande,
    });
});



app.delete('/commande/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
   
    const commande = await prisma.commande.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!commande) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    
    if (commande.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await prisma.commande.delete({
      where: { id }
    });

    res.json({ 
      message: `Commande ${id} supprimée avec succès`,
      success: true 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
  }
});



// exportation de l'app pour le test 
module.exports = app;
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
}
