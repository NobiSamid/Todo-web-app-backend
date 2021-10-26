const express = require('express');
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.clgsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        // console.log('DB connected')

        //create database
        const database = client.db('todo-app');
        const notesCollection = database.collection('notes');


        // Get API
        app.get('/notes', async(req, res) =>{
            const cursor = notesCollection.find({});
            const notes = await cursor.toArray();
            res.send(notes);
        })

        //Get single API
        app.get('/notes/:id', async(req, res)=>{
            const id = req.params.id;
            console.log('getting specific note', id);
            const query = {_id: ObjectId(id)};
            const note = await notesCollection.findOne(query);
            res.json(note);
        })


        // Post Api
        app.post('/notes', async(req, res)=>{

            const note = req.body;
            console.log('Hit the post api', note);
            // const note = {
            //     "title":"Make todo app",
            //     "topic":"db",
            //     "description":" kono ek vabe banate parlei holo oto kichu dekhar time nai"
            // }

            const result = await notesCollection.insertOne(note);
            console.log(result);

            res.json(result)
        })

        // Update Api
        // app.put('/notes/:id', async (req, res)=>{
        //     const id = req.params.id;
        //     const updatedNote = req.body;
        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true};
        //     const updateDoc = {
        //         $set:{
        //             title: updatedNote.title,
        //             topic: updatedNote.topic,
        //             description: updatedNote.description
        //         }
        //     };
        //     const result = await notesCollection.updateOne(filter, options, updateDoc);
        //     console.log('updating user', req)
        //     res.json(result);
        // })

        // Update api
        app.put('/notes/:id', async (req, res) =>{
            const id = req.params.id;
            const updatedNote = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true};
            const updateDoc = {
                $set: {
                    title: updatedNote.title,
                    topic: updatedNote.topic,
                    description: updatedNote.description
                },
            };
            const result = await notesCollection.updateOne(filter, updateDoc, options)
            console.log('updating user', updatedNote)
            res.json(result);
        })


        // DELETE API
        app.delete('/notes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await notesCollection.deleteOne(query);
            res.json(result);
        })

    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Running my CRUD server yeeyy");
});

app.listen(port, ()=>{
    console.log("Running server on port", port)
});