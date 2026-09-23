const express = require("express");
const {
  addToWishlist,
  fetchWishlistItems,
  deleteWishlistItem,
  clearWishlist,
  syncWishlist,
} = require("../../controllers/shop/wishlist-controller");

const router = express.Router();

router.post("/add", addToWishlist);
router.post("/sync", syncWishlist);
router.get("/get/:userId", fetchWishlistItems);
router.delete("/clear/:userId", clearWishlist);
router.delete("/:userId/:productId", deleteWishlistItem);

module.exports = router;
