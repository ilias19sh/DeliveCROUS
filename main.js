const express = require('express');
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient()
const app = express();
const PORT = 3000


app.use(express.json());

app.get('/', (req,res) => {
    res.send('hello world')
})

//Route pour les users
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
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

//Route pour les plats
app.get('/plats', async (req,res) =>{
    const plats = await prisma.plat.findMany();
    res.json(plats);
})

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
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});