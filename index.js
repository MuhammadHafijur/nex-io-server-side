const express = require('express');
const { MongoClient } = require('mongodb');

const cors = require("cors");
require("dotenv").config();

const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t40z5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();

        const database = client.db("nex");
        const carsCollection = database.collection("cars");
        const reviewsCollection = database.collection("reviews");

        // post for cars
        app.post('/cars', async (req, res) => {
          const newCars = req.body // receive data from frontend
          const result = await carsCollection.insertOne(newCars); // save data to the database
          res.send(result); // send response to the frontend.
        });

        // Get for cars
        app.get('/cars', async (req, res) => {
          const cursor = carsCollection.find({});
          const cars = await cursor.toArray()
          res.json(cars)
        });

        // Get for single car
        app.get('/cars/:id', async (req, res) => {
          const id = req.params.id;
          // console.log(id);
          const query = { _id: ObjectId(id) };
          const car = await carsCollection.findOne(query);
          console.log(car);
          res.send(car)
        });

        // POST for reviews
        app.post('/reviews', async(req, res) => {
          const newReview = req.body;
          const result = await reviewsCollection.insertOne(newReview);
          res.send(result);
        })

        // Get for reviews
        app.get('/reviews', async (req, res) => {
          const cursor = reviewsCollection.find({});
          const reviews = await cursor.toArray();
          res.json(reviews)
        });
    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);

// client.connect(err => {
//     // const collection = client.db("test").collection("devices");
//     console.log('database connected')

//     // perform actions on the collection object
//     // client.close();
//   });

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})