const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  urls: [String],       // array of image URLs
  publicIds: [String],  // array of Cloudinary public IDs
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Image", imageSchema);
