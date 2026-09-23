import React, { useState, useRef } from "react";
import { categoryOptionsMap } from "@/config";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ShoppingBag, ChevronLeft, ChevronRight, Images, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/contexts/wishlist-context";
import { useSelector } from "react-redux";

// Generate complementary atelier perspective angles so swipe is always multi-angle
function getAtelierPerspectives(item, baseImages) {
  if (baseImages.length > 1) return baseImages;
  if (baseImages.length === 0) return baseImages;

  const baseImg = baseImages[0];
  const cat = (item?.category || "").toLowerCase();

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

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
  showWishlist = false,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1); // 1 = right, -1 = left

  // Touch swipe gesture refs
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchEndXRef = useRef(0);
  const touchEndYRef = useRef(0);
  const swipedRef = useRef(false);

  const availableSizes =
    product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes.includes("XXL")
        ? product.sizes
        : [...product.sizes, "XXL"]
      : ["XS", "S", "M", "L", "XL", "XXL"];
  const [selectedSize, setSelectedSize] = useState(
    availableSizes.includes("M") ? "M" : availableSizes[0] || "M"
  );
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const productId = product?._id || product?.id;
  const inWishlist = isInWishlist(productId);

  const handleWishlistClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    toggleWishlist({
      id: productId,
      name: product?.title || "Maison Creation",
      price: product?.price || 0,
      salePrice: product?.salePrice,
      image: activeImage,
      category: product?.category,
      brand: product?.brand,
      totalStock: product?.totalStock,
    });
  };

  // Extract all images array safely
  let productImages = [];
  if (Array.isArray(product?.images) && product.images.length > 0) {
    productImages = product.images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
  } else if (Array.isArray(product?.image) && product.image.length > 0) {
    productImages = product.image.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
  } else if (typeof product?.image === "string" && product.image) {
    productImages = [product.image];
  } else if (product?.image?.url) {
    productImages = [product.image.url];
  }

  if (productImages.length === 0) {
    productImages = ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80"];
  }

  productImages = getAtelierPerspectives(product, productImages);

  const activeImage = productImages[currentImageIndex] || productImages[0];

  function handlePrevImage(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    setSlideDirection(-1);
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  }

  function handleNextImage(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    setSlideDirection(1);
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  }

  function handleDotClick(e, idx) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    setSlideDirection(idx > currentImageIndex ? 1 : -1);
    setCurrentImageIndex(idx);
  }

  // Touch swipe gesture handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      touchEndXRef.current = e.touches[0].clientX;
      touchEndYRef.current = e.touches[0].clientY;
      swipedRef.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchEndXRef.current = e.touches[0].clientX;
      touchEndYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    const deltaX = touchStartXRef.current - touchEndXRef.current;
    const deltaY = touchStartYRef.current - touchEndYRef.current;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      swipedRef.current = true;
      if (deltaX > 0) {
        // Swiped left -> Next image
        handleNextImage(e);
      } else {
        // Swiped right -> Previous image
        handlePrevImage(e);
      }
      setTimeout(() => {
        swipedRef.current = false;
      }, 350);
    }
    touchStartXRef.current = 0;
    touchEndXRef.current = 0;
  };

  function handleCardClick(e) {
    if (swipedRef.current) {
      swipedRef.current = false;
      return;
    }
    if (handleGetProductDetails) {
      e.preventDefault();
      handleGetProductDetails(productId);
    } else {
      navigate(`/product/${productId}`);
    }
  }

  // Slide animation variants
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

  const productCats = Array.isArray(product?.categories) && product.categories.length > 0
    ? product.categories
    : Array.isArray(product?.category) && product.category.length > 0
    ? product.category
    : typeof product?.category === "string" && product.category
    ? product.category.split(",").map((c) => c.trim()).filter(Boolean)
    : ["READY-TO-WEAR"];

  return (
    <div
      className="w-full max-w-sm mx-auto group bg-white dark:bg-[#121214] border border-[#EBEBEB] dark:border-[#27272A] hover:border-[#111111] dark:hover:border-white transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => {
        setIsHovered(true);
        // Optional hover effect: if there's a 2nd image and at index 0, transition smoothly
        if (productImages.length > 1 && currentImageIndex === 0) {
          setSlideDirection(1);
          setCurrentImageIndex(1);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        // Reset to primary image when unhovering
        if (currentImageIndex !== 0) {
          setSlideDirection(-1);
          setCurrentImageIndex(0);
        }
      }}
    >
      <div>
        <div onClick={handleCardClick} className="block cursor-pointer">
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative overflow-hidden cursor-pointer aspect-[3/4] bg-[#F7F7F7] dark:bg-[#18181B] touch-pan-y select-none"
          >
            {/* Sliding Image Carousel */}
            <AnimatePresence custom={slideDirection} mode="wait">
              <motion.div
                key={currentImageIndex}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full h-full absolute inset-0"
              >
                <img
                  src={activeImage}
                  alt={product?.title || "Maison Creation"}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </motion.div>
            </AnimatePresence>

            {/* Badges */}
            {product?.isPreOrder ? (
              <span className="absolute top-3 left-3 z-10 bg-amber-600 text-white font-sans text-[9px] uppercase tracking-[0.2em] font-semibold px-2.5 py-1 shadow-xs flex items-center gap-1">
                PRE-ORDER
              </span>
            ) : product?.totalStock === 0 ? (
              <span className="absolute top-3 left-3 z-10 bg-[#111111]/85 dark:bg-black/85 text-white font-sans text-[9px] uppercase tracking-[0.2em] px-2.5 py-1">
                SOLD OUT
              </span>
            ) : product?.totalStock < 10 ? (
              <span className="absolute top-3 left-3 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-xs text-[#111111] dark:text-white font-sans text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 border border-[#E5E5E5] dark:border-[#27272A]">
                LIMITED PIECES
              </span>
            ) : product?.salePrice > 0 ? (
              <span className="absolute top-3 left-3 z-10 bg-[#111111] dark:bg-white text-white dark:text-black font-sans text-[9px] uppercase tracking-[0.2em] px-2.5 py-1">
                PRIVILEGE OFFER
              </span>
            ) : null}

            {/* Wishlist Floating Button */}
            {showWishlist && (
              <button
                type="button"
                onClick={handleWishlistClick}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black text-[#111111] dark:text-white border border-[#E5E5E5] dark:border-[#27272A] flex items-center justify-center shadow-xs transition-transform active:scale-90"
                title={inWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
                aria-label={inWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    inWishlist
                      ? "fill-red-500 text-red-500"
                      : "text-[#111111] dark:text-white hover:text-red-500"
                  }`}
                />
              </button>
            )}

            {/* Photos Count Indicator */}
            {productImages.length > 1 && (
              <span className="absolute top-3 right-13 z-10 bg-black/60 backdrop-blur-xs text-white font-sans text-[9px] tracking-wider px-2 py-1 rounded flex items-center gap-1">
                <Images className="w-2.5 h-2.5" />
                {currentImageIndex + 1}/{productImages.length}
              </span>
            )}

            {/* Carousel Navigation Arrows (visible on hover if >1 image) */}
            {productImages.length > 1 && (
              <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-10">
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="w-7 h-7 bg-white/80 hover:bg-white text-[#111111] border border-gray-200 rounded-full flex items-center justify-center pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="w-7 h-7 bg-white/80 hover:bg-white text-[#111111] border border-gray-200 rounded-full flex items-center justify-center pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Carousel Indicator Dots with smooth upward glide and balanced gap on hover */}
            {productImages.length > 1 && (
              <div className="absolute inset-x-0 flex justify-center items-center z-10 pointer-events-auto transition-all duration-300 ease-out bottom-3.5 group-hover:bottom-[66px]">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/45 backdrop-blur-xs rounded-full shadow-xs">
                  {productImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleDotClick(e, idx)}
                      className={`h-1.5 transition-all duration-300 rounded-full ${
                        currentImageIndex === idx
                          ? "w-4 bg-white"
                          : "w-1.5 bg-white/50 hover:bg-white"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick View Button overlaid on hover */}
            <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (handleGetProductDetails) {
                    handleGetProductDetails(productId);
                  } else {
                    navigate(`/product/${productId}`);
                  }
                }}
                className="w-full py-2.5 bg-white/95 dark:bg-black/95 hover:bg-white dark:hover:bg-black text-[#111111] dark:text-white border border-[#111111] dark:border-white font-sans text-[10px] uppercase tracking-[0.2em] font-medium shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                QUICK VIEW
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-1.5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-1">
            {productCats.map((cat, i) => (
              <span key={i} className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#767676] dark:text-[#A1A1AA]">
                {categoryOptionsMap[cat] || cat}
                {i < productCats.length - 1 && <span className="mx-1 text-[#C0C0C0] dark:text-[#52525B]">·</span>}
              </span>
            ))}
          </div>

          <div onClick={handleCardClick} className="cursor-pointer">
            <h3 className="font-display text-sm uppercase tracking-[0.1em] text-[#111111] dark:text-[#EDEDED] hover:text-[#555555] dark:hover:text-[#A1A1AA] transition-colors line-clamp-1 font-normal">
              {product?.title}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 font-sans text-xs">
            <span
              className={`${
                product?.salePrice > 0
                  ? "line-through text-[#999999] dark:text-[#71717A]"
                  : "text-[#111111] dark:text-[#EDEDED] font-medium tracking-wider"
              }`}
            >
              ${product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-[#111111] dark:text-[#EDEDED] font-medium tracking-wider">
                ${product?.salePrice}
              </span>
            ) : null}
          </div>

          {product?.isPreOrder && (
            <div className="pt-1 text-center">
              <span className="text-[10px] font-mono font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Ships: {product?.preOrderReleaseDate || "Coming Soon"}
              </span>
            </div>
          )}

          {/* Quick Size Selection on Tile */}
          <div className="pt-2 pb-1 flex items-center justify-center gap-1.5">
            {availableSizes.map((sizeOpt) => (
              <button
                key={sizeOpt}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSize(sizeOpt);
                }}
                className={`px-1.5 py-0.5 font-mono text-[10px] font-semibold border transition-all ${
                  selectedSize === sizeOpt
                    ? "bg-[#111111] dark:bg-white text-white dark:text-black border-[#111111] dark:border-white"
                    : "bg-white dark:bg-[#18181B] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-300"
                }`}
              >
                {sizeOpt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        {product?.totalStock === 0 && !product?.isPreOrder ? (
          <button disabled className="w-full py-2.5 bg-[#F5F5F5] dark:bg-[#1C1C1F] text-[#999999] dark:text-[#71717A] font-sans text-[10px] uppercase tracking-[0.2em] cursor-not-allowed">
            UNAVAILABLE
          </button>
        ) : product?.isPreOrder ? (
          <button
            onClick={() => handleAddtoCart(productId, product?.totalStock, selectedSize)}
            className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-sans text-[10px] uppercase tracking-[0.25em] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            PRE-ORDER SIZE {selectedSize}
          </button>
        ) : (
          <button
            onClick={() => handleAddtoCart(productId, product?.totalStock, selectedSize)}
            className="w-full py-2.5 bg-[#111111] dark:bg-white hover:bg-[#222222] dark:hover:bg-neutral-200 text-white dark:text-black font-sans text-[10px] uppercase tracking-[0.25em] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            ADD SIZE {selectedSize}
          </button>
        )}
      </div>
    </div>
  );
}

export default ShoppingProductTile;
