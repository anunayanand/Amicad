const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const Image = require("../models/Image");

router.post("/:id", async (req, res) => {
  try {
    const product = await Image.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    // Delete all images from Cloudinary
    for (let publicId of product.publicIds) {
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete product from MongoDB
    await Image.findByIdAndDelete(req.params.id);

    res.redirect("/dashboard"); // redirect to admin dashboard
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
});

module.exports = router;
