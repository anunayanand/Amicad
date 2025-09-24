const express = require("express");
const router = express.Router();
const Image = require("../models/Image");

router.post("/:id", async (req, res) => {
  try {
    let { showOnHome } = req.body;
    showOnHome = showOnHome === true || showOnHome === "true";

    const updated = await Image.findByIdAndUpdate(
      req.params.id,
      { showOnHome },
      { new: true }
    );

    if (!updated) return res.json({ success: false });
    res.json({ success: true, showOnHome: updated.showOnHome });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

module.exports = router;
