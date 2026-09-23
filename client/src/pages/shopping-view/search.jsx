import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";

function SearchProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || searchParams.get("q") || "";
  const [keyword, setKeyword] = useState(initialKeyword);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const searchInputRef = useRef(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchResults, isLoading } = useSelector((state) => state.shopSearch);
  const { productDetails } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();

  const curatedKeywords = [
    "WOMEN",
    "MEN",
    "BAGS",
    "FOOTWEAR",
    "ACCESSORIES",
    "JACKET",
    "DRESS",
    "LEATHER",
  ];

  // Sync keyword from searchParams when URL changes (e.g. from header search or navigation)
  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || searchParams.get("q") || "";
    if (urlKeyword !== keyword) {
      setKeyword(urlKeyword);
    }
  }, [searchParams]);

  // Debounced search trigger when keyword changes
  useEffect(() => {
    const trimmed = keyword.trim();
    if (trimmed.length > 0) {
      const handler = setTimeout(() => {
        setSearchParams({ keyword: trimmed });
        dispatch(getSearchResults(trimmed));
      }, 300);

      return () => clearTimeout(handler);
    } else {
      setSearchParams({});
      dispatch(resetSearchResults());
    }
  }, [keyword, dispatch]);

  function handleSearchFormSubmit(e) {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (trimmed.length > 0) {
      setSearchParams({ keyword: trimmed });
      dispatch(getSearchResults(trimmed));
    }
  }

  function handleSuggestionClick(tag) {
    const term = tag.toLowerCase();
    setKeyword(term);
    setSearchParams({ keyword: term });
    dispatch(getSearchResults(term));
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

    const targetProduct = searchResults?.find(
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
          description: "Maison signature packaging included.",
        });
      }
    });
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0B0B0B] text-[#111111] dark:text-[#EDEDED] pt-20 sm:pt-24 md:pt-28 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Dior Header & Breadcrumb */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#767676] dark:text-[#A1A1AA] block mb-2">
            MAISON DAYLIGHT // ATELIER ARCHIVE
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-[0.15em] uppercase font-normal text-[#111111] dark:text-[#EDEDED]">
            SEARCH CREATIONS
          </h1>
          <p className="font-serif italic text-[#666666] dark:text-[#A1A1AA] text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Discover bespoke silhouettes, runway pieces, and handcrafted leather goods.
          </p>
        </div>

        {/* Search Bar Input Container */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
          <form
            onSubmit={handleSearchFormSubmit}
            className="relative bg-white dark:bg-[#121214] border border-[#111111] dark:border-[#27272A] p-3 sm:p-4 shadow-xs transition-all focus-within:shadow-md"
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-[#111111] dark:text-white shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="TYPE A CREATION NAME, CATEGORY, OR STYLE..."
                className="w-full bg-transparent text-xs sm:text-sm font-sans tracking-[0.15em] uppercase text-[#111111] dark:text-[#EDEDED] placeholder:text-[#999999] dark:placeholder:text-[#71717A] focus:outline-none"
                autoFocus
              />
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-[#111111] dark:text-white animate-spin shrink-0" />
              ) : keyword ? (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    setSearchParams({});
                    dispatch(resetSearchResults());
                    if (searchInputRef.current) searchInputRef.current.focus();
                  }}
                  className="p-1 text-[#999999] dark:text-[#71717A] hover:text-[#111111] dark:hover:text-white transition-colors shrink-0 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#111111] dark:bg-white text-white dark:text-black font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-[#333333] dark:hover:bg-neutral-200 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>SEARCH</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick Keywords Chips */}
          <div className="flex items-center justify-center flex-wrap gap-2 mt-4">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#8E8E93] dark:text-[#A1A1AA] mr-1">
              SUGGESTIONS:
            </span>
            {curatedKeywords.map((tag) => {
              const isSelected = keyword.toUpperCase() === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSuggestionClick(tag)}
                  className={`px-3 py-1 font-sans text-[10px] uppercase tracking-[0.18em] transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-[#111111] dark:bg-white text-white dark:text-black border-[#111111] dark:border-white font-medium"
                      : "bg-white dark:bg-[#18181B] text-[#555555] dark:text-[#A1A1AA] border-[#E5E5E5] dark:border-[#27272A] hover:border-[#111111] dark:hover:border-white hover:text-[#111111] dark:hover:text-white"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header / Counter */}
        {keyword.trim() !== "" && (
          <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#27272A] pb-4 mb-8">
            <div className="font-sans text-xs uppercase tracking-[0.2em] text-[#111111] dark:text-[#EDEDED]">
              <span>RESULTS FOR </span>
              <span className="font-semibold">"{keyword}"</span>
            </div>
            <div className="font-sans text-xs uppercase tracking-[0.15em] text-[#767676] dark:text-[#A1A1AA]">
              {isLoading
                ? "SEARCHING..."
                : `${searchResults?.length || 0} ${
                    searchResults?.length === 1 ? "CREATION" : "CREATIONS"
                  } FOUND`}
            </div>
          </div>
        )}

        {/* Main Content: Loading, Empty, or Results Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-7 h-7 border-2 border-[#111111] dark:border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-[#767676] dark:text-[#A1A1AA] font-sans text-xs uppercase tracking-[0.25em]">
              SEARCHING ATELIER ARCHIVE...
            </p>
          </div>
        ) : keyword.trim() === "" ? (
          /* Initial Empty State */
          <div className="text-center py-16 px-4 max-w-xl mx-auto border border-dashed border-[#E5E5E5] dark:border-[#27272A] bg-white/60 dark:bg-[#121214]/60 p-8 sm:p-12">
            <Sparkles className="w-8 h-8 mx-auto text-[#767676] dark:text-[#A1A1AA] mb-4 stroke-1" />
            <h2 className="font-serif text-xl sm:text-2xl text-[#111111] dark:text-[#EDEDED] mb-2 tracking-wide">
              Explore The Haute Couture Catalog
            </h2>
            <p className="font-sans text-xs text-[#767676] dark:text-[#A1A1AA] tracking-wider leading-relaxed mb-6">
              Enter a search keyword above or select a curated category to explore DAYLIGHT runway pieces, seasonal drops, and limited accessories.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/shop/listing")}
                className="px-6 py-2.5 bg-[#111111] dark:bg-white text-white dark:text-black font-sans text-xs uppercase tracking-[0.2em] hover:bg-[#333333] dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                BROWSE ALL COLLECTIONS
              </button>
            </div>
          </div>
        ) : searchResults && searchResults.length > 0 ? (
          /* Results Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {searchResults.map((item, index) => (
              <div key={`${item?._id || item?.id || "search"}-${index}`} className="w-full flex">
                <ShoppingProductTile
                  handleAddtoCart={handleAddtoCart}
                  product={item}
                  handleGetProductDetails={handleGetProductDetails}
                  showWishlist={false}
                />
              </div>
            ))}
          </div>
        ) : (
          /* No Results Found State */
          <div className="text-center py-16 px-4 bg-white dark:bg-[#121214] border border-[#E5E5E5] dark:border-[#27272A] max-w-lg mx-auto p-8 transition-colors">
            <p className="font-serif text-2xl text-[#111111] dark:text-[#EDEDED] mb-2">
              No Creations Found
            </p>
            <p className="font-sans text-xs text-[#767676] dark:text-[#A1A1AA] tracking-wider uppercase mb-6">
              We could not find any matching items for "{keyword}".
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setKeyword("");
                  setSearchParams({});
                  dispatch(resetSearchResults());
                }}
                className="w-full py-2.5 border border-[#111111] dark:border-white text-[#111111] dark:text-white font-sans text-xs uppercase tracking-[0.2em] hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
              >
                CLEAR SEARCH
              </button>
              <button
                onClick={() => navigate("/shop/listing")}
                className="w-full py-2.5 bg-[#111111] dark:bg-white text-white dark:text-black font-sans text-xs uppercase tracking-[0.2em] hover:bg-[#333333] dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                VIEW FULL READY-TO-WEAR ARCHIVE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default SearchProducts;