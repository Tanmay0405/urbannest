const express = require("express");

const router = express.Router();

const hallController = require("../controllers/hallController");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");


// Public property browsing
router.get(
  "/halls",
  hallController.getHalls
);


// Anyone authenticated can view a property
router.get(
  "/halls/:hallId",
  authenticate,
  hallController.getHallById
);


// Only sellers can create listings
router.post(
  "/halls",
  authenticate,
  authorize("seller"),
  hallController.createHall
);


// Seller can update own listing.
// Admin can update any listing.
router.put(
  "/halls/:hallId",
  authenticate,
  authorize("seller", "admin"),
  hallController.updateHall
);


// Seller can delete own listing.
// Admin can delete any listing.
router.delete(
  "/halls/:hallId",
  authenticate,
  authorize("seller", "admin"),
  hallController.deleteHall
);


module.exports = router;