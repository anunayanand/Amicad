const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Your User model
const bcrypt = require("bcrypt");

// Middleware to check if admin exists
async function checkAdminExists(req, res, next) {
  const adminCount = await User.countDocuments();
  if (adminCount === 0) {
    // No admin exists, redirect to register
    if (req.path !== "/register") return res.redirect("/auth/register");
  } else {
    // Admin exists, block register page
    if (req.path === "/register") return res.redirect("/auth/login");
  }
  next();
}

router.use(checkAdminExists);

// Register route
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  try {
    const {  email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/auth/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    req.flash("success", "Admin account created! Please log in.");
    res.redirect("/auth/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error creating account");
    res.redirect("/auth/register");
  }
});

// Login route
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/auth/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/auth/login");
    }

    req.session.user = user;
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Login error");
    res.redirect("/auth/login");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
