
const express = require("express");
const Listing = require("../models/Listing");
const mongoose = require("mongoose");
const isAuthenticated = require("../middleware/isAuthenticated")

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


// GET /api/listings/my-listings
// Fetch listings created by the logged-in user

router.get("/my-listings", isAuthenticated, async (req, res) => {
  try {
    const listings = await Listing.find({
      owner: req.session.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error("Fetch my listings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your listings",
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


// POST /api/listings
// Create a new listing (authenticated users only)

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      price,
      location,
      country,
      category,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !image ||
      price === undefined ||
      !location ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    // Create listing
    const newListing = await Listing.create({
      title,
      description,
      image,
      price: Number(price),
      location,
      country,
      category,
      owner: req.session.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: newListing,
    });
  } catch (error) {
    console.error("Create listing error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create listing",
    });
  }
});

// PUT /api/listings/:id
// Update a listing (owner only)

router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate listing ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID",
      });
    }

    // Find listing
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Check ownership
    if (listing.owner?.toString() !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this listing",
      });
    }

    // Only allow these fields to be updated
    const allowedFields = [
      "title",
      "description",
      "image",
      "price",
      "location",
      "country",
      "category",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Validate price if provided
    if (
      updates.price !== undefined &&
      (!Number.isFinite(Number(updates.price)) ||
        Number(updates.price) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      data: updatedListing,
    });
  } catch (error) {
    console.error("Update listing error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update listing",
    });
  }
});

// DELETE /api/listings/:id
// Delete a listing (owner only)

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate listing ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID",
      });
    }

    // Find listing
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Verify ownership
    if (listing.owner?.toString() !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this listing",
      });
    }

    await Listing.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete listing error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete listing",
    });
  }
});




module.exports = router;
