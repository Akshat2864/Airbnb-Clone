const express = require("express");
const mongoose = require("mongoose");

const Review = require("../models/Review");
const Listing = require("../models/Listing");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();


router.post("/:listingId", isAuthenticated, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID",
      });
    }

    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (
      typeof comment !== "string" ||
      comment.trim().length < 3 ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment must contain 3–1000 characters",
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
      return res.status(403).json({
        success: false,
        message: "You cannot review your own listing",
      });
    }

    const existingReview = await Review.findOne({
      listing: listingId,
      user: req.session.userId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this listing",
      });
    }

    const review = await Review.create({
      listing: listingId,
      user: req.session.userId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    await review.populate("user", "name");

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });
  } catch (error) {
    // Handles duplicate-key errors from the unique index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this listing",
      });
    }

    console.error("Add review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
});

router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID",
      });
    }

    const listingExists = await Listing.exists({ _id: listingId });

    if (!listingExists) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    const reviews = await Review.find({ listing: listingId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews;

    return res.status(200).json({
      success: true,
      count: totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      data: reviews,
    });
  } catch (error) {
    console.error("Fetch reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
});


router.put("/:reviewId", isAuthenticated, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (
      typeof comment !== "string" ||
      comment.trim().length < 3 ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment must contain 3–1000 characters",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot edit this review",
      });
    }

    review.rating = Number(rating);
    review.comment = comment.trim();

    await review.save();
    await review.populate("user", "name");

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Update review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
});


router.delete("/:reviewId", isAuthenticated, async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this review",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
});

module.exports = router;