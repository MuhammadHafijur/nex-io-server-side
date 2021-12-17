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
        const usersCollection = database.collection("users");
        const ordersCollection = database.collection("Orders");

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

        // POST API for ORDER
          app.post("/order", async (req, res) => {
            const order = req.body;
            console.log('Hit the post api', order)
            const result = await ordersCollection.insertOne(order);
            console.log(result)
            res.json(result)
          });

          // Get for order
        app.get('/order', async (req, res) => {
          const cursor = ordersCollection.find({});
          const orders = await cursor.toArray();
          console.log(orders);
          res.json(orders)
        });

        // GET API for Manage Orders
        app.get('/manage-order', async (req, res) => {
          const cursor = ordersCollection.find({});
          const orders = await cursor.toArray();
          console.log(orders);
          res.send(orders);
        })

        // UPDATE API
    // Approve The Pending
      app.put('/approve/:id', async (req, res) => {
      const id = req.params.id;
      // console.log('updating.... ', id)
      const status = req.body.status;
      console.log(status);
      const query = { _id: ObjectId(id) }; // filtering user's object
      const options = { upsert: true }; // update and insert
    

      const updateDoc = { // set data
          $set: {
              status: status
          },
      };
      const result = await ordersCollection.updateOne(query, updateDoc, options)
      res.json(result)
      })

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

        // email
        app.get('/users/:email', async (req, res) => {
          const email = req.params.email;
          const query = {email: email};
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin'){
            isAdmin = true;
          }
          res.json({admin: isAdmin});
        })

        // post for users
        app.post('/users', async (req, res) => {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          console.log(result);
          res.json(result);
        });

        // up
        app.put('/users', async (req, res) => {
          const user = req.body;
          const filter = {email: user.email};
          const options = {upsert: true};
          const updateDoc = {$set: user};
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result)
        });

        app.put('/users/admin', async (req, res) => {
          const user = req.body;
          console.log('put', user)
          const filter = {email: user.email};
          const updateDoc = {$set: {role: 'admin'}};
          const result = usersCollection.updateOne(filter, updateDoc);
          res.json(result)
        })

        // DELETE API
        app.delete('/order/:id', async (req, res) => {
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await ordersCollection.deleteOne(query);
          res.json(result)
        })
    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})