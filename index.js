const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// MIDDLEWARE
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ppdfwyq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productsCollection = client.db("productsDB").collection("products");
    // create new collection
    const cartsItemsCollection = client.db("productsDB").collection("carts");
    const categoryBrandsCollection = client.db("productsDB").collection("categorybrands");

    app.get('/categorybrands', async(req, res) => {
      const cursor = categoryBrandsCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })



    // All data stored and show display
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // single data catch and display showing
    app.get("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await productsCollection.findOne(query);
        if (result) {
          res.send(result);
        } else {
          res.status(404).send("Product not found");
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });
    // user post product
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });
    // update product
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedProduct = req.body;
      const update = {
        $set: {
          brandName: updatedProduct.brandName,
          productName: updatedProduct.productName,
          productImage: updatedProduct.productImage,
          productPrice: updatedProduct.productPrice,
          productRating: updatedProduct.productRating,
          productCategory: updatedProduct.productCategory,
          productTitle: updatedProduct.productTitle,
          productDetails: updatedProduct.productDetails,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        update,
        options
      );
      res.send(result);
    });

    // Card product stored
    app.get("/carts", async (req, res) => {
      const cursor = cartsItemsCollection.find();
      const items = await cursor.toArray();
      res.send(items);
    });

    app.post("/carts", async (req, res) => {
      const item = req.body;
      console.log(item);
      const result = await cartsItemsCollection.insertOne(item);
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartsItemsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("SERVER IS RUNNING PORT");
});

app.listen(port, () => {
  console.log(`SERVER IS RUNNING PORT ON ${port}`);
});
