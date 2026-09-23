const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.Mixed,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        salePrice: Number,
        image: mongoose.Schema.Types.Mixed,
        category: String,
        brand: String,
        totalStock: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
