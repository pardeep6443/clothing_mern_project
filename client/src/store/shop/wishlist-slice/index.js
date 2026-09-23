import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "@/config/api";

const initialState = {
  items: [],
  isLoading: false,
};

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ userId, productId, name, price, salePrice, image, category, brand, totalStock }) => {
    const response = await axios.post(`${API_URL}/api/shop/wishlist/add`, {
      userId,
      productId,
      name,
      price,
      salePrice,
      image,
      category,
      brand,
      totalStock,
    });
    return response.data;
  }
);

export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchWishlistItems",
  async (userId) => {
    const response = await axios.get(`${API_URL}/api/shop/wishlist/get/${userId}`);
    return response.data;
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({ userId, productId }) => {
    const response = await axios.delete(`${API_URL}/api/shop/wishlist/${userId}/${productId}`);
    return response.data;
  }
);

export const clearWishlistDb = createAsyncThunk(
  "wishlist/clearWishlistDb",
  async (userId) => {
    const response = await axios.delete(`${API_URL}/api/shop/wishlist/clear/${userId}`);
    return response.data;
  }
);

export const syncWishlistWithDb = createAsyncThunk(
  "wishlist/syncWishlistWithDb",
  async ({ userId, items }) => {
    const response = await axios.post(`${API_URL}/api/shop/wishlist/sync`, {
      userId,
      items,
    });
    return response.data;
  }
);

const shopWishlistSlice = createSlice({
  name: "shopWishlist",
  initialState,
  reducers: {
    setWishlistItems: (state, action) => {
      state.items = action.payload || [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.data?.items || [];
      })
      .addCase(fetchWishlistItems.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items = action.payload?.data?.items || [];
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = action.payload?.data?.items || [];
      })
      .addCase(clearWishlistDb.fulfilled, (state, action) => {
        state.items = [];
      })
      .addCase(syncWishlistWithDb.fulfilled, (state, action) => {
        state.items = action.payload?.data?.items || [];
      });
  },
});

export const { setWishlistItems } = shopWishlistSlice.actions;
export default shopWishlistSlice.reducer;
