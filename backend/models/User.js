const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    maxlength: [100, "Full name cannot exceed 100 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  userId: {
    type: String,
    required: [true, "User ID is required"],
    unique: true,
    trim: true,
    minlength: [3, "User ID must be at least 3 characters"],
    maxlength: [30, "User ID cannot exceed 30 characters"],
    match: [/^[a-zA-Z0-9_]+$/, "User ID can only contain letters, numbers, and underscores"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next()

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12)
    this.password = hashedPassword
    next()
  } catch (error) {
    next(error)
  }
})

// Update the updatedAt field before saving
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function () {
  const jwt = require("jsonwebtoken")
  return jwt.sign(
    {
      userId: this._id,
      userIdString: this.userId,
      email: this.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  )
}

// Static method to find user by userId or email
userSchema.statics.findByCredentials = async function (identifier, password) {
  // Find user by userId or email
  const user = await this.findOne({
    $or: [{ userId: identifier }, { email: identifier }],
    isActive: true,
  })

  if (!user) {
    throw new Error("Invalid credentials")
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new Error("Invalid credentials")
  }

  // Update last login
  user.lastLogin = new Date()
  await user.save()

  return user
}

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

const User = mongoose.model("User", userSchema)

module.exports = User
