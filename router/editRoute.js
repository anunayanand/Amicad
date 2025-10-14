const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const Image = require("../models/Image");

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });

// Edit product
router.post("/:id", upload.array("images"), async (req, res) => {
  try {
    const { title, description, downloadUrl, mainImageIndex, deleteImages } = req.body;
    const product = await Image.findById(req.params.id);
    if (!product) {
      // console.log("Product not found:", req.params.id);
      return res.redirect("/dashboard");
    }

    // console.log("Original product data:", product);

    // 1️⃣ Update basic fields
    product.title = title;
    product.description = description;
    product.downloadUrl = downloadUrl;
    // console.log("Updated title, description, downloadUrl");

    // 2️⃣ Delete images
    if (deleteImages) {
      const toDelete = Array.isArray(deleteImages) ? deleteImages : [deleteImages];
      const sortedIndexes = toDelete.map(i => parseInt(i)).sort((a,b) => b - a);
      // console.log("Indexes to delete:", sortedIndexes);

      for (const idx of sortedIndexes) {
        if (product.urls[idx]) {
          console.log(`Deleting image at index ${idx}:`, product.urls[idx]);
          await cloudinary.uploader.destroy(product.publicIds[idx]);
          product.urls.splice(idx, 1);
          product.publicIds.splice(idx, 1);
        } 
      }
    }

    // ✅ 3️⃣ Set main image BEFORE adding new images
    if (mainImageIndex !== undefined) {
      const idx = parseInt(mainImageIndex);
      if (product.urls[idx]) {
        const mainUrl = product.urls.splice(idx, 1)[0];
        const mainId = product.publicIds.splice(idx, 1)[0];
        product.urls.unshift(mainUrl);
        product.publicIds.unshift(mainId);
        console.log(`Main image set to index ${idx}:`, mainUrl);
      }
    } 

    // ✅ 4️⃣ Add new images at the end (does not affect main)
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        product.urls.push(file.path);
        product.publicIds.push(file.filename);
        // console.log("Added new image:", file.path);
      });
    }

    // console.log("Final product data before save:", product);
    await product.save();
    // console.log("Product saved successfully");
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error editing product:", err);
    res.redirect('/dashboard');
  }
});

module.exports = router;
