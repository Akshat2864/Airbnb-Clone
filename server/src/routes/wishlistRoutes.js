
const express = require("express");
const mongoose = require("mongoose");

const Wishlist = require("../models/Wishlist");
const Listing = require("../models/Listing");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();



router.post("/:listingId", isAuthenticated, async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID",
      });
    }

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.session.userId },
      { $addToSet: { listings: listingId } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error("Add wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add listing to wishlist",
    });
  }
});



router.delete("/:listingId", isAuthenticated, async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID",
      });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.session.userId },
      { $pull: { listings: listingId } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove listing from wishlist",
    });
  }
});



router.get("/", isAuthenticated, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.session.userId,
    }).populate("listings");

    return res.status(200).json({
      success: true,
      data: wishlist?.listings || [],
    });
  } catch (error) {
    console.error("Fetch wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
});



router.get("/check/:listingId", isAuthenticated, async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID",
      });
    }

    const wishlist = await Wishlist.findOne({
      user: req.session.userId,
      listings: listingId,
    });

    return res.status(200).json({
      success: true,
      isSaved: Boolean(wishlist),
    });
  } catch (error) {
    console.error("Wishlist check error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
    });
  }
});


module.exports = router;