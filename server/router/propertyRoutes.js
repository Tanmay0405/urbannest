const express = require("express");

const router = express.Router();

const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
} = require("../controllers/propertyController");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// ==============================
// PUBLIC PROPERTY ROUTES
// ==============================

// Public users can browse active properties.
router.get("/properties", getProperties);

// Public users can view active property details.
router.get("/properties/:propertyId", getPropertyById);

// ==============================
// SELLER ROUTES
// ==============================

// Seller dashboard - own properties.
router.get(
  "/seller/properties",
  authenticate,
  authorize("seller"),
  getMyProperties
);

// Seller creates a property.
router.post(
  "/properties",
  authenticate,
  authorize("seller"),
  createProperty
);

// Seller owner OR admin updates a property.
router.put(
  "/properties/:propertyId",
  authenticate,
  authorize("seller", "admin"),
  updateProperty
);

// Seller owner OR admin deletes a property.
router.delete(
  "/properties/:propertyId",
  authenticate,
  authorize("seller", "admin"),
  deleteProperty
);

module.exports = router;