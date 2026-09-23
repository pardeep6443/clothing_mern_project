import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "@/config/api";

const GUEST_CART_STORAGE_KEY = "daylight_guest_cart";

const isRealUser = (userId) =>
  Boolean(
    userId &&
    userId !== "guest" &&
    userId !== "null" &&
    userId !== "undefined"
  );

export const getGuestCart = () => {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.items)) return parsed;
      if (Array.isArray(parsed)) return { items: parsed };
    }
  } catch (e) {
    console.warn("Failed to load guest cart:", e);
  }
  return { items: [] };
};

export const saveGuestCart = (cart) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.warn("Failed to save guest cart:", e);
  }
};

export const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  } catch (e) {}
};

const initialState = {
  cartItems: typeof window !== "undefined" ? getGuestCart() : { items: [] },
  isLoading: false,
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    {
      userId,
      productId,
      quantity,
      size,
      product,
      price: directPrice,
      salePrice: directSalePrice,
      title: directTitle,
      image: directImage,
    },
    { getState }
  ) => {
    if (isRealUser(userId)) {
      const response = await axios.post(
        `${API_URL}/api/shop/cart/add`,
        {
          userId,
          productId,
          quantity,
          size,
        }
      );
      return response.data;
    }

    // Guest Cart Handling — completely local and dedicated to this browser
    const cleanSize = size && String(size).trim() ? String(size).trim() : "M";
    const guestCart = getGuestCart();
    const existingIndex = guestCart.items.findIndex(
      (item) =>
        (item.productId === productId || item.productId?._id === productId) &&
        (item.size || "M") === cleanSize
    );

    // Resolve product metadata
    let productDetails = product;
    if (!productDetails) {
      const state = getState();
      const productList = state?.shopProducts?.productList || [];
      productDetails = productList.find(
        (p) => String(p._id || p.id) === String(productId)
      );
      if (!productDetails && state?.shopProducts?.productDetails?._id === productId) {
        productDetails = state.shopProducts.productDetails;
      }
    }

    const price = Number(productDetails?.price ?? directPrice) || 0;
    const salePrice =
      productDetails?.salePrice !== undefined
        ? Number(productDetails.salePrice)
        : directSalePrice !== undefined
        ? Number(directSalePrice)
        : undefined;
    const title =
      productDetails?.title || productDetails?.name || directTitle || "Maison Piece";
    const image =
      (typeof productDetails?.image === "string" && productDetails.image) ||
      (typeof directImage === "string" && directImage) ||
      productDetails?.image?.url ||
      directImage?.url ||
      (Array.isArray(productDetails?.images) && productDetails.images[0]) ||
      "";
    const sizes = productDetails?.sizes || ["XS", "S", "M", "L", "XL", "XXL"];
    const totalStock = productDetails?.totalStock ?? 10;
    const isPreOrder = Boolean(productDetails?.isPreOrder);
    const preOrderReleaseDate = productDetails?.preOrderReleaseDate || "";

    if (existingIndex > -1) {
      guestCart.items[existingIndex].quantity += Number(quantity) || 1;
      if (isPreOrder) {
        guestCart.items[existingIndex].isPreOrder = true;
        guestCart.items[existingIndex].preOrderReleaseDate = preOrderReleaseDate;
      }
    } else {
      guestCart.items.push({
        productId,
        title,
        image,
        price,
        salePrice,
        quantity: Number(quantity) || 1,
        size: cleanSize,
        sizes,
        totalStock,
        isPreOrder,
        preOrderReleaseDate,
      });
    }

    saveGuestCart(guestCart);
    return {
      success: true,
      data: guestCart,
    };
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId) => {
    if (isRealUser(userId)) {
      const response = await axios.get(
        `${API_URL}/api/shop/cart/get/${userId}`
      );
      return response.data;
    }

    const guestCart = getGuestCart();
    return {
      success: true,
      data: guestCart,
    };
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId, size }) => {
    if (isRealUser(userId)) {
      const response = await axios.delete(
        `${API_URL}/api/shop/cart/${userId}/${productId}`,
        {
          params: size ? { size } : {},
        }
      );
      return response.data;
    }

    const cleanSize = size && String(size).trim() ? String(size).trim() : null;
    const guestCart = getGuestCart();
    guestCart.items = guestCart.items.filter((item) => {
      const match =
        item.productId === productId || item.productId?._id === productId;
      if (!match) return true;
      if (cleanSize) return (item.size || "M") !== cleanSize;
      return false;
    });

    saveGuestCart(guestCart);
    return {
      success: true,
      data: guestCart,
    };
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity, size }) => {
    if (isRealUser(userId)) {
      const response = await axios.put(
        `${API_URL}/api/shop/cart/update-cart`,
        {
          userId,
          productId,
          quantity,
          size,
        }
      );
      return response.data;
    }

    const cleanSize = size && String(size).trim() ? String(size).trim() : null;
    const guestCart = getGuestCart();
    const findIndex = guestCart.items.findIndex((item) => {
      const match =
        item.productId === productId || item.productId?._id === productId;
      if (!match) return false;
      if (cleanSize) return (item.size || "M") === cleanSize;
      return true;
    });

    if (findIndex > -1) {
      guestCart.items[findIndex].quantity = quantity;
      saveGuestCart(guestCart);
    }

    return {
      success: true,
      data: guestCart,
    };
  }
);

let isSyncInProgress = false;

export const syncCartWithServer = createAsyncThunk(
  "cart/syncCartWithServer",
  async ({ userId }) => {
    if (!isRealUser(userId)) {
      return { success: true, data: getGuestCart() };
    }

    // Atomically read and immediately clear the guest cart to prevent parallel duplicate sync calls
    const guestCart = getGuestCart();
    const guestItems = Array.isArray(guestCart?.items) ? [...guestCart.items] : [];
    clearGuestCart();

    if (guestItems.length === 0) {
      const fetchResponse = await axios.get(
        `${API_URL}/api/shop/cart/get/${userId}`
      );
      return fetchResponse.data;
    }

    if (isSyncInProgress) {
      const fetchResponse = await axios.get(
        `${API_URL}/api/shop/cart/get/${userId}`
      );
      return fetchResponse.data;
    }

    isSyncInProgress = true;
    try {
      const response = await axios.post(`${API_URL}/api/shop/cart/sync`, {
        userId,
        items: guestItems,
      });
      return response.data;
    } catch (err) {
      console.error("Cart sync with server error:", err);
      const fetchResponse = await axios.get(
        `${API_URL}/api/shop/cart/get/${userId}`
      );
      return fetchResponse.data;
    } finally {
      isSyncInProgress = false;
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.cartItems = { items: [] };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload?.data || { items: [] };
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload?.data || { items: [] };
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload?.data || { items: [] };
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload?.data || { items: [] };
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(syncCartWithServer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(syncCartWithServer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload?.data || { items: [] };
      })
      .addCase(syncCartWithServer.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { resetCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;