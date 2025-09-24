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
router.put("/:id", upload.array("images"), async (req, res) => {
  try {
    const { title, description, mainImageIndex, deleteImages ,downloadUrl} = req.body;
    const product = await Image.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    // Update title and description
    product.title = title;
    product.description = description;
    product.downloadUrl = downloadUrl;

    // Delete selected images
    if (deleteImages) {
      const imagesToDelete = Array.isArray(deleteImages) ? deleteImages : [deleteImages];
      for (let idx of imagesToDelete) {
        idx = parseInt(idx);
        if (product.urls[idx]) {
          await cloudinary.uploader.destroy(product.publicIds[idx]);
          product.urls.splice(idx, 1);
          product.publicIds.splice(idx, 1);
        }
      }
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        product.urls.push(file.path);
        product.publicIds.push(file.filename);
      });
    }

    // Set main image (bring it to index 0)
    if (mainImageIndex !== undefined) {
      const mainIdx = parseInt(mainImageIndex);
      if (product.urls[mainIdx]) {
        const mainUrl = product.urls.splice(mainIdx, 1)[0];
        const mainId = product.publicIds.splice(mainIdx, 1)[0];
        product.urls.unshift(mainUrl);
        product.publicIds.unshift(mainId);
      }
    }

    await product.save();
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating product");
  }
});

module.exports = router;
