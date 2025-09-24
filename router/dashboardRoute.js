const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/auth");
const Image = require("../models/Image");

// Admin Dashboard
router.get("/dashboard", isLoggedIn, async (req, res) => {
  try {
    // Fetch all products sorted by newest first
    const images = await Image.find().sort({ createdAt: -1 });

    // Render dashboard view with images and logged-in user
    res.render("dashboard", {
      images,
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load products.");
    res.redirect("/");
  }
});

module.exports = router;
