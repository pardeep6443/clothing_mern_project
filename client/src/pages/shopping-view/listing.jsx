import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API_URL } from "@/config/api";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon, Layers, Sparkles, X, PackageSearch, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

function ShoppingListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, productDetails, isLoading } = useSelector(
    (state) => state.shopProducts
  );

  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [sort, setSort] = useState("price-lowtohigh");
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const { toast } = useToast();

  const categoryParam = searchParams.get("category") || "";
  const selectedCategories = useMemo(() => {
    if (!categoryParam) return [];
    return categoryParam
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }, [categoryParam]);

  // Fetch all custom categories from backend
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await axios.get(`${API_URL}/api/shop/categories/get`);
        if (res?.data?.success && Array.isArray(res?.data?.data)) {
          setAvailableCategories(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    loadCategories();
  }, []);

  function handleSort(value) {
    setSort(value);
  }

  function handleToggleCategory(catName) {
    if (!catName) {
      // Clear all category filters
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("category");
      setSearchParams(newParams);
      sessionStorage.removeItem("filters");
      return;
    }

    const trimmed = catName.trim();
    const exists = selectedCategories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );

    let updated;
    if (exists) {
      updated = selectedCategories.filter(
        (c) => c.toLowerCase() !== trimmed.toLowerCase()
      );
    } else {
      updated = [...selectedCategories, trimmed];
    }

    const newParams = new URLSearchParams(searchParams);
    if (updated.length > 0) {
      newParams.set("category", updated.join(","));
      sessionStorage.setItem("filters", JSON.stringify({ category: updated }));
    } else {
      newParams.delete("category");
      sessionStorage.removeItem("filters");
    }
    setSearchParams(newParams);
  }

  function handleClearFilter() {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("category");
    setSearchParams(newParams);
    sessionStorage.removeItem("filters");
  }

  function handleGetProductDetails(getCurrentProductId) {
    if (!getCurrentProductId) return;
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock, chosenSize) {
    const sizeToUse = chosenSize || "M";
    let getCartItems = cartItems?.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) =>
          (item.productId === getCurrentProductId || item.productId?._id === getCurrentProductId) &&
          (item.size || "") === sizeToUse
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    const targetProduct = productList?.find(
      (p) => String(p._id || p.id) === String(getCurrentProductId)
    );

    dispatch(
      addToCart({
        userId: user?.id || null,
        productId: getCurrentProductId,
        quantity: 1,
        size: sizeToUse,
        price: targetProduct?.price,
        salePrice: targetProduct?.salePrice,
        title: targetProduct?.title,
        image: typeof targetProduct?.image === "string" ? targetProduct.image : targetProduct?.image?.url || targetProduct?.images?.[0],
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: `Added Size ${sizeToUse} to Shopping Bag`,
        });
      }
    });
  }

  // Ensure user always lands directly at the top of the catalog when category changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [categoryParam]);

  // Fetch products when category or sort change
  useEffect(() => {
    const filterParams = {};
    if (selectedCategories.length > 0) {
      filterParams.category = selectedCategories;
    }

    dispatch(
      fetchAllFilteredProducts({
        filterParams,
        sortParams: sort || "price-lowtohigh",
      })
    );
  }, [dispatch, sort, categoryParam, selectedCategories]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  return (
    <div
      id="product-listing"
      className="p-4 pt-20 md:p-8 md:pt-24 bg-[#FAF9F6] dark:bg-[#0B0B0B] min-h-screen text-[#111111] dark:text-[#EDEDED] max-w-7xl mx-auto w-full space-y-5 transition-colors duration-300"
    >
      {/* Archive Header & Action Bar */}
      <div className="bg-white dark:bg-[#121214] border border-[#E5E5E5] dark:border-[#27272A] p-5 sm:p-7 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E5E5] dark:border-[#27272A]">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl text-[#111111] dark:text-[#EDEDED] font-display font-normal uppercase tracking-[0.2em]">
              THE ARCHIVE
            </h1>
            <p className="text-xs font-sans text-[#767676] dark:text-[#A1A1AA] tracking-widest uppercase">
              {productList?.length || 0} HAUTE COUTURE & READY-TO-WEAR CREATIONS
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#18181B] text-[#111111] dark:text-white border border-[#111111] dark:border-white hover:bg-[#111111] dark:hover:bg-white hover:text-white dark:hover:text-black font-sans text-xs uppercase tracking-[0.15em] transition-colors cursor-pointer"
                >
                  <ArrowUpDownIcon className="h-3.5 w-3.5" />
                  <span>SORT CREATIONS</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[220px] bg-white dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] text-[#111111] dark:text-[#EDEDED] font-sans text-xs uppercase tracking-wider"
              >
                <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem
                      value={sortItem.id}
                      key={sortItem.id}
                      className="cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#27272A] hover:text-[#111111] dark:hover:text-white focus:bg-[#F5F5F5] dark:focus:bg-[#27272A] focus:text-[#111111] dark:focus:text-white py-2.5"
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Custom Category Switcher Bar */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#767676] dark:text-[#A1A1AA] shrink-0 mr-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#111111] dark:text-white" />
              CATEGORIES:
            </span>

            {/* "All Creations" option */}
            <button
              type="button"
              onClick={() => handleToggleCategory("")}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] transition-all shrink-0 font-sans border cursor-pointer ${
                selectedCategories.length === 0
                  ? "bg-[#111111] dark:bg-white text-white dark:text-black border-[#111111] dark:border-white font-medium"
                  : "bg-white dark:bg-[#18181B] text-[#555555] dark:text-[#A1A1AA] border-[#E5E5E5] dark:border-[#27272A] hover:border-[#111111] dark:hover:border-white hover:text-[#111111] dark:hover:text-white"
              }`}
            >
              ALL CREATIONS
            </button>

            {/* Dynamic Custom Categories */}
            {availableCategories.map((cat) => {
              const catName = cat.name || cat;
              const isCatActive = selectedCategories.some(
                (sc) =>
                  sc.toLowerCase() === catName.toLowerCase() ||
                  sc.toLowerCase() === (cat.slug || "").toLowerCase()
              );

              return (
                <button
                  key={cat._id || cat.id || catName}
                  type="button"
                  onClick={() => handleToggleCategory(catName)}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] transition-all shrink-0 font-sans border cursor-pointer flex items-center gap-1.5 ${
                    isCatActive
                      ? "bg-[#111111] dark:bg-white text-white dark:text-black border-[#111111] dark:border-white font-medium"
                      : "bg-white dark:bg-[#18181B] text-[#555555] dark:text-[#A1A1AA] border-[#E5E5E5] dark:border-[#27272A] hover:border-[#111111] dark:hover:border-white hover:text-[#111111] dark:hover:text-white"
                  }`}
                >
                  {isCatActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  {catName}
                </button>
              );
            })}
          </div>

          {/* Active Category Badges & Clear All */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
              <span className="text-[10px] font-sans text-[#767676] dark:text-[#A1A1AA] uppercase tracking-wider">
                Active ({selectedCategories.length}):
              </span>
              {selectedCategories.map((catName) => (
                <span
                  key={catName}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FAF9F6] dark:bg-[#18181B] text-[#111111] dark:text-white border border-[#111111] dark:border-white font-sans text-[10px] uppercase tracking-wider font-semibold"
                >
                  {catName}
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(catName)}
                    className="hover:text-red-600 transition-colors ml-0.5 cursor-pointer"
                    title={`Remove ${catName} filter`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleClearFilter}
                className="text-[10px] font-mono text-red-600 dark:text-red-400 hover:text-red-700 underline uppercase ml-1 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Creations Grid - Full Width without sidebars */}
      <div className="bg-white dark:bg-[#121214] border border-[#E5E5E5] dark:border-[#27272A] p-5 sm:p-8 min-h-[480px] transition-colors">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-3">
            <div className="w-8 h-8 border-2 border-[#111111] dark:border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-[#767676] dark:text-[#A1A1AA] font-sans text-xs uppercase tracking-[0.2em]">
              CURATING ATELIER ARCHIVE...
            </p>
          </div>
        ) : productList && productList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList.map((productItem, index) => (
              <ShoppingProductTile
                key={`${productItem?._id || productItem?.id || "prod"}-${index}`}
                handleGetProductDetails={handleGetProductDetails}
                product={productItem}
                handleAddtoCart={handleAddtoCart}
                showWishlist={false}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-5 font-sans">
            <div className="w-14 h-14 rounded-full bg-[#FAF9F6] dark:bg-[#18181B] border border-[#E5E5E5] dark:border-[#27272A] flex items-center justify-center text-[#111111] dark:text-white">
              <PackageSearch className="w-6 h-6 stroke-[1.5]" />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="font-display text-base tracking-[0.15em] text-[#111111] dark:text-[#EDEDED] uppercase font-medium">
                No Atelier Creations Found
              </h3>
              <p className="text-[#767676] dark:text-[#A1A1AA] text-xs leading-relaxed">
                {selectedCategories.length > 0 ? (
                  <>
                    No pieces currently match the selected{" "}
                    {selectedCategories.length === 1 ? "category" : "categories"}:{" "}
                    <span className="font-semibold text-[#111111] dark:text-white">
                      {selectedCategories.join(", ")}
                    </span>
                    . Explore our other luxury collections or view the entire atelier archive.
                  </>
                ) : (
                  "There are currently no creations cataloged in this collection. Please check back soon or explore our seasonal archives."
                )}
              </p>
            </div>

            {selectedCategories.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={handleClearFilter}
                  className="px-6 py-2.5 bg-[#111111] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 font-sans text-xs uppercase tracking-[0.2em] font-medium inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  View All Creations
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingListing;
