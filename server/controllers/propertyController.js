const mongoose = require("mongoose");
const Property = require("../model/propertySchema");

// ==============================
// HELPERS
// ==============================

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const parsePositiveNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
};

const parsePositiveInteger = (value, fallback) => {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    return fallback;
  }

  return number;
};

// ==============================
// GET ALL PROPERTIES
// PUBLIC: ACTIVE PROPERTIES ONLY
// ADMIN: ALL STATUSES
// ==============================
const getProperties = async (req, res) => {
  try {
    const {
      search,
      city,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      status,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    // ------------------------------
    // Keyword search
    // ------------------------------
    if (search && search.trim()) {
      const searchRegex = {
        $regex: search.trim(),
        $options: "i",
      };

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { city: searchRegex },
      ];
    }

    // ------------------------------
    // City filter
    // ------------------------------
    if (city && city.trim()) {
      filter.city = {
        $regex: city.trim(),
        $options: "i",
      };
    }

    // ------------------------------
    // Property type
    // ------------------------------
    if (propertyType && propertyType.trim()) {
      filter.propertyType = propertyType.trim();
    }

    // ------------------------------
    // Price range
    // ------------------------------
    const minimumPrice = parsePositiveNumber(minPrice);
    const maximumPrice = parsePositiveNumber(maxPrice);

    if (minimumPrice !== null || maximumPrice !== null) {
      filter.price = {};

      if (minimumPrice !== null) {
        filter.price.$gte = minimumPrice;
      }

      if (maximumPrice !== null) {
        filter.price.$lte = maximumPrice;
      }

      if (
        minimumPrice !== null &&
        maximumPrice !== null &&
        minimumPrice > maximumPrice
      ) {
        return res.status(400).json({
          success: false,
          message: "Minimum price cannot be greater than maximum price",
        });
      }
    }

    // ------------------------------
    // Minimum bedrooms
    // ------------------------------
    const minimumBedrooms = parsePositiveNumber(bedrooms);

    if (minimumBedrooms !== null) {
      filter.bedrooms = {
        $gte: minimumBedrooms,
      };
    }

    // ------------------------------
    // Status
    // ------------------------------
    // Public requests can only see active properties.
    //
    // Admin-specific access to inactive/sold properties must go
    // through a protected admin route.
    if (req.rootUser?.userType === "admin" && status) {
      filter.status = status;
    } else {
      filter.status = "active";
    }

    // ------------------------------
    // Pagination
    // ------------------------------
    const currentPage = parsePositiveInteger(page, 1);
    const currentLimit = Math.min(parsePositiveInteger(limit, 12), 100);

    const skip = (currentPage - 1) * currentLimit;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(currentLimit),

      Property.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      properties,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
    });
  } catch (error) {
    console.error("GET PROPERTIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
};

// ==============================
// GET SINGLE PROPERTY
// ==============================
const getPropertyById = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!isValidObjectId(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Public users should not be able to view inactive/sold
    // property details.
    if (property.status !== "active" && req.rootUser?.userType !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    return res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("GET PROPERTY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch property",
    });
  }
};

// ==============================
// CREATE PROPERTY
// SELLER ONLY
// ==============================
const createProperty = async (req, res) => {
  try {
    if (req.rootUser?.userType !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can create properties",
      });
    }

    const {
      title,
      description,
      propertyType,
      price,
      location,
      city,
      bedrooms,
      bathrooms,
      area,
      amenities,
      images,
    } = req.body;

    const numericPrice = parsePositiveNumber(price);
    const numericBedrooms = parsePositiveNumber(bedrooms);
    const numericBathrooms = parsePositiveNumber(bathrooms);
    const numericArea = parsePositiveNumber(area);

    if (
      !title?.trim() ||
      !description?.trim() ||
      !propertyType?.trim() ||
      numericPrice === null ||
      !location?.trim() ||
      !city?.trim() ||
      numericArea === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required property fields",
      });
    }

    const property = await Property.create({
      title: title.trim(),
      description: description.trim(),
      propertyType: propertyType.trim(),
      price: numericPrice,
      location: location.trim(),
      city: city.trim(),
      bedrooms: numericBedrooms ?? 0,
      bathrooms: numericBathrooms ?? 0,
      area: numericArea,
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) ? images : [],

      // Never trust owner ID from frontend.
      owner: req.rootUser._id,

      // New listings are active by default.
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("CREATE PROPERTY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create property",
    });
  }
};

// ==============================
// UPDATE PROPERTY
// OWNER OR ADMIN
// ==============================
const updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!isValidObjectId(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const isAdmin = req.rootUser?.userType === "admin";

    const isOwner =
      property.owner &&
      property.owner.toString() === req.rootUser?._id?.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this property",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "propertyType",
      "price",
      "location",
      "city",
      "bedrooms",
      "bathrooms",
      "area",
      "amenities",
      "images",
    ];

    for (const field of allowedFields) {
      if (req.body[field] === undefined) {
        continue;
      }

      if (
        ["title", "description", "propertyType", "location", "city"].includes(
          field,
        )
      ) {
        if (typeof req.body[field] !== "string" || !req.body[field].trim()) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a valid non-empty value`,
          });
        }

        property[field] = req.body[field].trim();
        continue;
      }

      if (["price", "bedrooms", "bathrooms", "area"].includes(field)) {
        const value = parsePositiveNumber(req.body[field]);

        if (value === null) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a valid non-negative number`,
          });
        }

        property[field] = value;
        continue;
      }

      if (field === "amenities") {
        if (!Array.isArray(req.body[field])) {
          return res.status(400).json({
            success: false,
            message: "Amenities must be an array",
          });
        }

        property[field] = req.body[field];
        continue;
      }

      if (field === "images") {
        if (!Array.isArray(req.body[field])) {
          return res.status(400).json({
            success: false,
            message: "Images must be an array",
          });
        }

        property[field] = req.body[field];
      }
    }

    // Status changes are restricted.
    if (req.body.status !== undefined) {
      const allowedStatuses = ["active", "inactive", "sold"];

      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid property status",
        });
      }

      // Sellers can activate/deactivate their own listing.
      // Only admin can mark a property as sold.
      if (req.body.status === "sold" && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only admins can mark a property as sold",
        });
      }

      property.status = req.body.status;
    }

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("UPDATE PROPERTY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update property",
    });
  }
};

// ==============================
// DELETE PROPERTY
// OWNER OR ADMIN
// ==============================
const deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!isValidObjectId(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const isOwner =
      property.owner &&
      property.owner.toString() === req.rootUser?._id?.toString();

    const isAdmin = req.rootUser?.userType === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this property",
      });
    }

    await Property.findByIdAndDelete(propertyId);

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PROPERTY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete property",
    });
  }
};

// ==============================
// GET SELLER'S PROPERTIES
// ==============================
const getMyProperties = async (req, res) => {
  try {
    if (req.rootUser?.userType !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can access their properties",
      });
    }

    const properties = await Property.find({
      owner: req.rootUser._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error("GET MY PROPERTIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your properties",
    });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
};
