const express = require("express");
const router = express.Router();
const Image = require("../models/Image");

router.post("/:id", async (req, res) => {
  try {
    console.log("✅ POST /toggle-home/" + req.params.id);
    console.log("🟡 req.body =", req.body);

    let { showOnHome } = req.body;
    console.log("🟡 Raw showOnHome:", showOnHome);

    if (Array.isArray(showOnHome)) {
      showOnHome = showOnHome.includes("1");
    } else {
      showOnHome = showOnHome === "1" || showOnHome === "true";
    }
    console.log("🟢 Converted showOnHome:", showOnHome);

    const updated = await Image.findByIdAndUpdate(
      req.params.id,
      { showOnHome },
      { new: true }
    );

    if (!updated) {
      console.log("❌ Update failed");
      return res.redirect("/dashboard");
    }

    console.log("✅ Updated successfully:", updated.showOnHome);
    res.redirect("/dashboard");

  } catch (err) {
    console.error("🔥 Error:", err);
    res.redirect("/dashboard");
  }
});


module.exports = router;
