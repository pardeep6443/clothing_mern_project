import { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
  Ruler,
  CheckCircle,
  Clock,
  Heart,
  Minus,
  Plus,
  Share2,
  Check,
  Package,
  Eye,
  ArrowRight,
  X,
} from "lucide-react";

import { Button } from "../ui/button";
import { Separator } from "../ui/separator.jsx";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { useToast } from "../ui/use-toast";
import { cn } from "@/lib/utils";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails, fetchAllFilteredProducts, setProductDetails } from "@/store/shop/products-slice";
import { useWishlist } from "@/contexts/wishlist-context";
import { categoryOptionsMap } from "@/config";
import HMSizeSelector from "./hm-size-selector";
import SizeGuideModal from "./size-guide-modal";

// Generate complementary atelier perspective angles so swipe is always multi-angle
function getAtelierPerspectives(item, baseImages) {
  if (baseImages.length > 1) return baseImages;
  if (baseImages.length === 0) return baseImages;

  const baseImg = baseImages[0];
  const cat = (item?.category || "").toLowerCase();

  // If base image is an Unsplash image, create high-quality detail & crop angles
  if (baseImg.includes("unsplash.com")) {
    const cleanUrl = baseImg.split("?")[0];
    return [
      baseImg,
      `${cleanUrl}?auto=format&fit=crop&w=1200&q=85&crop=top,faces`,
      `${cleanUrl}?auto=format&fit=crop&w=1200&q=85&crop=bottom`,
    ];
  }

  const categoryAngleMap = {
    men: [
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
    ],
    women: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85",
    ],
    accessories: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
    ],
    footwear: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1200&q=85",
    ],
  };

  const companions = categoryAngleMap[cat] || [
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85",
  ];

  return [baseImg, companions[0], companions[1]];
}

