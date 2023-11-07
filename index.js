const express = require('express')
const cors = require('cors')
const app = express()
const jwt = require('jsonwebtoken')
require('dotenv').config()
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
 }))
app.use(express.json())

app.get('/', (req, res)=>{
    res.send('job server is running')
})


const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zelnjpd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

// verification
const verify = async(req, res, next) =>{
    try{
        const token = req.cookies?.token
    console.log(token)
    if(!token){
        res.send({status: 'unAuthorized Acceess', code: '401'})
    }
    next()
    }
    catch(err){
        console.log(err)
    }
}
// console.log(verify)



    const jobsCollection = client.db('jobsDB').collection('jobs')
    const applyColletction = client.db('applyDB').collection('apply')
    const myJobCollection = client.db('myJobDb').collection('myJob')
    app.post('/jobs', async(req, res) =>{
        try{
            const body = req.body;
        console.log(body)
        const result = await jobsCollection.insertOne(body)
        res.send(result)
        }
        catch(err){
            console.log(err)
        }
    })
    app.get('/jobs', async(req, res) =>{
        try{
            const result = await jobsCollection.find().toArray()
            res.send(result)
        }
        catch(err){
            console.log(err)
        }
    })
    app.get('/jobs/:id', async(req, res) =>{
        try{
            const id = req.params.id;
            const query = { _id: new ObjectId(id)}
            const result = await jobsCollection.findOne(query)
            res.send(result)
        }
        catch(err){
            console.log(err)
        }
    })
    app.post('/apply', async(req, res) =>{
        try{
            const apply = req.body;
            // console.log(apply)
            const result = await applyColletction.insertOne(apply)
            res.send(result)
        }
        catch(err){
            console.log(err)
        }
    })
    app.get('/apply', verify, async(req, res) =>{
        try{
            // console.log(req.query.email)
            let query = {}
            if(req.query?.email){
                query = {email: req.query.email}
            }
            const result =await applyColletction.find(query).toArray()
            res.send(result)
        }
        catch(err){
            console.log(err)
        }
    })
    app.post('/myjobs', async(req, res) =>{
        try{
            const myjobs = req.body;
            console.log(myjobs)
            const result = await myJobCollection.insertOne(myjobs)
            res.send(result)
        }
        catch(err){
            console.log(err)
        }
    })
    app.get('/myjobs', verify, async(req, res) =>{
        try{
            let query = {}
            if(req.query?.email1){
                query = {email: req.query.email1}
            }
            const result = await myJobCollection.find(query).toArray()
            res.send(result)
        }
        catch(err){
            console.log(err)
        }
    })
    app.get('/myjobs/:id', async(req, res) =>{
        try{
            const id = req.params.id;
            const query = { _id: new ObjectId(id)}
            const result = await myJobCollection.findOne(query)
            res.send(result)
        }
        catch(err){
            console.log(err)
        }
    })
    app.delete('/myjobs/:id', async(req, res) =>{
        try{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await myJobCollection.deleteOne(query)
            res.send(result)
        }
        catch(err){
            console.log(err)
        }
    })
    app.put('/myjobs/:id', async(req, res) =>{
        try{
            const id = req.params.id
            const filter = {_id: new ObjectId(id)}
            const options = {upsert: true}
            const updatedjob = req.body
            const updated ={
                $set: {
                    name: updatedjob.name,
      title: updatedjob.title,
      category: updatedjob.category,
      salary: updatedjob.salary,
      description: updatedjob.description,
      date: updatedjob.date,
      deadline: updatedjob.deadline,
      photo: updatedjob.photo,
      applicants: updatedjob.applicants,
      email1: updatedjob.email1,}
            }
            const result = await myJobCollection.updateOne(filter, updated, options)
        res.send(result)
        }
        catch(err){
            console.log(err)
        }
        
    })

    // jwt function -------

    app.post('/jwt', async(req, res) =>{
        const user = req.body
        const token = jwt.sign(user, process.env.SECRET_TOKEN, {expiresIn: '10h'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        })
        .send({success: true})
    })
    app.post('/logout', async(req, res) =>{
        const user = req.body;
        console.log(user)
        res.clearCookie('token',{maxAge: 0}).send({success: true})
    })
    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, ()=>{
    console.log(`server is running on port: ${port}`)
})