const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "completed"],
      default: "pending",
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Helps prevent conflicting approved bookings from being missed
bookingSchema.index({
  property: 1,
  startDate: 1,
  endDate: 1,
  status: 1,
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