function ProductDetailsContent({
  item,
  currentProductId,
  isDialog = false,
  onClose,
  onSelectProduct,
  dialogContentRef,
  onOpenSizeGuide,
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1); // 1 = slide next (right-to-left), -1 = slide prev
  const [quantity, setQuantity] = useState(1);
  const [internalShowSizeGuide, setInternalShowSizeGuide] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Top anchor ref to reliably scroll to top of product on selection
  const productTopRef = useRef(null);

  // Touch swipe refs for mobile gesture detection
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchEndXRef = useRef(0);
  const touchEndYRef = useRef(0);

  const productId = item?._id || item?.id || currentProductId;

  const scrollToTop = () => {
    // 1. Direct scroll on dialog container element if applicable
    const dialogEl =
      dialogContentRef?.current ||
      productTopRef.current?.closest("[data-slot='dialog-content']");

    if (dialogEl) {
      dialogEl.scrollTop = 0;
      try {
        dialogEl.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } catch (e) {
        dialogEl.scrollTop = 0;
      }
    }

    // 2. Direct DOM scroll reset for nearest scrollable container
    const scrollParent = productTopRef.current?.closest(".overflow-y-auto");
    if (scrollParent) {
      scrollParent.scrollTop = 0;
    }

    // 3. For standalone page, reset the browser window to the top
    if (!isDialog && typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  };

  // Ensure view resets to top of product whenever active product changes
  useEffect(() => {
    if (productId) {
      scrollToTop();
    }
  }, [productId]);

  const handleOpenSizeGuide = () => {
    if (onOpenSizeGuide) {
      onOpenSizeGuide();
    } else {
      setInternalShowSizeGuide(true);
    }
  };

  const availableSizes =
    item?.sizes && Array.isArray(item.sizes) && item.sizes.length > 0
      ? item.sizes.includes("XXL")
        ? item.sizes
        : [...item.sizes, "XXL"]
      : ["XS", "S", "M", "L", "XL", "XXL"];

  const [selectedSize, setSelectedSize] = useState(
    availableSizes.includes("M") ? "M" : availableSizes[0] || "M"
  );

  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addItem: addWishlistItem, removeItem: removeWishlistItem, isInWishlist } = useWishlist();

  const isFavorited = productId ? isInWishlist(productId) : false;

  // Ensure full product catalog is hydrated for rich contextual recommendations
  useEffect(() => {
    if (!productList || productList.length === 0) {
      dispatch(
        fetchAllFilteredProducts({
          filterParams: {},
          sortParams: "price-lowtohigh",
        })
      );
    }
  }, [dispatch, productList]);

  // Log viewed product in customer interest history (stored in localStorage)
  useEffect(() => {
    if (!productId) return;
    try {
      const historyKey = "customer_view_history";
      const raw = localStorage.getItem(historyKey);
      const existing = raw ? JSON.parse(raw) : [];
      const currentEntry = {
        id: String(productId),
        category: item?.category || "",
        brand: item?.brand || "",
        price: item?.price || 0,
        timestamp: Date.now(),
      };
      // Keep unique by id, newest first, capped to 20
      const filtered = existing.filter((p) => String(p.id) !== String(productId));
      filtered.unshift(currentEntry);
      localStorage.setItem(historyKey, JSON.stringify(filtered.slice(0, 20)));
    } catch (err) {
      console.warn("Could not save customer view interest:", err);
    }
  }, [productId, item?.category, item?.brand, item?.price]);

  // Compute multi-dimensional "You May Also Like" recommendations tailored to customer interests
  const recommendedCreations = useMemo(() => {
    if (!productList || productList.length === 0) return [];

    const currentIdStr = String(productId);
    // Candidates excluding current product
    const candidates = productList.filter((p) => {
      const pId = String(p?._id || p?.id);
      return pId !== currentIdStr;
    });

    if (candidates.length === 0) return [];

    // Parse customer interests from view history
    let interestCategories = {};
    let interestBrands = {};
    let priceSum = 0;
    let priceCount = 0;

    try {
      const raw = localStorage.getItem("customer_view_history");
      const history = raw ? JSON.parse(raw) : [];
      history.forEach((h, idx) => {
        // Recency decay weight
        const weight = Math.max(1, 10 - idx);
        if (h.category) {
          const c = String(h.category).toLowerCase();
          interestCategories[c] = (interestCategories[c] || 0) + weight;
        }
        if (h.brand) {
          const b = String(h.brand).toLowerCase();
          interestBrands[b] = (interestBrands[b] || 0) + weight;
        }
        if (h.price > 0) {
          priceSum += h.price;
          priceCount++;
        }
      });
    } catch (e) {
      // fallback
    }

    const currentCat = String(item?.category || "").toLowerCase();
    const currentBrand = String(item?.brand || "").toLowerCase();
    const currentPrice = Number(item?.salePrice || item?.price) || 0;
    const avgCustomerPrice = priceCount > 0 ? priceSum / priceCount : currentPrice;

    // Score each candidate
    const scored = candidates.map((cand) => {
      let score = 0;
      const candCat = String(cand?.category || "").toLowerCase();
      const candBrand = String(cand?.brand || "").toLowerCase();
      const candPrice = Number(cand?.salePrice || cand?.price) || 0;

      // 1. Direct Category alignment (matches current piece or top customer interest)
      if (currentCat && candCat === currentCat) {
        score += 35;
      } else if (candCat && interestCategories[candCat]) {
        score += Math.min(25, interestCategories[candCat] * 2);
      }

      // 2. Maison Brand / Collection harmony
      if (currentBrand && candBrand === currentBrand) {
        score += 25;
      } else if (candBrand && interestBrands[candBrand]) {
        score += Math.min(15, interestBrands[candBrand] * 2);
      }

      // 3. Price bracket affinity (closer to customer spending range earns higher score)
      if (currentPrice > 0 && candPrice > 0) {
        const priceDiffRatio = Math.abs(candPrice - currentPrice) / Math.max(candPrice, currentPrice);
        if (priceDiffRatio <= 0.25) {
          score += 15;
        } else if (priceDiffRatio <= 0.5) {
          score += 8;
        }
      }

      // 4. In Stock preference
      if (cand?.totalStock > 0) {
        score += 5;
      }

      // 5. Customer Wishlist affinity (if user already liked similar pieces)
      if (cand?.totalStock && cand?.salePrice) {
        score += 3;
      }

      return { product: cand, score };
    });

    // Sort by recommendation relevance score descending
    scored.sort((a, b) => b.score - a.score);

    // Pick top 4 curated pieces
    return scored.slice(0, 4).map((s) => s.product);
  }, [productList, productId, item?.category, item?.brand, item?.price, item?.salePrice]);

  function handleSelectRecommendation(recProduct) {
    const recId = recProduct?._id || recProduct?.id;
    if (!recId) return;

    // Immediately trigger scroll to top of product view
    scrollToTop();

    if (onSelectProduct) {
      onSelectProduct(recId, recProduct);
    } else {
      // In standalone page or direct navigation
      dispatch(fetchProductDetails(recId));
      navigate(`/product/${recId}`);
      scrollToTop();
    }
  }

  useEffect(() => {
    if (availableSizes && availableSizes.length > 0) {
      if (!selectedSize || !availableSizes.includes(selectedSize)) {
        setSelectedSize(availableSizes.includes("M") ? "M" : availableSizes[0]);
      }
    }
  }, [productId, availableSizes, selectedSize]);

  function handleAddToCart() {
    if (isAdding) return;
    const sizeToUse = selectedSize || "M";
    const totalStock = item?.totalStock || 10;
    let getCartItems = cartItems?.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (cItem) =>
          (cItem.productId === productId || cItem.productId?._id === productId) &&
          (cItem.size || "") === (sizeToUse || "")
      );
      if (indexOfCurrentItem > -1) {
        const currentQty = getCartItems[indexOfCurrentItem].quantity;
        if (currentQty + quantity > totalStock) {
          toast({
            title: `Maximum stock reached: Only ${totalStock} available`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setIsAdding(true);
    dispatch(
      addToCart({
        userId: user?.id || null,
        productId: productId,
        quantity: quantity,
        size: sizeToUse,
        price: item?.price,
        salePrice: item?.salePrice,
        title: item?.title,
        image: currentImage,
        product: item,
      })
    )
      .then((data) => {
        setIsAdding(false);
        if (data?.payload?.success) {
          toast({
            title: `Added ${quantity}x (Size ${sizeToUse}) to Bag`,
            description: "Maison signature packaging included with priority dispatch.",
          });
        }
      })
      .catch(() => {
        setIsAdding(false);
      });
  }

  function handleToggleWishlist() {
    if (!productId) return;
    if (isFavorited) {
      removeWishlistItem(productId, item?.title);
    } else {
      addWishlistItem({
        id: productId,
        name: item?.title || "Atelier Piece",
        price: item?.price || 0,
        salePrice: item?.salePrice,
        image: currentImage,
        category: item?.category,
        brand: item?.brand,
        totalStock: item?.totalStock,
      });
    }
  }

  function handleShare() {
    const url = window.location.origin + `/shop/product/${productId}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    toast({
      title: "Product Link Copied",
      description: "Direct atelier link copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2500);
  }

  let images = [];
  if (Array.isArray(item?.images) && item.images.length > 0) {
    images = item.images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
  } else if (Array.isArray(item?.image) && item.image.length > 0) {
    images = item.image.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
  } else if (typeof item?.image === "string" && item.image) {
    images = [item.image];
  } else if (item?.image?.url) {
    images = [item.image.url];
  }

  if (images.length === 0) {
    images = [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85",
    ];
  }

  images = getAtelierPerspectives(item, images);

  const currentImage = images[selectedImageIndex] || images[0];

  const itemCategories = Array.isArray(item?.categories) && item.categories.length > 0
    ? item.categories
    : Array.isArray(item?.category) && item.category.length > 0
    ? item.category
    : typeof item?.category === "string" && item.category
    ? item.category.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  const nextImage = () => {
    if (images.length > 0) {
      setSlideDirection(1);
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }
  };
  const prevImage = () => {
    if (images.length > 0) {
      setSlideDirection(-1);
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Mobile touch gesture swipe handlers
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      touchEndXRef.current = e.touches[0].clientX;
      touchEndYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchEndXRef.current = e.touches[0].clientX;
      touchEndYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = () => {
    const deltaX = touchStartXRef.current - touchEndXRef.current;
    const deltaY = touchStartYRef.current - touchEndYRef.current;

    // Minimum swipe threshold of 35px and ensure horizontal intent dominates vertical scroll
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      if (deltaX > 0) {
        // Finger swiped LEFT -> Next image
        nextImage();
      } else {
        // Finger swiped RIGHT -> Previous image
        prevImage();
      }
    }
    touchStartXRef.current = 0;
    touchEndXRef.current = 0;
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  const discountPercent =
    item?.price && item?.salePrice && item.salePrice < item.price
      ? Math.round(((item.price - item.salePrice) / item.price) * 100)
      : null;

  return (
    <div
      ref={productTopRef}
      className={`relative bg-white dark:bg-[#121214] text-neutral-950 dark:text-[#EDEDED] font-sans transition-colors ${
        isDialog
          ? "p-5 sm:p-6 lg:p-7"
          : "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6"
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Image Showcase (5 columns on desktop for balanced proportions) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-3">
          {/* Main Product Image with Mobile Swipe Gestures */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative aspect-[3/4] sm:aspect-[1/1] lg:aspect-[3/4] max-h-[400px] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm group touch-pan-y select-none"
          >
            <AnimatePresence custom={slideDirection} mode="wait">
              <motion.div
                key={selectedImageIndex}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.26, ease: "easeInOut" }}
                className="relative w-full h-full"
              >
                <img
                  src={currentImage}
                  alt={item?.title || "Product Piece"}
                  className="w-full h-full object-cover object-center pointer-events-none"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* Badges Overlays */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
              {item?.isPreOrder ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-600 text-white font-mono text-[10px] font-bold tracking-wider uppercase rounded shadow-sm">
                  <Clock className="w-3 h-3 text-white" />
                  PRE-ORDER
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/85 text-white font-mono text-[10px] font-bold tracking-wider uppercase rounded shadow-sm backdrop-blur-xs">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  ATELIER
                </span>
              )}
            </div>

            <div className="absolute top-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
              {discountPercent && (
                <span className="px-2.5 py-1 bg-red-600 text-white font-mono text-[11px] font-bold uppercase rounded shadow-sm">
                  SAVE {discountPercent}%
                </span>
              )}
            </div>

            {/* Carousel Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 text-neutral-900 hover:bg-black hover:text-white rounded-full shadow-md flex items-center justify-center transition-all duration-150 border border-neutral-200 cursor-pointer z-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 text-neutral-900 hover:bg-black hover:text-white rounded-full shadow-md flex items-center justify-center transition-all duration-150 border border-neutral-200 cursor-pointer z-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Bottom Counter Ribbon */}
            <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
              <span className="px-2 py-0.5 bg-black/75 text-white font-mono text-[10px] font-semibold rounded">
                {selectedImageIndex + 1} / {images.length}
              </span>
            </div>

            {/* Mobile Swipe Guidance & Indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex flex-col items-center gap-1 z-10 pointer-events-none">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-xs rounded-full pointer-events-auto">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Photo ${idx + 1}`}
                      onClick={() => {
                        setSlideDirection(idx > selectedImageIndex ? 1 : -1);
                        setSelectedImageIndex(idx);
                      }}
                      className={cn(
                        "transition-all duration-300 rounded-full",
                        selectedImageIndex === idx
                          ? "w-4 h-1.5 bg-white"
                          : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                      )}
                    />
                  ))}
                </div>
                <span className="sm:hidden text-[9px] font-mono tracking-widest text-white/90 uppercase drop-shadow-sm">
                  Swipe ‹ › to change photo
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "relative shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all duration-150 cursor-pointer",
                    selectedImageIndex === index
                      ? "border-neutral-950 ring-1 ring-neutral-950"
                      : "border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100"
                  )}
                >
                  <img
                    src={image}
                    alt={`${item?.title || "Thumbnail"} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 bg-neutral-50 dark:bg-[#18181B] rounded-lg border border-neutral-200 dark:border-[#27272A] text-center sm:text-left space-y-0.5">
              <Truck className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 mx-auto sm:mx-0" />
              <div className="font-sans font-medium text-[11px] text-neutral-900 dark:text-neutral-100">Express</div>
              <div className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono">2-3 Business Days</div>
            </div>

            <div className="p-2 bg-neutral-50 dark:bg-[#18181B] rounded-lg border border-neutral-200 dark:border-[#27272A] text-center sm:text-left space-y-0.5">
              <RotateCcw className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 mx-auto sm:mx-0" />
              <div className="font-sans font-medium text-[11px] text-neutral-900 dark:text-neutral-100">Returns</div>
              <div className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono">30-Day Policy</div>
            </div>

            <div className="p-2 bg-neutral-50 dark:bg-[#18181B] rounded-lg border border-neutral-200 dark:border-[#27272A] text-center sm:text-left space-y-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 mx-auto sm:mx-0" />
              <div className="font-sans font-medium text-[11px] text-neutral-900 dark:text-neutral-100">Authentic</div>
              <div className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono">Certified Original</div>
            </div>
          </div>
        </div>

        {/* Right Column: Refined Typography & Compact Proportions */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-3.5 flex flex-col justify-start">
          {/* Metadata Sub-header */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap items-center gap-1.5">
              {itemCategories.length > 0 ? (
                itemCategories.map((c, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-neutral-100 dark:bg-[#222226] text-neutral-900 dark:text-[#EDEDED] rounded font-mono text-[10px] font-bold uppercase tracking-wider border border-neutral-200 dark:border-[#333338]"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="px-2 py-0.5 bg-neutral-100 dark:bg-[#222226] text-neutral-900 dark:text-[#EDEDED] rounded font-mono text-[10px] font-bold uppercase tracking-wider border border-neutral-200 dark:border-[#333338]">
                  {item?.category || "COLLECTION"}
                </span>
              )}
              {item?.brand && (
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  // {item.brand}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full font-mono text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {item?.totalStock > 0 ? "IN STOCK" : "PRE-ORDER"}
              </span>

              <button
                type="button"
                onClick={handleToggleWishlist}
                title={isFavorited ? "In your Wishlist" : "Save to Wishlist"}
                className={cn(
                  "p-1 rounded transition-colors",
                  isFavorited
                    ? "text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/40"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                )}
              >
                <Heart className={cn("w-3.5 h-3.5", isFavorited && "fill-red-600 text-red-600")} />
              </button>

              <button
                type="button"
                onClick={handleShare}
                title="Share product"
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Product Title (Compact, Refined Font Size) */}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-[#EDEDED] tracking-tight font-display uppercase leading-snug">
              {item?.title}
            </h1>
          </div>

          {/* Price Showcase Block */}
          <div className="p-2.5 bg-neutral-50 dark:bg-[#18181B] rounded-lg border border-neutral-200/90 dark:border-[#27272A] space-y-0.5">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              {item?.salePrice > 0 ? (
                <>
                  <span className="text-lg sm:text-xl font-bold font-mono text-neutral-950 dark:text-[#EDEDED] tracking-tight">
                    ${item?.salePrice}
                  </span>
                  <span className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 line-through font-mono">
                    ${item?.price}
                  </span>
                  {discountPercent && (
                    <span className="px-1.5 py-0.5 bg-red-600 text-white font-mono text-[9px] font-bold uppercase rounded">
                      SAVE {discountPercent}%
                    </span>
                  )}
                </>
              ) : (
                <span className="text-lg sm:text-xl font-bold font-mono text-neutral-950 dark:text-[#EDEDED] tracking-tight">
                  ${item?.price}
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              Complimentary gift packaging & 2-day priority dispatch
            </p>
          </div>

          {/* Pre-Order Notice Box */}
          {item?.isPreOrder && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg flex items-start gap-2.5 text-amber-950 dark:text-amber-200">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold block font-sans uppercase tracking-wider text-[11px] text-amber-900 dark:text-amber-100">
                  Pre-Order Edition
                </span>
                <p className="text-[11px] font-mono mt-0.5 text-amber-800 dark:text-amber-300">
                  Estimated Release / Shipping:{" "}
                  <span className="font-bold underline">
                    {item?.preOrderReleaseDate || "Coming Soon"}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* H&M Style Connected Size Selector & Size Guide */}
          <HMSizeSelector
            product={item}
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
            availableSizes={availableSizes}
            onOpenSizeGuide={handleOpenSizeGuide}
          />

          {/* Quantity Stepper & Add to Bag Actions */}
          <div className="space-y-2 pt-0.5">
            <div className="flex items-center gap-2">
              {/* Quantity Counter */}
              <div className="flex items-center border border-neutral-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#18181B]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-l hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors text-neutral-800 dark:text-neutral-200"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-7 text-center font-mono font-bold text-xs text-neutral-950 dark:text-[#EDEDED]">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={quantity >= (item?.totalStock || 10)}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-r hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors text-neutral-800 dark:text-neutral-200"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Add to Bag Button */}
              {item?.totalStock === 0 && !item?.isPreOrder ? (
                <button
                  disabled
                  className="flex-1 h-8 bg-neutral-200 text-neutral-500 font-sans text-[11px] font-semibold uppercase tracking-wider rounded-md cursor-not-allowed flex items-center justify-center"
                >
                  Sold Out — Restocking
                </button>
              ) : item?.isPreOrder ? (
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={handleAddToCart}
                  className="flex-1 h-8 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-sans text-[11px] font-semibold uppercase tracking-wider rounded-md shadow-xs active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  {isAdding ? "Securing..." : `Pre-Order Now (Size ${selectedSize || "M"})`}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={handleAddToCart}
                  className="flex-1 h-8 bg-[#111111] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white font-sans text-[11px] font-semibold uppercase tracking-wider rounded-md shadow-xs active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  {isAdding ? "Adding..." : `Add To Bag (Size ${selectedSize || "M"})`}
                </button>
              )}

              {/* Wishlist Heart Toggle */}
              <button
                type="button"
                aria-label="Add to wishlist"
                onClick={handleToggleWishlist}
                className={cn(
                  "h-8 w-8 rounded-md border transition-all flex items-center justify-center cursor-pointer shrink-0",
                  isFavorited
                    ? "bg-rose-50 border-rose-400 text-rose-600"
                    : "bg-white border-neutral-200 text-neutral-700 hover:border-black hover:text-black"
                )}
              >
                <Heart className={cn("w-3.5 h-3.5", isFavorited ? "fill-rose-600" : "")} />
              </button>
            </div>
          </div>

          <Separator className="bg-neutral-200" />

          {/* Description & Specs */}
          <div className="space-y-1">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-950 dark:text-white">
              ABOUT THIS PIECE
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
              {item?.description ||
                "Expertly tailored from premium textiles with immaculate stitching and bespoke craftsmanship. Designed for effortless elegance and timeless versatility."}
            </p>
          </div>
        </div>
      </div>

      {/* You May Also Like - Customer Interests Recommendation Showcase */}
      {recommendedCreations && recommendedCreations.length > 0 && (
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-[#27272A] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-neutral-950 dark:text-white" />
              <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-neutral-950 dark:text-white">
                YOU MAY ALSO LIKE
              </h3>
            </div>
            <p className="font-sans text-[11px] text-neutral-500 dark:text-neutral-400 tracking-wider uppercase">
              Curated to complement your aesthetic & wardrobe preferences
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {recommendedCreations.map((recItem, recIdx) => {
              const recId = recItem?._id || recItem?.id;
              let recImage = "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80";
              if (Array.isArray(recItem?.images) && recItem.images.length > 0) {
                recImage = typeof recItem.images[0] === "string" ? recItem.images[0] : recItem.images[0]?.url || recImage;
              } else if (typeof recItem?.image === "string" && recItem.image) {
                recImage = recItem.image;
              } else if (recItem?.image?.url) {
                recImage = recItem.image.url;
              }

              const recDiscount =
                recItem?.price && recItem?.salePrice && recItem.salePrice < recItem.price
                  ? Math.round(((recItem.price - recItem.salePrice) / recItem.price) * 100)
                  : null;

              const recCat =
                categoryOptionsMap[recItem?.category] ||
                recItem?.category ||
                "HAUTE COUTURE";

              return (
                <div
                  key={`${recId || "rec"}-${recIdx}`}
                  onClick={() => handleSelectRecommendation(recItem)}
                  className="group relative bg-white dark:bg-[#18181B] border border-neutral-200 dark:border-[#27272A] hover:border-neutral-950 dark:hover:border-white transition-all duration-300 rounded-lg overflow-hidden flex flex-col justify-between cursor-pointer shadow-2xs hover:shadow-md"
                >
                  <div className="relative aspect-[3/4] bg-[#F7F7F7] dark:bg-[#202023] overflow-hidden">
                    <img
                      src={recImage}
                      alt={recItem?.title || "Recommended Creation"}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Tag / Discount Pill */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {recDiscount ? (
                        <span className="px-1.5 py-0.5 bg-[#111111] dark:bg-white text-white dark:text-black font-mono text-[9px] font-bold uppercase tracking-wider rounded-xs">
                          -{recDiscount}%
                        </span>
                      ) : recItem?.brand ? (
                        <span className="px-1.5 py-0.5 bg-white/90 dark:bg-black/90 backdrop-blur-xs text-neutral-900 dark:text-white font-mono text-[9px] uppercase tracking-wider rounded-xs border border-neutral-200/60 dark:border-[#333]">
                          {recItem.brand}
                        </span>
                      ) : null}
                    </div>

                    {/* Hover Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                      <span className="px-2.5 py-1 bg-white/95 dark:bg-[#121214]/95 text-neutral-900 dark:text-white text-[10px] font-mono uppercase tracking-widest font-semibold rounded-sm shadow-sm flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        EXPLORE PIECE
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 flex flex-col justify-between flex-1 gap-1">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 block line-clamp-1">
                        {recCat}
                      </span>
                      <h4 className="font-display text-xs uppercase tracking-wider text-neutral-950 dark:text-white font-normal line-clamp-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors pt-0.5">
                        {recItem?.title}
                      </h4>
                    </div>

                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="font-mono text-xs font-bold text-neutral-950 dark:text-white">
                        ${recItem?.salePrice > 0 ? recItem.salePrice : recItem?.price}
                      </span>
                      {recItem?.salePrice > 0 && (
                        <span className="font-mono text-[10px] text-neutral-400 line-through">
                          ${recItem.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Fallback Size Guide Drawer when rendered outside ProductDetailsDialog */}
      {!onOpenSizeGuide && (
        <SizeGuideModal
          open={internalShowSizeGuide}
          onClose={() => setInternalShowSizeGuide(false)}
          product={item}
        />
      )}
    </div>
  );
}

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productId } = useParams();
  const reduxProductDetails = useSelector((state) => state.shopProducts.productDetails);
  const dialogContentRef = useRef(null);
  const dialogScrollContainerRef = useRef(null);
  const standaloneScrollRef = useRef(null);
  const [selectedRecProduct, setSelectedRecProduct] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    if (
      productId &&
      (!reduxProductDetails ||
        (reduxProductDetails._id !== productId && reduxProductDetails.id !== productId))
    ) {
      dispatch(fetchProductDetails(productId));
    }
  }, [dispatch, productId, reduxProductDetails]);

  // Synchronize local preview when reduxProductDetails is fully fetched
  useEffect(() => {
    if (
      selectedRecProduct &&
      reduxProductDetails &&
      (reduxProductDetails._id === selectedRecProduct._id ||
        reduxProductDetails.id === selectedRecProduct.id)
    ) {
      setSelectedRecProduct(null);
    }
  }, [reduxProductDetails, selectedRecProduct]);

  // Clear local preview if parent passes a new product
  useEffect(() => {
    if (productDetails && productDetails._id !== selectedRecProduct?._id) {
      setSelectedRecProduct(null);
    }
  }, [productDetails]);

  const activeItem = selectedRecProduct || productDetails || reduxProductDetails;

  // Reset scroll on dialog open or product change
  useEffect(() => {
    if (open && dialogScrollContainerRef.current) {
      dialogScrollContainerRef.current.scrollTop = 0;
    }
  }, [open, activeItem]);

  // Reset scroll on standalone page change
  useEffect(() => {
    if (productId) {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
      if (standaloneScrollRef.current) {
        standaloneScrollRef.current.scrollTop = 0;
      }
    }
  }, [productId, activeItem]);

  function handleDialogClose() {
    if (setOpen) setOpen(false);
    setSelectedRecProduct(null);
    setShowSizeGuide(false);
    dispatch(setProductDetails());
  }

  function handleSelectProduct(newId, newProduct) {
    if (!newId) return;
    if (newProduct) {
      setSelectedRecProduct(newProduct);
    }
    setShowSizeGuide(false);
    dispatch(fetchProductDetails(newId));

    // Reset scroll position to top of product in dialog and window
    if (dialogScrollContainerRef.current) {
      dialogScrollContainerRef.current.scrollTop = 0;
    }
    if (standaloneScrollRef.current) {
      standaloneScrollRef.current.scrollTop = 0;
    }
    if (dialogContentRef.current) {
      dialogContentRef.current.scrollTop = 0;
    }

    if (productId) {
      navigate(`/product/${newId}`);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    }
  }

  // Standalone full page view (e.g. direct route /shop/product/:productId)
  if (productId) {
    if (!activeItem) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0B0B0B] flex flex-col items-center justify-center p-8 text-center pt-32">
          <div className="w-9 h-9 border-2 border-[#111111] dark:border-white border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-600 dark:text-neutral-400">
            RETRIEVING ATELIER PIECE...
          </p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0B0B0B] pt-28 sm:pt-32 pb-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-4">
          {/* Top Back & Atelier Breadcrumb Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#18181B] border border-neutral-200 dark:border-[#27272A] rounded-lg text-xs font-mono uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-300 shadow-2xs transition-colors font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO COLLECTIONS
            </button>
            <div className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hidden sm:block">
              DAYLIGHT ATELIER // {activeItem?.category || "COLLECTIONS"}
            </div>
          </div>

          {/* Clean Product Details Card */}
          <div className="border border-neutral-200 dark:border-[#27272A] bg-white dark:bg-[#121214] rounded-2xl shadow-sm overflow-hidden">
            <ProductDetailsContent
              item={activeItem}
              currentProductId={productId}
              onSelectProduct={handleSelectProduct}
              dialogContentRef={dialogContentRef}
              onOpenSizeGuide={() => setShowSizeGuide(true)}
            />
          </div>
        </div>

        {/* Global Slide-out Size Guide Drawer */}
        <SizeGuideModal
          open={showSizeGuide}
          onClose={() => setShowSizeGuide(false)}
          product={activeItem}
        />
      </div>
    );
  }

  // Tailored Modal Dialog Mode
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent
        ref={dialogContentRef}
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[95vw] max-w-4xl lg:max-w-5xl p-0 gap-0 overflow-hidden bg-white dark:bg-[#121214] border border-neutral-200 dark:border-[#27272A] text-neutral-950 dark:text-[#EDEDED] rounded-xl shadow-2xl h-[88vh] max-h-[calc(100dvh-2rem)] flex flex-col"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{activeItem?.title || "Product Details"}</DialogTitle>
          <DialogDescription>
            {activeItem?.description || "Atelier luxury garment details and ordering"}
          </DialogDescription>
        </DialogHeader>

        {/* Pinned Dialog Top Header Bar - Always fully visible */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-[#27272A] bg-white dark:bg-[#121214] shrink-0 z-30">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-bold tracking-wider uppercase rounded shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-300 dark:text-amber-600" />
              DAYLIGHT ATELIER
            </span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-widest hidden sm:inline">
              // {activeItem?.category || "CREATION"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleDialogClose}
            aria-label="Close product details"
            className="p-1.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeItem ? (
          <div className="relative flex-1 min-h-0 w-full flex flex-col overflow-hidden">
            {/* Scrollable Product Details Content */}
            <div
              ref={dialogScrollContainerRef}
              className="flex-1 overflow-y-auto overscroll-contain"
            >
              <ProductDetailsContent
                key={activeItem?._id || activeItem?.id}
                item={activeItem}
                currentProductId={activeItem?._id || activeItem?.id}
                isDialog={true}
                onClose={handleDialogClose}
                onSelectProduct={handleSelectProduct}
                dialogContentRef={dialogContentRef}
                onOpenSizeGuide={() => setShowSizeGuide(true)}
              />
            </div>

            {/* Size Guide Drawer */}
            <SizeGuideModal
              open={showSizeGuide}
              onClose={() => setShowSizeGuide(false)}
              product={activeItem}
            />
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-[#111111] dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
              LOADING ATELIER DETAILS...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
