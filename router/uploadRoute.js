const express = require('express');
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const Image = require("../models/Image");

// Multer + Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });

// Upload route
router.post("/", upload.array("images"), async (req, res) => {
  try {
    const { title, description,downloadUrl } = req.body;

    // Map through all uploaded files
    const urls = req.files.map(file => file.path);
    const publicIds = req.files.map(file => file.filename);

    // Save all images as arrays in one product
    const newProduct = new Image({
      title,
      description,
      urls,      // Array of URLs
      publicIds, // Array of Cloudinary public IDs
      downloadUrl
    });

    await newProduct.save();
    res.redirect("/dashboard"); // Redirect to dashboard after upload
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading images");
  }
});


module.exports = router;
