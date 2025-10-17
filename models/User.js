const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {type : String, default:"admin" },
  twoFASecret: {type : String, default: null}, // Will hold Google Authenticator secret
  resetToken:  {type : String, default: null},
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
