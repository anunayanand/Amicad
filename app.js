const express = require("express");
const dotenv = require("dotenv");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const path = require("path");
const Image = require("./models/Image");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");

dotenv.config();
const app = express();

// MongoDB connection
require("./db");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method")); 

// Session middleware (⚡must come before routes)
app.use(
  session({
    secret: "supersecretkey", // put in .env for production
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

// Public route → gallery
app.get("/", async (req, res) => {
  const images = await Image.find().sort({ createdAt: -1 });
  res.render("index", { images });
});

// Routes
const authRoute = require("./router/authRoute");
const uploadRoute = require("./router/uploadRoute");
const deleteRoute = require("./router/deleteRoute");
const editRoute = require("./router/editRoute");
const dashboardRoute = require("./router/dashboardRoute");

app.use("/auth", authRoute);
app.use("/upload", uploadRoute);
app.use("/delete", deleteRoute);
app.use("/edit", editRoute);
app.use("/", dashboardRoute);

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
