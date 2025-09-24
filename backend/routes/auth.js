const express = require("express")
const User = require("../models/User")
const auth = require("../middleware/auth")
const router = express.Router()

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, userId, password } = req.body

    // Validation
    if (!fullName || !email || !userId || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { userId: userId }],
    })

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? "email" : "user ID"
      return res.status(400).json({
        success: false,
        message: `A user with this ${field} already exists`,
      })
    }

    // Create new user
    const user = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      userId: userId.trim(),
      password,
    })

    await user.save()

    console.log(`✅ New user registered: ${user.userId} (${user.email})`)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userId: user.userId,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages[0] || "Validation error",
      })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return res.status(400).json({
        success: false,
        message: `A user with this ${field} already exists`,
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
})

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body

    // Validation
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: "User ID and password are required",
      })
    }

    // Find user and validate password
    const user = await User.findByCredentials(userId, password)

    // Generate JWT token
    const token = user.generateAuthToken()

    console.log(`✅ User logged in: ${user.userId} (${user.email})`)

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userId: user.userId,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("Login error:", error)

    if (error.message === "Invalid credentials") {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID or password",
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    })
  }
})

// Get current user profile (protected route)
router.get("/profile", auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Update user profile (protected route)
router.put("/profile", auth, async (req, res) => {
  try {
    const { fullName, email } = req.body
    const user = req.user

    if (fullName) user.fullName = fullName.trim()
    if (email) user.email = email.toLowerCase().trim()

    await user.save()

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    })
  } catch (error) {
    console.error("Profile update error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages[0] || "Validation error",
      })
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Logout endpoint (protected route)
router.post("/logout", auth, async (req, res) => {
  try {
    // In a more complex app, you might want to blacklist the token
    // For now, we'll just send a success response
    console.log(`✅ User logged out: ${req.user.userId}`)

    res.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

module.exports = router
