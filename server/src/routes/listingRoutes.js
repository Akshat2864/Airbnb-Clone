
const express = require("express");
const Listing = require("../models/Listing");
const mongoose = require("mongoose");

const router = express.Router();

// GET /api/listings
// Fetch all property listings

router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error("Fetch listings error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch listings",
    });
  }
});



// GET /api/listings/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID",
      });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error("Fetch listing error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch listing",
    });
  }
});


module.exports = router;
