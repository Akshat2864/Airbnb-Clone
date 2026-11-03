const express = require("express");
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();


router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;

    if (!listingId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: "All booking fields are required",
      });
    }

    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID",
      });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      startDate >= endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select valid check-in and check-out dates",
      });
    }

    if (!Number.isInteger(Number(guests)) || Number(guests) < 1) {
      return res.status(400).json({
        success: false,
        message: "At least one guest is required",
      });
    }

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Prevent booking your own property
    if (listing.owner?.toString() === req.session.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own listing",
      });
    }

    // Check for overlapping bookings
    const conflictingBooking = await Booking.findOne({
      listing: listingId,
      status: "confirmed",
      checkIn: { $lt: endDate },
      checkOut: { $gt: startDate },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: "This property is already booked for the selected dates",
      });
    }

    // Calculate nights and total price on the server
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    const nights = Math.ceil(
      (endDate - startDate) / millisecondsPerDay
    );

    const totalPrice = nights * listing.price;

    const booking = await Booking.create({
      listing: listingId,
      user: req.session.userId,
      checkIn: startDate,
      checkOut: endDate,
      guests: Number(guests),
      totalPrice,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
});


router.get("/my-bookings", isAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.session.userId,
    })
      .populate("listing")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Fetch bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
});


router.patch("/:id/cancel", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot cancel this booking",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
});

module.exports = router;