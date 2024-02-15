const express = require('express');
const mongoose = require('mongoose');

const app = express();

const port = 3000;

app.set("view engine", "ejs")

// required for receiving form data from a browser
app.use(express.urlencoded({ extended: true }));

// TODO: Update this code depending on if you are using the Mongo Atlas or the locally installed mongo
const mongoURI 
    = "mongodb+srv://101427737:TiGIC7U0uUfzhEMY@group2fullstackdev.kre9oem.mongodb.net/"
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

// TODO: Schema and Models

// Connect to MongoDB
const connectToDatabase = async () => {
    try {
      await mongoose.connect(mongoURI, mongoOptions);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  };

// Menu Item Schema
const menuSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    image: String,
});

// Model
const Menu = mongoose.model("menu_items_collection", menuSchema);
// -----------------------------------------

// Order Schema
const orderSchema = new mongoose.Schema({
    name: String,
    deliveryAddress: String,
    totalPrice: Number,
    dateOfOrder: Date,
    status:String
}); 

// Model
const Order = mongoose.model("orders_collection", orderSchema);
// ---------------------------------------

// Driver Schema
const driversSchema = new mongoose.Schema({
    username: String,
    password: String,
    fullName: String,
    vModel: String,
    vYear:Number,
    vColor: String,
    vPlate: String
});

// Model
const Driver = mongoose.model("drivers_collection", driversSchema);
// --------------------------------------




let totalPrice = 0;
let currentOrder = [];
let orderPlaced = "";
let orderStatus = "";


app.get("/", async (req, res) => {
    try {
        const menu = await Menu.find();
        const orders = await Order.find();
        console.log(menu);
        res.render('restaurant.ejs', {menu, totalPrice, currentOrder, orders, orderPlaced, orderStatus});
    } catch (err) {
        res.send("Error: with the / endpoint");
    }
})


app.post('/addItem/:dishId', async (req, res) => {
    try {
        const itemId = req.params.dishId; 
        console.log(itemId);
        // Retrieve the item from the database
        const item = await Menu.findById(itemId);
        console.log(totalPrice);
        // Add the item to the currentOrder array
        currentOrder.push(item);
        console.log(currentOrder);
        // Update the total price
        orderStatus = "";
        orderPlaced = "";
        totalPrice += item.price;
        return res.redirect('/');
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error adding item to order' });
    }
});

app.post("/orderNow", async (req, res) => {
    console.log("DEBUG: Recieved data from the form");
    console.log(req.body);

    const newOrder = new Order({
        name: req.body.customerName,
        deliveryAddress: req.body.deliveryAddress,
        totalPrice: parseInt(req.body.totalPrice),
        dateOfOrder: req.body.dateOfOrder,
        status:"received"
    });

    try {
        await newOrder.save();
        orderPlaced = `Order number ${newOrder._id} placed by ${newOrder.name}.
        THANK YOU FOR YOUR ORDER!`;
        orderStatus = "";
        currentOrder = [];
        totalPrice = 0;
        return res.redirect('/');
    } catch (err) {
        res.status(500).json({ error: 'Error adding item to order' });
    }
})

app.post("/orderStatus/", async (req, res) => {
    console.log("DEBUG: Recieved data from the form");
    console.log(req.body);
    const orderNum = req.body.orderNum;
    try{
        const item = await Order.findById(orderNum);
        orderStatus= `Order ${orderNum} placed by ${item.name} status is ${item.status}`;
        return res.redirect('/');
    } catch (err) {
        orderStatus = "Error order number does not exist";
        return res.redirect('/');
    }
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    connectToDatabase();
});