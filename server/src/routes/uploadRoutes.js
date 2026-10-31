const express = require("express");
const router = express.Router();

const imagekit = require("../config/imagekit");
const isAuthenticated = require("../middleware/isAuthenticated");

// GET /api/upload/auth
// Generate temporary ImageKit upload credentials

router.get("/auth", isAuthenticated, (req, res) => {
  try {
    const authenticationParameters =
      imagekit.helper.getAuthenticationParameters();

    return res.status(200).json({
      success: true,
      data: {
        ...authenticationParameters,
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      },
    });
  } catch (error) {
    console.error("ImageKit authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate upload authentication",
    });
  }
});

module.exports = router;