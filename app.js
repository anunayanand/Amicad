const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const cloudinary = require("cloudinary").v2;
const Image = require("./models/Image");
dotenv.config();
const app = express();

// MongoDB connection
require("./db");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // <-- Needed for JSON body parsing (toggle-home)
app.use(methodOverride("_method"));

// Session & Flash
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

// Make flash + user available in templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.session.user || null;
  next();
});

// Routes
const authRoute = require("./router/authRoute");
const uploadRoute = require("./router/uploadRoute");
const deleteRoute = require("./router/deleteRoute");
const editRoute = require("./router/editRoute");
const dashboardRoute = require("./router/dashboardRoute");
const toggleHomeRoute = require("./router/showHomeRoute");

// Use Routes
app.use("/auth", authRoute);
app.use("/upload", uploadRoute);
app.use("/delete", deleteRoute);
app.use("/edit", editRoute);
app.use("/toggle-home", toggleHomeRoute); // <-- toggle route
app.use("/", dashboardRoute); // dashboard & home
app.get('/project',async(req,res)=>{
   try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.render("project", { images });
  } catch (err) {
    console.error(err);
    res.send("Error loading products");
  }
})
app.get('/contact',(re,res)=>{
  res.render('contact');
})

// Public home page
app.get("/", async (req, res) => {
  try {
    const images = await Image.find({ showOnHome: true }).sort({ createdAt: -1 });
    res.render("index", { images });
  } catch (err) {
    console.error(err);
    res.send("Error loading products");
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
