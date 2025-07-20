// models/User.js
const mongoose = require("mongoose");

// 👤 Schema (blueprint) for storing user information
const userSchema = new mongoose.Schema(
  {
    uid: {
      // Unique user ID (string) provided by Firebase Authentication
      type: String,
      required: true,
      unique: true,
      trim: true, // Removes leading and trailing whitespace
    },
    name: {
      // User's name (optional, used on profile screens, etc.)
      type: String,
      trim: true,
    },
    email: {
      // User's email address (used for login)
      type: String,
      required: true,
      unique: true, // Prevents duplicate email registrations
      trim: true,
      lowercase: true, // Converts the email to lowercase automatically
      match: [/.+@.+\..+/, "Please enter a valid email address"], // Validates email format
      index: true, // Improves query performance
    },
    // ⭐ Field for managing user roles
    role: {
      // 'user': general user access, 'admin': administrative access
      type: String,
      enum: ["user", "admin"], // Only the specified values are allowed
      default: "user", // Default role assigned on registration
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Exports the model to be used throughout the application
module.exports = mongoose.model("User", userSchema);
