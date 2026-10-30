
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Automatically log in after registration
    req.session.userId = newUser._id.toString();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find user by email
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Regenerate session to prevent session fixation
    req.session.regenerate((error) => {
      if (error) {
        console.error("Session regeneration error:", error.message);

        return res.status(500).json({
          success: false,
          message: "Login failed",
        });
      }

      // 5. Store user ID in the new session
      req.session.userId = user._id.toString();

      // 6. Save session
      req.session.save((error) => {
        if (error) {
          console.error("Session save error:", error.message);

          return res.status(500).json({
            success: false,
            message: "Could not create login session",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Login successful",
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        });
      });
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/auth/me
router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
      .select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Fetch user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  try {
    req.session.destroy((error) => {
      if (error) {
        console.error("Logout error:", error.message);

        return res.status(500).json({
          success: false,
          message: "Logout failed",
        });
      }

      // Clear the session cookie from the browser
      res.clearCookie("airbnb.sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


module.exports = router;
