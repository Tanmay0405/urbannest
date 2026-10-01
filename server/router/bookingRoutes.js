const express = require("express");

const router = express.Router();

const bookingController = require("../controllers/bookingController");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

// ==========================================
// BUYER
// ==========================================

// Create booking request
router.post(
  "/bookings",
  authenticate,
  authorize("buyer"),
  bookingController.createBooking,
);

// Buyer bookings
router.get(
  "/bookings/my",
  authenticate,
  authorize("buyer"),
  bookingController.getMyBookings,
);

// Cancel own booking
router.patch(
  "/bookings/:bookingId/cancel",
  authenticate,
  authorize("buyer"),
  bookingController.cancelBooking,
);

// ==========================================
// SELLER
// ==========================================

// Seller receives booking requests
router.get(
  "/seller/bookings",
  authenticate,
  authorize("seller"),
  bookingController.getSellerBookings,
);

// Approve booking
router.patch(
  "/seller/bookings/:bookingId/approve",
  authenticate,
  authorize("seller"),
  bookingController.approveBooking,
);

// Reject booking
router.patch(
  "/seller/bookings/:bookingId/reject",
  authenticate,
  authorize("seller"),
  bookingController.rejectBooking,
);

// ==========================================
// ADMIN
// ==========================================

// Admin can see every booking
router.get(
  "/admin/bookings",
  authenticate,
  authorize("admin"),
  bookingController.getAllBookings,
);

// Admin can update booking status
router.patch(
  "/admin/bookings/:bookingId/status",
  authenticate,
  authorize("admin"),
  bookingController.adminUpdateBooking,
);

// ==========================================
// COMMON
// ==========================================

// View one booking
router.get(
  "/bookings/:bookingId",
  authenticate,
  bookingController.getBookingById,
);

module.exports = router;
