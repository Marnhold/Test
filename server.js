const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

// define Schema Class
const Schema = mongoose.Schema;

// Create a Schema object
const carSchema = new Schema({
  id:Number,
  name: String,
  model: String,
  year: Number,
  sedan: Boolean
});

// This Activitry creates the collection called cars
const Car = mongoose.model("Car", carSchema);

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

//connection to the chosen atlas database.
const uri = "mongodb+srv://projectAdmin:admin123@cluster0.f3fsce9.mongodb.net/carLot";


mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true,  useUnifiedTopology: true   }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

app.use("/inventory" ,function (req, res, next) {
  next();
});


app.get("/", async (req, res) => {  //route to get all documents from collection

  try {
    const doc = await Car.find(); //gettin all docs from collection
    if (!doc) return res.status(404).json({ msg  : "Doc not found" });
    res.json(doc); //return all docs from collection
  } catch (err) {
    console.error(err.message);
  }
});``

app.route('/add').post(async (req, res) => { //route to add a new document on the database
   
  const {name, model, year, sedan} = req.body;
  const id = Math.floor(Math.random()*10000,0);
  
  const car = new Car({ //assigning the read variables to the document that will be sent to database
    id, name, model, year, sedan
  });
  
  try{    
    car  //add document to database
      .save()
      .catch((err) => res.status(400).json('Error: ' + err));

      res.json("Car added to collection");
  }catch(err)
  {
    console.log(err.message);
  }

});

app.get("/:id", async (req, res) => {  //route to get all documents from collection

  try {

    const id1 = req.params.id; //getting the requested id from the body
    const docs = await Car.find(); //getting all documents from collection
    var doc = docs.find(doc => doc.id == id1); //filtering the document with the chosen id

    if (!doc) return res.status(404).json({ msg  : "Doc not found" });
    res.json(doc); //return all docs from collection
  } catch (err) {
    console.error(err.message);
  }
});

app.delete('/delete/:id', async (req, res) => { //route to delete document with specific ID

    const id1 = req.params.id; //get requested id
    const docs = await Car.find(); //get all documents
    var doc = docs.find(doc => doc.id == id1); //get document with requested id
    console.log(doc._id);
    console.log(id1);
    console.log(doc);

  await Car.findByIdAndDelete(doc._id) //with the requested document, delete document with using its _id
      .then(() => res.json('Activity deleted.'))
      .catch((err) => res.status(400).json('Error: ' + err));
});

app.post('/update/:id', async (req, res) => {//route to update document with specific ID

  try {
    const id = req.params.id; //get requested id
    const docs = await Car.find();// get all documents
    var doc = docs.find(doc => doc.id == id); //filter doc to be updated
    if (!doc) return res.status(404).json({ msg  : "Doc not found" });
    const dbId = doc._id; //get _id of found document

    await  Car.findByIdAndUpdate(dbId,req.body)  //updatig the chosen _id with the request on the frontend body
        .then(() => res.json('Activity updated!'))
        .catch((err) => res.status(400).json('Error: ' + err));
    
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId")
      return res.status(404).json({ msg: "Doc not found" });

    res.status(500).send("Server Error");
  }

});


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
