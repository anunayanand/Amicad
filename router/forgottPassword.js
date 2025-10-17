const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

// 🧠 1. Setup 2FA (One-time setup by admin)
router.get("/setup-2fa", async (req, res) => {
  const admin = await User.findOne({ role: "admin" });
  if (!admin) return res.send("admin not found.");

  const secret = speakeasy.generateSecret({
    name: "Amiicad (Admin)",
  });

  admin.twoFASecret = secret.base32;
  await admin.save();

  const qrDataURL = await qrcode.toDataURL(secret.otpauth_url);

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>admin 2FA Setup</title>
<!-- Bootstrap 5 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark text-light d-flex align-items-center justify-content-center vh-100">

  <div class="card text-dark p-4 shadow text-center" style="max-width: 420px; width: 100%;">
    <h3 class="text-info mb-3">🔐 admin 2FA Setup</h3>
    <p>Scan this QR code in your <b>Google Authenticator</b> app.</p>
    <div class="my-3">
      <img src="${qrDataURL}" alt="QR Code" class="img-fluid rounded bg-white p-2">
    </div>
    <p>Or manually enter this secret:</p>
    <div class="bg-warning bg-opacity-25 rounded py-2 mb-3 text-center fw-bold" style="font-family: monospace;">
      ${secret.base32}
    </div>
    <p class="text-secondary small mb-3">Keep this secret safe. You'll need it to generate login codes.</p>
    <a href="/forgot-password" class="btn btn-info w-100">Forgot Password</a>
  </div>

<!-- Bootstrap JS Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
`);
});

// 🧠 2. Forgot Password — Request
router.get("/forgot-password", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Forgot Password</title>
<!-- Bootstrap 5 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark text-light d-flex align-items-center justify-content-center vh-100">

  <div class="card text-dark p-4 shadow" style="max-width: 400px; width: 100%;">
    <h3 class="text-center text-info mb-3">Forgot Password</h3>
    <p class="text-center text-secondary mb-4">Enter your email to proceed with password reset</p>
    <form method="POST" action="/forgot-password">
      <input type="text" class="form-control mb-3" name="email" placeholder="Enter your email" required>
      <button type="submit" class="btn btn-info w-100">Continue</button>
    </form>
  </div>

<!-- Bootstrap JS Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
`);
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const admin = await User.findOne({ role: "admin" });
  if (!admin) return res.send("admin not found.");
  if (email !== admin.email) return req.flash("error", "Unauthorized Access."), res.redirect("/forgot-password");
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>2FA Verification</title>
<!-- Bootstrap 5 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark text-light d-flex align-items-center justify-content-center vh-100">

  <div class="card text-dark p-4 shadow" style="max-width: 400px; width: 100%;">
    <h3 class="text-center text-info mb-3">🔐 2FA Verification</h3>
    <p class="text-center text-secondary mb-4">Enter your 6-digit code from Google Authenticator</p>
    <form method="POST" action="/verify-2fa">
      <input type="text" class="form-control mb-3 text-center fs-5" name="token" maxlength="6" placeholder="••••••" required />
      <button type="submit" class="btn btn-info w-100">Verify</button>
    </form>
    <p class="text-center text-secondary mt-3 small">Code changes every 30 seconds</p>
  </div>

<!-- Bootstrap JS Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
`);
});

// 🧠 3. Verify 2FA Code before allowing reset
router.post("/verify-2fa", async (req, res) => {
  const { token } = req.body;
  const admin = await User.findOne({ role: "admin" });
  if (!admin) return res.send("admin not found.");

  const verified = speakeasy.totp.verify({
    secret: admin.twoFASecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified) return req.flash("error", "Invalid or expired 2FA code. Please try again."), res.redirect("/forgot-password");

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Reset Password</title>
<!-- Bootstrap 5 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark text-light d-flex align-items-center justify-content-center vh-100">

  <div class="card text-dark p-4 shadow" style="max-width: 400px; width: 100%;">
    <h3 class="text-center text-info mb-3">🔐 Reset Password</h3>
    <p class="text-center text-secondary mb-4">Please enter a strong new password for your admin account.</p>
    <form method="POST" action="/reset-password">
      <div class="mb-3 position-relative">
        <span class="position-absolute top-50 start-0 translate-middle-y ps-3 text-info fs-5">🔑</span>
        <input type="password" class="form-control ps-5" name="newPassword" placeholder="Enter new password" required>
      </div>
      <button type="submit" class="btn btn-info w-100">Reset Password</button>
    </form>
    <p class="text-center text-secondary mt-3 small">Make sure it’s at least 8 characters with a mix of symbols & numbers.</p>
  </div>

<!-- Bootstrap JS Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
`);
});

// 🧠 4. Reset password after 2FA verified
router.post("/reset-password", async (req, res) => {
  const { newPassword } = req.body;
  const admin = await User.findOne({ role: "admin" });
  if (!admin) return res.send("admin not found.");

  const hashed = await bcrypt.hash(newPassword, 10);
  admin.password = hashed;
//   console.log("password reset");
  await admin.save();

  res.redirect("/auth/login");
});

module.exports = router;
