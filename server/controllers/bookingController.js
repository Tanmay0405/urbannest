const mongoose = require("mongoose");

const Booking = require("../model/bookingSchema");
const Property = require("../model/propertySchema");
const User = require("../model/userSchema");

// ==========================================
// Helpers
// ==========================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeDate = (date) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return value;
};

// ==========================================
// CREATE BOOKING
// Buyer requests a property booking
// ==========================================

const createBooking = async (req, res) => {
  try {
    const { propertyId, bookingDate, startDate, endDate } = req.body;

    // Authentication middleware already verified the user.
    const buyer = req.rootUser;

    if (!buyer) {
      return res.status(401).json({
        error: "Authenticated user not found",
      });
    }

    if (buyer.userType !== "buyer") {
      return res.status(403).json({
        error: "Only buyers can create bookings",
      });
    }

    if (!propertyId || !bookingDate || !startDate || !endDate) {
      return res.status(400).json({
        error: "propertyId, bookingDate, startDate and endDate are required",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        error: "Property not found",
      });
    }

    if (property.status !== "active") {
      return res.status(400).json({
        error: "This property is not available for booking",
      });
    }

    // Prevent a seller from booking their own property.
    if (property.owner && property.owner.toString() === buyer._id.toString()) {
      return res.status(400).json({
        error: "You cannot book your own property",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        error: "Invalid booking dates",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        error: "End date must be after start date",
      });
    }

    const booking = await Booking.findOne({
      property: property._id,
      status: {
        $in: ["pending", "approved"],
      },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (booking) {
      return res.status(409).json({
        error: "This property is already booked for the selected dates",
      });
    }

    const newBooking = new Booking({
      property: property._id,
      buyer: buyer._id,
      seller: property.owner,
      bookingDate: new Date(bookingDate),
      startDate: start,
      endDate: end,

      // IMPORTANT:
      // Never trust the booking amount sent by the frontend.
      // The amount is always taken from the property's current price.
      amount: Number(property.price),

      status: "pending",
    });

    await newBooking.save();

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate("property")
      .populate("buyer", "name email phone userType")
      .populate("seller", "name email phone userType");

    return res.status(201).json({
      success: true,
      message: "Booking request created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

    return res.status(500).json({
      error: "Failed to create booking",
      details: error.message,
    });
  }
};

// ==========================================
// BUYER BOOKINGS
// ==========================================

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      buyer: req.rootUser._id,
    })
      .populate("property")
      .populate("seller", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your bookings",
    });
  }
};

// ==========================================
// SELLER BOOKINGS
// ==========================================

const getSellerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      seller: req.rootUser._id,
    })
      .populate("property")
      .populate("buyer", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("GET SELLER BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller bookings",
    });
  }
};

// ==========================================
// GET SINGLE BOOKING
// ==========================================

const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("property")
      .populate("buyer", "name email phone")
      .populate("seller", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // -----------------------------
    // Access control
    // -----------------------------

    const currentUserId = req.rootUser._id.toString();

    const isBuyer = booking.buyer._id.toString() === currentUserId;

    const isSeller = booking.seller._id.toString() === currentUserId;

    const isAdmin = req.rootUser.userType === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this booking",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("GET BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
    });
  }
};

// ==========================================
// SELLER APPROVE
// ==========================================

const approveBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      seller: req.rootUser._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be approved",
      });
    }

    // Check again before approval.
    // Another booking may have been approved after this request was created.

    const conflictingBooking = await Booking.findOne({
      _id: { $ne: booking._id },
      property: booking.property,
      status: "approved",

      startDate: {
        $lt: booking.endDate,
      },

      endDate: {
        $gt: booking.startDate,
      },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: "Another booking is already approved for these dates",
      });
    }

    booking.status = "approved";
    booking.rejectionReason = "";

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("property")
      .populate("buyer", "name email phone")
      .populate("seller", "name email phone");

    return res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("APPROVE BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve booking",
    });
  }
};

// ==========================================
// SELLER REJECT
// ==========================================

const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rejectionReason } = req.body;

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      seller: req.rootUser._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be rejected",
      });
    }

    booking.status = "rejected";
    booking.rejectionReason =
      rejectionReason?.trim() || "Booking request rejected";

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("property")
      .populate("buyer", "name email phone")
      .populate("seller", "name email phone");

    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("REJECT BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject booking",
    });
  }
};

// ==========================================
// BUYER CANCEL
// ==========================================

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { cancellationReason } = req.body;

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      buyer: req.rootUser._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!["pending", "approved"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be cancelled",
      });
    }

    booking.status = "cancelled";
    booking.cancellationReason =
      cancellationReason?.trim() || "Cancelled by buyer";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

// ==========================================
// ADMIN — ALL BOOKINGS
// ==========================================

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("property")
      .populate("buyer", "name email phone")
      .populate("seller", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("GET ALL BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// ==========================================
// ADMIN — UPDATE STATUS
// ==========================================

const adminUpdateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, rejectionReason } = req.body;

    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
      "cancelled",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = status;

    if (status === "rejected") {
      booking.rejectionReason = rejectionReason?.trim() || "Rejected by admin";
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("property")
      .populate("buyer", "name email phone")
      .populate("seller", "name email phone");

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("ADMIN UPDATE BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update booking",
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getSellerBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getAllBookings,
  adminUpdateBooking,
};
