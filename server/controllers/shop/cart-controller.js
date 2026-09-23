
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, size } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemSize = size && String(size).trim() ? String(size).trim() : (product.sizes?.[0] || "M");

    const findCurrentProductIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (item.size || (product.sizes?.[0] || "M")) === itemSize
    );

    if (findCurrentProductIndex === -1) {
      cart.items.push({ productId, quantity, size: itemSize });
    } else {
      cart.items[findCurrentProductIndex].quantity += quantity;
    }

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice sizes isPreOrder preOrderReleaseDate",
    });

    const populateCartItems = cart.items
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId._id,
        image: item.productId.image,
        title: item.productId.title,
        price: item.productId.price,
        salePrice: item.productId.salePrice,
        quantity: item.quantity,
        size: item.size || (item.productId.sizes?.[0] || "M"),
        sizes: item.productId.sizes || [],
        isPreOrder: item.productId.isPreOrder || false,
        preOrderReleaseDate: item.productId.preOrderReleaseDate || "",
      }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is manadatory!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice sizes isPreOrder preOrderReleaseDate",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          userId,
          items: [],
        },
      });
    }

    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const populateCartItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
      size: item.size || (item.productId.sizes?.[0] || "M"),
      sizes: item.productId.sizes || [],
      isPreOrder: item.productId.isPreOrder || false,
      preOrderReleaseDate: item.productId.preOrderReleaseDate || "",
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity, size } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const itemSize = size !== undefined ? String(size).trim() : null;

    const findCurrentProductIndex = cart.items.findIndex((item) => {
      const matchProduct = item.productId.toString() === productId;
      if (!matchProduct) return false;
      if (itemSize !== null) {
        return (item.size || "") === itemSize;
      }
      return true;
    });

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present !",
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice sizes",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
      size: item.size || (item.productId?.sizes?.[0] || "M"),
      sizes: item.productId?.sizes || [],
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { size } = req.query;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice sizes",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const itemSize = size !== undefined ? String(size).trim() : null;

    cart.items = cart.items.filter((item) => {
      const matchProduct = item.productId && item.productId._id.toString() === productId;
      if (!matchProduct) return true;
      if (itemSize !== null) {
        return (item.size || "") !== itemSize;
      }
      return false;
    });

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice sizes",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
      size: item.size || (item.productId?.sizes?.[0] || "M"),
      sizes: item.productId?.sizes || [],
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const syncGuestCart = async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required!",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    if (Array.isArray(items) && items.length > 0) {
      for (const guestItem of items) {
        const prodId =
          typeof guestItem.productId === "object"
            ? (guestItem.productId?._id || guestItem.productId?.id)
            : guestItem.productId;

        if (!prodId) continue;

        const product = await Product.findById(prodId);
        if (!product) continue;

        const quantity = Math.max(1, Number(guestItem.quantity) || 1);
        const itemSize =
          guestItem.size && String(guestItem.size).trim()
            ? String(guestItem.size).trim()
            : (product.sizes?.[0] || "M");

        const findCurrentProductIndex = cart.items.findIndex(
          (item) =>
            item.productId.toString() === prodId.toString() &&
            (item.size || (product.sizes?.[0] || "M")) === itemSize
        );

        if (findCurrentProductIndex === -1) {
          cart.items.push({
            productId: prodId,
            quantity,
            size: itemSize,
          });
        } else {
          // Prevent multiple additions on sync: ensure quantity reflects the max, never accumulating duplicates
          cart.items[findCurrentProductIndex].quantity = Math.max(
            Number(cart.items[findCurrentProductIndex].quantity) || 1,
            quantity
          );
        }
      }

      await cart.save();
    }

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice sizes isPreOrder preOrderReleaseDate",
    });

    const populateCartItems = cart.items
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId._id,
        image: item.productId.image,
        title: item.productId.title,
        price: item.productId.price,
        salePrice: item.productId.salePrice,
        quantity: item.quantity,
        size: item.size || (item.productId.sizes?.[0] || "M"),
        sizes: item.productId.sizes || [],
        isPreOrder: item.productId.isPreOrder || false,
        preOrderReleaseDate: item.productId.preOrderReleaseDate || "",
      }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.error("Cart sync error:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing cart",
    });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
  syncGuestCart,
};
