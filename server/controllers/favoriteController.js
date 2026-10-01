const User = require("../model/userSchema");
const Property = require("../model/propertySchema");

// ADD FAVORITE
const addFavorite = async (req, res) => {
  try {
    if (req.rootUser.userType !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can add favorites",
      });
    }

    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const user = await User.findById(req.rootUser._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
    }

    if (user.favorites.some((id) => id.toString() === propertyId)) {
      return res.status(200).json({
        success: true,
        message: "Property is already in favorites",
        favorites: user.favorites,
      });
    }

    user.favorites.push(propertyId);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Property added to favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("ADD FAVORITE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add favorite",
    });
  }
};


// REMOVE FAVORITE
const removeFavorite = async (req, res) => {
  try {
    if (req.rootUser.userType !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can remove favorites",
      });
    }

    const { propertyId } = req.params;

    const user = await User.findById(req.rootUser._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.favorites = (user.favorites || []).filter(
      (id) => id.toString() !== propertyId
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Property removed from favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error("REMOVE FAVORITE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove favorite",
    });
  }
};


// GET FAVORITES
const getFavorites = async (req, res) => {
  try {
    if (req.rootUser.userType !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can access favorites",
      });
    }

    const user = await User.findById(req.rootUser._id).populate(
      "favorites"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const favorites = (user.favorites || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      favorites,
    });
  } catch (error) {
    console.error("GET FAVORITES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch favorites",
    });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
};