const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authenticate");

const marketAuthController = require("../controllers/marketAuthController");

// Keep legacy controller temporarily for password/email features.
const legacyAuthController = require("../controllers/authController");


// ==========================================
// UrbanNest Authentication
// ==========================================

router.post(
  "/register",
  marketAuthController.register
);

router.post(
  "/login",
  marketAuthController.login
);

router.get(
  "/logout",
  authenticate,
  marketAuthController.logout
);


// ==========================================
// Existing password/email functionality
// Will be migrated later.
// ==========================================

router.post(
  "/passwordLink",
  legacyAuthController.passwordLink
);

router.get(
  "/forgotPassword/:id/:token",
  legacyAuthController.forgotPassword
);

router.post(
  "/:id/:token",
  legacyAuthController.setNewPassword
);

router.post(
  "/emailVerificationLink",
  authenticate,
  legacyAuthController.emailVerificationLink
);

router.get(
  "/verifyEmail/:id/:token",
  legacyAuthController.verifyEmail
);


// ==========================================
// Protected user endpoints
// ==========================================

router.put(
  "/updateProfile",
  authenticate,
  legacyAuthController.updateProfile
);

router.get(
  "/about",
  authenticate,
  legacyAuthController.about
);

router.get(
  "/getdata",
  authenticate,
  legacyAuthController.getdata
);

router.post(
  "/contact",
  authenticate,
  legacyAuthController.contact
);


module.exports = router;