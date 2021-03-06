const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");

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

//razorpay instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
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
  paymentReceived: Boolean,
  totalAmount: Number,
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

app.get("/privacystatement", (req, res) => {
  res.render("privacystatement");
});

app.get("/termsofservice", (req, res) => {
  res.render("termsofservice");
});

app.get("/refundpolicy", (req, res) => {
  res.render("refundpolicy");
});

app.get("/shippingpolicy", (req, res) => {
  res.render("shippingpolicy");
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

  let totalAmount = 0;
  orderedProducts.forEach((prod) => {
    totalAmount =
      totalAmount + parseInt(prod.price.substring(1, prod.price.length));
  });

  if (totalAmount < 2990) {
    totalAmount = totalAmount + 250;
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
      paymentReceived: false,
    };

    Order.create(order, (err, order) => {
      if (err) {
        console.log(err);
      } else {
        const options = {
          amount: totalAmount * 100,
          currency: "INR",
          receipt: parseInt(Math.random() * 10),
        };

        instance.orders.create(options, (err, razorPayorder) => {
          res.redirect(`/payment/${razorPayorder.id}/${order._id}`);
        });
        console.log("Our server order");
        console.log(order);
      }
    });
  } else {
    res.redirect("/products");
  }
});

app.get("/payment/:razorpayOrder_id/:orderId", (req, res) => {
  Order.findOne({ _id: req.params.orderId }, (err, order) => {
    if (err) {
      alert("Order was not created. Please try again!");
      res.redirect("/products");
    } else {
      res.render("payment", {
        razorpayOrder_id: req.params.razorpayOrder_id,
        orderId: req.params.orderId,
        order: order,
      });
    }
  });
});

app.get(
  "/thanks/:orderId/:razorpayOrderId/:payment_id/:signature",
  (req, res) => {
    Order.findByIdAndUpdate(
      req.params.orderId,
      { paymentReceived: true },
      (err, order) => {
        if (err) {
          console.log(err);
        } else {
          console.log(order);
          res.redirect("/thankyou");
        }
      }
    );
  }
);

app.listen(process.env.PORT || "3001", () => {
  console.log("Server has started!");
});
