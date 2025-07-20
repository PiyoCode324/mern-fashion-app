// models/Product.js
const mongoose = require("mongoose");

// 🛍️ Schema definition for storing product information
const productSchema = new mongoose.Schema({
  name: {
    // Product name (e.g., T-shirt, earphones)
    type: String,
    required: true,
  },
  category: {
    // Product category (e.g., fashion, electronics)
    type: String,
    required: true,
  },
  description: {
    // Product description (optional)
    type: String,
  },
  imageUrl: {
    // URL of the product image (generated upon image upload)
    type: String,
    required: true,
  },
  price: {
    // Product price (e.g., 1500 yen)
    type: Number,
    required: true,
  },
  countInStock: {
    // Available stock quantity (e.g., 5)
    type: Number,
    required: true,
    default: 0, // Defaults to 0 if not specified
  },
  createdBy: {
    // Reference to the user who created this product (see User model)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// ✅ Create the Product model from the schema
const Product = mongoose.model("Product", productSchema);

// 📦 Export the model for use in other modules
module.exports = Product;
