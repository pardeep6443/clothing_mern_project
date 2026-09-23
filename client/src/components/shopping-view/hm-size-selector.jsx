import React, { useState } from "react";
import SizeGuideModal from "./size-guide-modal";

/**
 * H&M Architectural Size Selector Component (Image 1)
 * Features:
 * - Continuous connected border grid
 * - Sizes from S to XXL (with optional XS out-of-stock strikethrough indicator)
 * - Underlined "SIZE GUIDE" link underneath on the right
 * - Integrated H&M Size Guide slide-over drawer (Images 2 & 3)
 */
export default function HMSizeSelector({
  selectedSize,
  onSelectSize,
  product,
  availableSizes = ["S", "M", "L", "XL", "XXL"],
  className = "",
  onOpenSizeGuide,
}) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [stockNotice, setStockNotice] = useState("");

  // Ensure sizes include S, M, L, XL, XXL
  // If product sizes include XS, or to match Image 1's strike-through XS
  const baseSizes = ["S", "M", "L", "XL", "XXL"];

  // Normalize list to ensure S through XXL are always represented
  const allSizesToDisplay = ["XS", "S", "M", "L", "XL", "XXL"];

  // Check if size is in stock
  // In Image 1, XS is depicted with a line-through as unavailable / out of stock
  const isSizeOutOfStock = (size) => {
    if (size === "XS") {
      // If product explicitly has XS, check, else mark as unavailable as in Image 1
      return !availableSizes.includes("XS");
    }
    return false;
  };

  const handleSizeClick = (size) => {
    if (isSizeOutOfStock(size)) {
      setStockNotice(`Size ${size} is currently out of stock. Please select S to XXL.`);
      setTimeout(() => setStockNotice(""), 3500);
      return;
    }
    setStockNotice("");
    onSelectSize(size);
  };

  return (
    <div className={`space-y-2 w-full ${className}`}>
      {/* Top Label & Selected Size Display */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
          <span>SELECT SIZE:</span>
          <span className="inline-flex items-center justify-center px-2 py-0.5 bg-neutral-950 dark:bg-white text-white dark:text-black text-[11px] font-mono font-bold rounded-xs min-w-[24px]">
            {selectedSize || "M"}
          </span>
        </span>
        <span className="text-[11px] text-neutral-500 font-mono">
          Regular Fit • In Stock
        </span>
      </div>

      {/* Connected Horizontal Box Grid (Image 1) */}
      <div className="w-full border border-neutral-300 dark:border-neutral-700 rounded-none bg-white dark:bg-neutral-950 overflow-hidden shadow-2xs">
        <div className="grid grid-cols-6 divide-x divide-neutral-300 dark:divide-neutral-700">
          {allSizesToDisplay.map((size) => {
            const isSelected = selectedSize === size;
            const isOutOfStock = isSizeOutOfStock(size);

            return (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeClick(size)}
                title={isOutOfStock ? `Size ${size} is unavailable` : `Select size ${size}`}
                className={`h-12 sm:h-13 flex items-center justify-center font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors duration-150 relative select-none ${
                  isOutOfStock
                    ? "cursor-not-allowed text-neutral-400 dark:text-neutral-600 bg-neutral-100/50 dark:bg-neutral-900/40"
                    : isSelected
                    ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                    : "bg-transparent text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {/* Size Text */}
                <span className="relative z-10">{size}</span>

                {/* Strikethrough horizontal line for out-of-stock sizes (Image 1: —XS—) */}
                {isOutOfStock && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[1.5px] bg-neutral-400 dark:bg-neutral-600 pointer-events-none"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Underlined "SIZE GUIDE" Link right below the boxes (Image 1) */}
      <div className="flex items-center justify-between pt-1">
        {stockNotice ? (
          <span className="text-[11px] text-rose-500 dark:text-rose-400 font-mono animate-in fade-in duration-150">
            {stockNotice}
          </span>
        ) : (
          <span className="text-[10px] text-neutral-400 font-mono">
            Standard unisex atelier grading
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (onOpenSizeGuide) {
              onOpenSizeGuide();
            } else {
              setIsGuideOpen(true);
            }
          }}
          className="text-xs uppercase tracking-[0.14em] font-semibold underline underline-offset-4 text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer py-1"
        >
          SIZE GUIDE
        </button>
      </div>

      {/* Slide-out H&M Size Guide Drawer (Fallback when not handled by parent container) */}
      {!onOpenSizeGuide && (
        <SizeGuideModal
          open={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          product={product}
        />
      )}
    </div>
  );
}
