const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: mongoose.Schema.Types.Mixed,
    images: {
      type: [String],
      default: [],
    },
    title: String,
    description: String,
    category: mongoose.Schema.Types.Mixed,
    categories: {
      type: [String],
      default: [],
    },
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    sizes: {
      type: [String],
      default: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    isPreOrder: {
      type: Boolean,
      default: false,
    },
    preOrderReleaseDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
