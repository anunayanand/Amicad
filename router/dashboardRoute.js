const express = require("express");
const isLoggedIn = require("../middleware/auth");
const router = express.Router();
const Image = require("../models/Image");

router.get("/dashboard", isLoggedIn, async(req, res) => {
 const images = await Image.find().sort({ createdAt: -1 });
  res.render("dashboard",{images});
});

module.exports = router;
