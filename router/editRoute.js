const express = require("express");
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

// Update product
router.post("/edit/:id", upload.array("images"), async (req, res) => {
  try {
    const { title, description, downloadUrl, mainImageIndex, deleteImages } = req.body;
    const product = await Image.findById(req.params.id);
    if (!product) return res.redirect("/admin/dashboard");

    // Update title, description, download URL
    product.title = title;
    product.description = description;
    product.downloadUrl = downloadUrl;

    // Delete images
    if (deleteImages) {
      const toDelete = Array.isArray(deleteImages) ? deleteImages : [deleteImages];
      toDelete.forEach(async idx => {
        idx = parseInt(idx);
        if (product.urls[idx]) {
          await cloudinary.uploader.destroy(product.publicIds[idx]);
          product.urls.splice(idx, 1);
          product.publicIds.splice(idx, 1);
        }
      });
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        product.urls.push(file.path);
        product.publicIds.push(file.filename);
      });
    }

    // Set main image
    if (mainImageIndex !== undefined && product.urls[mainImageIndex]) {
      const idx = parseInt(mainImageIndex);
      const mainUrl = product.urls.splice(idx, 1)[0];
      const mainId = product.publicIds.splice(idx, 1)[0];
      product.urls.unshift(mainUrl);
      product.publicIds.unshift(mainId);
    }

    await product.save();
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing product");
  }
});

module.exports = router;


