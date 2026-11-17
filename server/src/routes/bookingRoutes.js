const express = require("express");
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const isAuthenticated = require("../middleware/isAuthenticated");
const razorpay=require("../config/razorpay");
const crypto = require("crypto");

const router = express.Router();


router.post("/", isAuthenticated, async (req, res) => {
  let booking;

  try {
    const { listingId, checkIn, checkOut, guests } = req.body;

    // Validate required fields
    if (!listingId || !checkIn || !checkOut || guests === undefined) {
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
        message: "Please select valid booking dates",
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

    if (listing.owner?.toString() === req.session.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own listing",
      });
    }

    // Check confirmed bookings and unexpired pending bookings
    const now = new Date();

    const conflictingBooking = await Booking.findOne({
      listing: listingId,
      checkIn: { $lt: endDate },
      checkOut: { $gt: startDate },
      $or: [
        { status: "confirmed" },
        {
          status: "pending",
          expiresAt: { $gt: now },
        },
      ],
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: "This property is already booked or awaiting payment for these dates",
      });
    }

    // Calculate total price on the backend
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    const nights = Math.ceil(
      (endDate - startDate) / millisecondsPerDay
    );

    const totalPrice = nights * listing.price;

    if (!Number.isSafeInteger(totalPrice) || totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }

    // Create a pending booking with a 15-minute expiry
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    booking = await Booking.create({
      listing: listingId,
      user: req.session.userId,
      checkIn: startDate,
      checkOut: endDate,
      guests: Number(guests),
      totalPrice,
      status: "pending",
      paymentStatus: "pending",
      expiresAt,
    });

    // Create Razorpay order (amount is in paise)
    const order = await razorpay.orders.create({
      amount: totalPrice * 100,
      currency: "INR",
      receipt: booking._id.toString(),
      notes: {
        bookingId: booking._id.toString(),
        listingId: listingId.toString(),
      },
    });

    // Save Razorpay order ID
    booking.razorpayOrderId = order.id;
    await booking.save();

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      data: {
        bookingId: booking._id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        expiresAt: booking.expiresAt,
      },
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    // Don't leave a pending booking behind if order creation fails
    if (booking) {
      booking.status = "cancelled";
      booking.paymentStatus = "failed";
      await booking.save().catch((saveError) => {
        console.error("Booking cleanup error:", saveError.message);
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
});

// POST /api/bookings/verify-payment
router.post("/verify-payment", isAuthenticated, async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !bookingId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification fields are required",
      });
    }

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // Find booking belonging to the logged-in user
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.session.userId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Idempotency: allow the same successful payment to be verified again
    if (booking.paymentStatus === "paid") {
      if (
        booking.razorpayOrderId === razorpay_order_id &&
        booking.razorpayPaymentId === razorpay_payment_id
      ) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          data: booking,
        });
      }

      return res.status(409).json({
        success: false,
        message: "Booking has already been paid",
      });
    }

    // Confirm the order belongs to this booking
    if (booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay order ID",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This booking is no longer pending",
      });
    }



    // Generate expected Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    const signatureIsValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!signatureIsValid) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    // Fetch payment directly from Razorpay
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.amount !== booking.totalPrice * 100 ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is not successfully captured",
      });
    }


// Handle payment captured after booking expiry
if (booking.expiresAt && booking.expiresAt <= new Date()) {
  // Save the captured payment details
  booking.razorpayPaymentId = razorpay_payment_id;
  booking.razorpaySignature = razorpay_signature;
  booking.status = "cancelled";
  booking.paymentStatus = "paid";

  // Automatically initiate a full refund
  const refund = await razorpay.payments.refund(
    razorpay_payment_id,
    {
      amount: payment.amount,
      speed: "normal",
      notes: {
        bookingId: booking._id.toString(),
        reason: "Payment captured after booking expiry",
      },
    }
  );

  booking.razorpayRefundId = refund.id;
  booking.refundStatus =
    refund.status === "processed" ? "processed" : "initiated";

  if (refund.status === "processed") {
    booking.paymentStatus = "refunded";
    booking.refundedAt = new Date();
  }

  await booking.save();

  return res.status(200).json({
    success: true,
    message:
      booking.paymentStatus === "refunded"
        ? "Booking expired. Payment refunded successfully."
        : "Booking expired. Refund has been initiated.",
    data: booking,
  });
}


    // Confirm booking only after successful verification
    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed",
      data: booking,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
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


// GET /api/bookings/owner-reservations
router.get(
  "/owner-reservations",
  isAuthenticated,
  async (req, res) => {
    try {
      // Find properties owned by the logged-in user
      const listings = await Listing.find({
        owner: req.session.userId,
      }).select("_id");

      const listingIds = listings.map(
        (listing) => listing._id
      );

      // Find bookings made for those properties
      const bookings = await Booking.find({
        listing: { $in: listingIds },
      })
        .populate("listing")
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      console.error("Fetch owner reservations error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch reservations",
      });
    }
  }
);



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

    let refund = null;

    if (booking.paymentStatus === "paid") {
      if (!booking.razorpayPaymentId) {
        return res.status(400).json({
          success: false,
          message: "Payment ID is missing. Please contact support.",
        });
      }

 

      // Fetch payment details
      const payment = await razorpay.payments.fetch(
        booking.razorpayPaymentId
      );

    

      if (
        payment.status !== "captured" ||
        payment.amount !== booking.totalPrice * 100 ||
        payment.currency !== "INR"
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment is not eligible for a full refund",
        });
      }

      // Initiate full refund
      refund = await razorpay.payments.refund(
        booking.razorpayPaymentId,
        {
          amount: payment.amount,
          speed: "normal",
          notes: {
            bookingId: booking._id.toString(),
            reason: "Customer requested booking cancellation",
          },
        }
      );

      // Save refund details
      booking.razorpayRefundId = refund.id;
      booking.refundStatus =
        refund.status === "processed" ? "processed" : "initiated";

      if (refund.status === "processed") {
        booking.paymentStatus = "refunded";
        booking.refundedAt = new Date();
      }
    }

    // Cancel booking
    booking.status = "cancelled";

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        booking.paymentStatus === "refunded"
          ? "Booking cancelled and refund processed successfully"
          : booking.refundStatus === "initiated"
            ? "Booking cancelled. Refund has been initiated."
            : "Booking cancelled successfully",
      data: booking,
    });

  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking or initiate refund",
    });
  }
});


// POST /api/bookings/webhook
router.post("/webhook", async (req, res) => {
  try {
    

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];

    if (!signature || !webhookSecret) {
      return res.status(400).json({
        success: false,
        message: "Missing webhook signature or secret",
      });
    }

    // Verify webhook signature using the raw request body
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(signature, "hex");

    const isValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = JSON.parse(req.body.toString());

    // Handle processed refunds
    if (event.event === "refund.processed") {
      const refund = event.payload.refund.entity;

      const booking = await Booking.findOne({
        razorpayPaymentId: refund.payment_id,
        razorpayRefundId: refund.id,
      });

      if (booking && booking.status === "cancelled") {
        booking.paymentStatus = "refunded";
        booking.refundStatus = "processed";
        booking.refundedAt = new Date();

        await booking.save();
      }
    }

    // Handle failed refunds
    if (event.event === "refund.failed") {
      const refund = event.payload.refund.entity;

      const booking = await Booking.findOne({
        razorpayPaymentId: refund.payment_id,
        razorpayRefundId: refund.id,
      });

      if (booking) {
        booking.refundStatus = "failed";
        await booking.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
});

module.exports = router;