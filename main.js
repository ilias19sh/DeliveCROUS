const express = require('express');
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient()
const app = express();
const PORT = 3000


app.use(express.json());

app.get('/', (req,res) => {
    res.send('hello world')
})

//---------------------Route pour les users----------------------------------//
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get('/users/:id', async (req, res) => {
    const id = parseInt(req.params.id)
  const users = await prisma.user.findUnique({
     where : { id }
});
  res.json(users);
});

app.post('/users', async (req,res) => {
    const { name, email, password, role } = req.body; 
    const user = await prisma.user.create({
        data : {name, email, password, role}
    })
    res.send(`${user.name} bien posté`)
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
app.get('/commande', async (req,res) =>{
    const commande = await prisma.commande.findMany();
    res.json(commande);
})

app.get('/commande/:id', async (req, res) => {
    const id = parseInt(req.params.id)
  const commande = await prisma.commande.findUnique({
     where : { id }
});
  res.json(commande);
});

app.post('/commande', async (req, res) => {
    const { userId, plats, total, pointLivraison } = req.body;
    if (!userId || !plats || plats.length === 0) {
      return res.status(400).json({ message: "UserId et au moins un plat sont requis." });
    }

    const commande = await prisma.commande.create({
      data: {
        user: { connect: { id: userId } },
        plat: { connect: plats.map((platId) => ({ id: platId })) },
        total,
        pointLivraison,
      },
      include: {
        user: true,
        plat: true,
      },
    });

    res.json({
      message: `Commande créée avec succès pour l'utilisateur ${commande.user.name}`,
      commande,
    });
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



app.delete('/commande/:id', async (req, res) => {
  const id = parseInt(req.params.id);
    await prisma.commande.delete({
      where: { id }
    });
    res.send(`Commande ${id} bien supprimée`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});