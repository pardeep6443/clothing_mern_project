import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "@/config/api";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams = {}, sortParams = "price-lowtohigh" }) => {
    const queryObj = {};
    if (filterParams && typeof filterParams === "object") {
      for (const [key, value] of Object.entries(filterParams)) {
        if (Array.isArray(value) && value.length > 0) {
          queryObj[key] = value.join(",");
        } else if (typeof value === "string" && value.trim()) {
          queryObj[key] = value.trim();
        }
      }
    }
    if (sortParams) {
      queryObj.sortBy = sortParams;
    }

    const query = new URLSearchParams(queryObj).toString();

    const result = await axios.get(
      `${API_URL}/api/shop/products/get${query ? `?${query}` : ""}`
    );

    return result?.data;
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id) => {
    const result = await axios.get(
      `${API_URL}/api/shop/products/get/${id}`
    );
console.log(result)
    return result?.data;
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        const rawList = Array.isArray(action.payload?.data) ? action.payload.data : [];
        const seen = new Set();
        state.productList = rawList.filter((item) => {
          const id = item?._id || item?.id;
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(fetchProductDetails.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
      });
  },
});

export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
