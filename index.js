const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
require("dotenv").config();
// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.858ok.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db("TravelAgency");
    const servicesTable = database.collection("services");
    const bookingTable = database.collection("bookings");
    // Insert Services
    app.post("/services", async (req, res) => {
      const result = await servicesTable.insertOne(req.body);
      res.json(result);
    });

    // Get Services
    app.get("/services", async (req, res) => {
      const cursor = servicesTable.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    // Delete Services
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesTable.deleteOne(query);
      await bookingTable.deleteOne({ serviceId: id });
      if (result.deletedCount === 1) {
        res.send(result);
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
    });

    // Single data Get
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesTable.findOne(query);
      res.json(result);
    });

    // Booking Api

    // Bookign Post API
    app.post("/bookign", async (req, res) => {
      const query = { serviceId: req.body.services._id, email: req.body.email };
      const checking = await bookingTable.findOne(query);

      if (checking) {
        res.json("Already Booking");
      } else {
        const result = await bookingTable.insertOne(req.body);
        res.json(result);
      }
    });

    // status update
    app.put("/booking/staus/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "approved",
        },
      };
      const result = await bookingTable.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // getBooking for Query
    app.post("/bookign/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = bookingTable.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });
    // get Single booking
    app.get("/booking", async (req, res) => {
      const cursor = bookingTable.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // get All booking data
    app.get("/booking/all", async (req, res) => {
      const cursor = bookingTable.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // delete Booking Api
    app.delete("/bookign/delete/:id", async (req, res) => {
      const id = ObjectId(req.params.id);
      const query = { _id: id };
      const result = await bookingTable.deleteOne(query);
      if (result.deletedCount === 1) {
        res.json("Successfully deleted ");
      } else {
        res.json(`No documents matched the query. Deleted ${id} documents.`);
      }
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  console.log("Travel Agencey Running");
  res.send("Server Ranning");
});

app.listen(port, () => {
  console.log(port);
});
