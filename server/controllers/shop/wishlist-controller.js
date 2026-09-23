const Wishlist = require("../../models/Wishlist");
const Product = require("../../models/Product");

const addToWishlist = async (req, res) => {
  try {
    const { userId, productId, name, price, salePrice, image, category, brand, totalStock } = req.body;
    const prodId = productId || req.body.id;

    if (!userId || !prodId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required!",
      });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    const isExisting = wishlist.items.some(
      (item) => item.productId?.toString() === prodId.toString()
    );

    if (!isExisting) {
      wishlist.items.push({
        productId: prodId,
        name: name || "Maison Creation",
        price: price || 0,
        salePrice,
        image,
        category,
        brand,
        totalStock,
      });
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error adding to wishlist",
    });
  }
};

const fetchWishlistItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is mandatory!",
      });
    }

    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: "items.productId",
      select: "image images title price salePrice totalStock category brand",
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: { userId, items: [] },
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist",
    });
  }
};

const deleteWishlistItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (wishlist) {
      wishlist.items = wishlist.items.filter(
        (item) => item.productId?.toString() !== productId.toString()
      );
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting wishlist item",
    });
  }
};

const clearWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const wishlist = await Wishlist.findOne({ userId });
    if (wishlist) {
      wishlist.items = [];
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      data: { userId, items: [] },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error clearing wishlist",
    });
  }
};

const syncWishlist = async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required!",
      });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const prodId = item.productId || item.id || item._id;
        if (!prodId) continue;

        const isExisting = wishlist.items.some(
          (existing) =>
            existing.productId?.toString() === prodId.toString() ||
            (existing.productId?._id && existing.productId._id.toString() === prodId.toString())
        );

        if (!isExisting) {
          wishlist.items.push({
            productId: prodId,
            name: item.name || item.title || "Maison Creation",
            price: Number(item.price) || 0,
            salePrice: item.salePrice ? Number(item.salePrice) : undefined,
            image: item.image,
            category: item.category || "",
            brand: item.brand || "",
            totalStock: item.totalStock ?? 10,
          });
        }
      }

      await wishlist.save();
    }

    await wishlist.populate({
      path: "items.productId",
      select: "image images title price salePrice totalStock category brand",
    });

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error("Error syncing wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing wishlist",
    });
  }
};

module.exports = {
  addToWishlist,
  fetchWishlistItems,
  deleteWishlistItem,
  clearWishlist,
  syncWishlist,
};
