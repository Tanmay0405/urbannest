const express = require("express");

const router = express.Router();

const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favoriteController");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

router.get(
  "/favorites",
  authenticate,
  authorize("buyer"),
  getFavorites
);

router.post(
  "/favorites/:propertyId",
  authenticate,
  authorize("buyer"),
  addFavorite
);

router.delete(
  "/favorites/:propertyId",
  authenticate,
  authorize("buyer"),
  removeFavorite
);

module.exports = router;