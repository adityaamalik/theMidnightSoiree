const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  countInStock: Number,
  description: String,
  instruction: String,
  sizes: String, // make a string "s", "sm", "sml", "sl", "ml", etc and then separate the letters to get the available sizes
  colors: String, //comma separated names of colors
  images: Object,
});

const Product = mongoose.model("Product", productSchema);

const orderSchema = new mongoose.Schema({
  title: String,
  name: String,
  email: String,
  phone: String,
  address1: String,
  address2: String,
  city: String,
  state: String,
  zip: String,
  paymentMethod: String,
  orders: Object,
});

const Order = mongoose.model("Order", orderSchema);

app.get("/", (req, res) => {
  Product.find({}, (err, items) => {
    if (err) console.log(err);
    else res.render("landing", { products: items });
  }).limit(3);
});

app.get("/products", (req, res) => {
  Product.find({}, (err, items) => {
    if (err) console.log(err);
    else res.render("products", { items: items });
  });
});

app.get("/checkout", (req, res) => {
  res.render("checkout");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/thankyou", (req, res) => {
  res.render("thankyou");
});

app.get("/product/:product_id", (req, res) => {
  Product.findOne({ _id: req.params.product_id }, (err, product) => {
    if (err) console.log(err);
    else res.render("productDetails", { product: product });
  });
});

app.post("/checkout", (req, res) => {
  const orderedProducts = [];
  for (const [key, value] of Object.entries(req.body)) {
    if (
      key !== "title" &&
      key !== "name" &&
      key !== "phone" &&
      key !== "address1" &&
      key !== "email" &&
      key !== "address2" &&
      key !== "paymentMethod" &&
      key !== "city" &&
      key !== "state" &&
      key !== "zip"
    ) {
      orderedProducts.push(JSON.parse(value));
    }
  }

  if (orderedProducts.length !== 0) {
    const order = {
      title: req.body.title,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address1: req.body.address1,
      address2: req.body.address2,
      paymentMethod: req.body.paymentMethod,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      orders: orderedProducts,
    };

    Order.create(order, (err, item) => {
      if (err) console.log(err);
      else console.log(item);
    });
    res.redirect("/thankyou");
  } else {
    res.redirect("/products");
  }
});

app.listen(process.env.PORT || "3001", () => {
  console.log("Server has started!");
});
