import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import {
  TOPWEAR_SIZE_DATA,
  BOTTOMWEAR_SIZE_DATA,
  detectProductGarmentType,
} from "./size-guide-data";

/**
 * Clean SVG Anatomical Illustration for Topwear Measurements
 * Adapts dynamically to Light and Dark mode
 */
function TopwearMannequinSVG() {
  return (
    <svg
      viewBox="0 0 280 340"
      className="w-full max-w-[240px] sm:max-w-[260px] h-auto select-none mx-auto text-neutral-800 dark:text-neutral-200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background card accent */}
      <rect
        width="280"
        height="340"
        rx="6"
        className="fill-white dark:fill-neutral-900 stroke-neutral-200/80 dark:stroke-neutral-800"
        strokeWidth="1"
      />

      {/* Head & Neck */}
      <path
        d="M125 45 C125 28 155 28 155 45 C155 60 148 68 140 70 C132 68 125 60 125 45 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M133 69 L133 85 M147 69 L147 85"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Torso & Shoulders Outline */}
      <path
        d="M133 85 C118 88 95 96 82 108 L66 170 C63 182 60 200 58 225 C57 232 62 236 67 236 C71 236 74 232 75 224 L85 168 L92 168 L88 238 L104 238 L110 185 C110 180 120 180 120 185 L126 238 L138 238 L142 238 L154 238 L160 185 C160 180 170 180 170 185 L176 238 L192 238 L188 168 L195 168 L205 224 C206 232 209 236 213 236 C218 236 223 232 222 225 C220 200 217 182 214 170 L198 108 C185 96 162 88 147 85"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Legs & Hip Silhouette */}
      <path
        d="M104 238 L98 322 M176 238 L182 322"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M132 238 L132 255 L120 322 M148 238 L148 255 L160 322"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* (1) CHEST Measurement Line (Red horizontal) */}
      <line
        x1="86"
        y1="134"
        x2="194"
        y2="134"
        stroke="#E11D48"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <g transform="translate(68, 134)">
        <circle
          cx="0"
          cy="0"
          r="10.5"
          className="fill-white dark:fill-neutral-900 stroke-neutral-800 dark:stroke-neutral-200"
          strokeWidth="1.6"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          className="fill-neutral-900 dark:fill-white font-sans"
        >
          1
        </text>
      </g>

      {/* (2) WAIST Measurement Line (Red horizontal) */}
      <line
        x1="92"
        y1="172"
        x2="188"
        y2="172"
        stroke="#E11D48"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <g transform="translate(68, 172)">
        <circle
          cx="0"
          cy="0"
          r="10.5"
          className="fill-white dark:fill-neutral-900 stroke-neutral-800 dark:stroke-neutral-200"
          strokeWidth="1.6"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          className="fill-neutral-900 dark:fill-white font-sans"
        >
          2
        </text>
      </g>

      {/* (3) ARM LENGTH Measurement Line (Red vertical arrow along right arm) */}
      <path
        d="M202 110 C211 135 214 175 208 214"
        stroke="#E11D48"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <polygon points="208,218 203,208 213,209" fill="#E11D48" />
      <g transform="translate(222, 102)">
        <circle
          cx="0"
          cy="0"
          r="10.5"
          className="fill-white dark:fill-neutral-900 stroke-neutral-800 dark:stroke-neutral-200"
          strokeWidth="1.6"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          className="fill-neutral-900 dark:fill-white font-sans"
        >
          3
        </text>
      </g>

      {/* (4) NECKLINE Indicator */}
      <path
        d="M130 84 C136 91 144 91 150 84"
        stroke="#E11D48"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

/**
 * Clean SVG Anatomical Illustration for Bottomwear Measurements
 * Adapts dynamically to Light and Dark mode
 */
function BottomwearMannequinSVG() {
  return (
    <svg
      viewBox="0 0 280 340"
      className="w-full max-w-[240px] sm:max-w-[260px] h-auto select-none mx-auto text-neutral-800 dark:text-neutral-200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background card accent */}
      <rect
        width="280"
        height="340"
        rx="6"
        className="fill-white dark:fill-neutral-900 stroke-neutral-200/80 dark:stroke-neutral-800"
        strokeWidth="1"
      />

      {/* Lower Torso & Legs Silhouette */}
      <path
        d="M80 60 C90 58 190 58 200 60 L204 110 C204 135 200 170 196 230 L188 315 C187 320 182 322 176 322 C170 322 165 318 164 312 L150 175 L136 312 C135 318 130 322 124 322 C118 322 113 320 112 315 L104 230 C100 170 96 135 96 110 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* (1) WAIST Line (Red horizontal) */}
      <line
        x1="82"
        y1="64"
        x2="198"
        y2="64"
        stroke="#E11D48"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <g transform="translate(64, 64)">
        <circle
          cx="0"
          cy="0"
          r="10.5"
          className="fill-white dark:fill-neutral-900 stroke-neutral-800 dark:stroke-neutral-200"
          strokeWidth="1.6"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          className="fill-neutral-900 dark:fill-white font-sans"
        >
          1
        </text>
      </g>

      {/* (2) HIP / SEAT Line (Red horizontal) */}
      <line
        x1="94"
        y1="112"
        x2="206"
        y2="112"
        stroke="#E11D48"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <g transform="translate(64, 112)">
        <circle
          cx="0"
          cy="0"
          r="10.5"
          className="fill-white dark:fill-neutral-900 stroke-neutral-800 dark:stroke-neutral-200"
          strokeWidth="1.6"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          className="fill-neutral-900 dark:fill-white font-sans"
        >
          2
        </text>
      </g>

      {/* (3) INSIDE LEG (Inseam) Arrow */}
      <path
        d="M148 180 L162 308"
        stroke="#E11D48"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <polygon points="163,314 157,304 167,306" fill="#E11D48" />
      <g transform="translate(178, 220)">
        <circle
          cx="0"
          cy="0"
          r="10.5"
          className="fill-white dark:fill-neutral-900 stroke-neutral-800 dark:stroke-neutral-200"
          strokeWidth="1.6"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          className="fill-neutral-900 dark:fill-white font-sans"
        >
          3
        </text>
      </g>

      {/* (4) THIGH Line */}
      <line
        x1="102"
        y1="165"
        x2="145"
        y2="165"
        stroke="#E11D48"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g transform="translate(64, 165)">
        <circle
          cx="0"
          cy="0"
          r="10.5"
          className="fill-white dark:fill-neutral-900 stroke-neutral-800 dark:stroke-neutral-200"
          strokeWidth="1.6"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          className="fill-neutral-900 dark:fill-white font-sans"
        >
          4
        </text>
      </g>
    </svg>
  );
}

export default function SizeGuideModal({
  open,
  onClose,
  product,
  initialGarmentType,
}) {
  const scrollBodyRef = useRef(null);
  const topAnchorRef = useRef(null);

  // Auto-detect if current product is topwear or bottomwear
  const detectedType = initialGarmentType || detectProductGarmentType(product);
  const [activeCategory, setActiveCategory] = useState(detectedType);

  // Sync when product changes
  useEffect(() => {
    const nextType = initialGarmentType || detectProductGarmentType(product);
    setActiveCategory(nextType);
  }, [product, initialGarmentType]);

  // "HOW TO MEASURE" Accordion state:
  // Starts collapsed by default; smoothly opens on click
  const [isHowToMeasureOpen, setIsHowToMeasureOpen] = useState(false);

  // Active Size Range tab: "S-M", "L-XL", "XXL", or "ALL"
  const [activeRangeId, setActiveRangeId] = useState("S-M");

  const sizeData =
    activeCategory === "bottom" ? BOTTOMWEAR_SIZE_DATA : TOPWEAR_SIZE_DATA;

  // Derive visible columns based on selected range
  const currentRange =
    sizeData.ranges.find((r) => r.id === activeRangeId) || sizeData.ranges[0];
  const visibleSizes = currentRange.sizes;

  // Guarantee scrolling to top of size guide on open
  useEffect(() => {
    if (open) {
      const resetScrollToTop = () => {
        if (scrollBodyRef.current) {
          scrollBodyRef.current.scrollTop = 0;
        }
      };

      // 1. Immediate reset synchronously
      resetScrollToTop();

      // 2. Animation frames (ensures scroll is 0 as spring drawer enters)
      const raf1 = requestAnimationFrame(() => {
        resetScrollToTop();
        const raf2 = requestAnimationFrame(resetScrollToTop);
        return () => cancelAnimationFrame(raf2);
      });

      // 3. Staggered timeouts for reflow settlement
      const t1 = setTimeout(resetScrollToTop, 25);
      const t2 = setTimeout(resetScrollToTop, 80);
      const t3 = setTimeout(resetScrollToTop, 180);

      return () => {
        cancelAnimationFrame(raf1);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[130] flex justify-end overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Size Guide"
        >
          {/* Backdrop with smooth Fade animation covering full viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
          />

          {/* Slide-out Drawer Panel rendered fixed to full viewport height */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 32,
              stiffness: 320,
              mass: 0.85,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:w-[480px] md:w-[540px] max-w-full h-full max-h-screen bg-white dark:bg-[#111111] text-neutral-900 dark:text-white flex flex-col shadow-2xl z-10 overflow-hidden border-l border-neutral-200 dark:border-neutral-800"
          >
            {/* Top Header - Always pinned at top with full visibility */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111111] shrink-0 z-20">
              <div className="flex-1 pr-4">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-neutral-900 dark:text-neutral-100 font-sans leading-tight">
                  {sizeData.categoryTitle}
                </h2>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5 uppercase tracking-wider">
                  H&M Standard Atelier Chart • Regular Fit
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close size guide"
                className="p-2 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Switcher Pill (Topwear vs Bottomwear) */}
            <div className="px-6 py-2.5 flex items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-black/40 shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Category:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("top");
                    if (scrollBodyRef.current) {
                      scrollBodyRef.current.scrollTop = 0;
                    }
                  }}
                  className={`px-3 py-1 text-[11px] font-sans font-medium uppercase tracking-wider rounded transition-colors cursor-pointer ${
                    activeCategory === "top"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-2xs"
                      : "bg-white dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-transparent hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  }`}
                >
                  Tops & Hoodies
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("bottom");
                    if (scrollBodyRef.current) {
                      scrollBodyRef.current.scrollTop = 0;
                    }
                  }}
                  className={`px-3 py-1 text-[11px] font-sans font-medium uppercase tracking-wider rounded transition-colors cursor-pointer ${
                    activeCategory === "bottom"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-2xs"
                      : "bg-white dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-transparent hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  }`}
                >
                  Trousers & Jeans
                </button>
              </div>
            </div>

            {/* Scrollable Body Content (Reset to top on open) */}
            <div
              ref={scrollBodyRef}
              className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800"
            >
              {/* Invisible Top Anchor to ensure scroll-to-top */}
              <div
                ref={topAnchorRef}
                className="h-0 w-0 opacity-0 pointer-events-none"
                aria-hidden="true"
              />

              {/* SECTION 1: HOW TO MEASURE */}
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsHowToMeasureOpen((prev) => !prev);
                  }}
                  className="flex items-center justify-between w-full py-2.5 px-3.5 rounded bg-neutral-100/80 hover:bg-neutral-200/80 dark:bg-neutral-900/80 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-left font-sans font-bold text-xs sm:text-sm tracking-[0.12em] uppercase text-neutral-900 dark:text-white transition-all cursor-pointer group"
                  aria-expanded={isHowToMeasureOpen}
                >
                  <div className="flex items-center gap-2">
                    <span>HOW TO MEASURE</span>
                    <span className="text-[10px] font-mono font-normal text-neutral-500 dark:text-neutral-400 lowercase">
                      ({isHowToMeasureOpen ? "click to close" : "click to open"})
                    </span>
                  </div>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 group-hover:border-neutral-500 transition-colors shrink-0">
                    {isHowToMeasureOpen ? (
                      <Minus className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isHowToMeasureOpen && (
                    <motion.div
                      key="how-to-measure-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden pt-4 space-y-4"
                    >
                      {/* Visual Line-Art Anatomical Diagram on Themed Card */}
                      <div className="bg-neutral-50 dark:bg-neutral-900/90 rounded border border-neutral-200 dark:border-neutral-800 p-4 shadow-2xs flex items-center justify-center">
                        {activeCategory === "bottom" ? (
                          <BottomwearMannequinSVG />
                        ) : (
                          <TopwearMannequinSVG />
                        )}
                      </div>

                      {/* Numbered Measuring Instructions */}
                      <div className="space-y-3.5 pt-1">
                        {sizeData.howToMeasure.map((item) => (
                          <div key={item.number} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center shrink-0 text-xs font-bold font-mono mt-0.5 shadow-2xs">
                              {item.number}
                            </div>
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold tracking-wider uppercase text-neutral-900 dark:text-neutral-100 font-sans">
                                {item.title}
                              </div>
                              <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SECTION 2: SELECT SIZE RANGE */}
              <div className="space-y-5 pt-1">
                <div className="text-center font-bold tracking-[0.14em] uppercase text-xs sm:text-sm text-neutral-900 dark:text-white font-sans">
                  SELECT SIZE RANGE
                </div>

                {/* Fit Category Tabs ("REGULAR") */}
                <div className="flex justify-center border-b border-neutral-200 dark:border-neutral-800">
                  <div className="relative pb-2 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 dark:text-white border-b-2 border-neutral-950 dark:border-white -mb-[1px]">
                    REGULAR
                  </div>
                </div>

                {/* Size Range Selector Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {sizeData.ranges.map((range) => {
                    const isActive = activeRangeId === range.id;
                    return (
                      <button
                        key={range.id}
                        type="button"
                        onClick={() => setActiveRangeId(range.id)}
                        className={`h-11 sm:h-12 flex items-center justify-center font-sans text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-150 rounded-xs border cursor-pointer ${
                          isActive
                            ? "bg-neutral-900 text-white border-neutral-900 dark:bg-[#D4D4D4] dark:text-black dark:border-[#D4D4D4] shadow-xs"
                            : "bg-white dark:bg-transparent text-neutral-800 dark:text-white border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
                        }`}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>

                {/* Measurements Table */}
                <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-2xs">
                  <table className="w-full text-left font-sans text-xs sm:text-sm">
                    {/* Column Headers (Sizes) */}
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/60">
                        <th className="py-3 px-3 sm:px-4 font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 w-1/3 text-xs">
                          Metric
                        </th>
                        {visibleSizes.map((sz) => (
                          <th
                            key={sz}
                            className="py-3 px-2 sm:px-3 text-center font-bold uppercase tracking-widest text-neutral-950 dark:text-white text-xs sm:text-sm"
                          >
                            {sz}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* Table Data Rows with Divider Lines */}
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80 bg-white dark:bg-transparent">
                      {sizeData.metrics.map((row) => (
                        <tr
                          key={row.label}
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors"
                        >
                          <td className="py-3 px-3 sm:px-4 font-bold text-neutral-900 dark:text-white tracking-wide text-xs sm:text-sm">
                            {row.label}
                          </td>
                          {visibleSizes.map((sz) => (
                            <td
                              key={sz}
                              className="py-3 px-2 sm:px-3 text-center text-neutral-700 dark:text-neutral-300 font-mono text-xs sm:text-sm whitespace-nowrap"
                            >
                              {row.values[sz] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Atelier Fit Advice Note */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 rounded text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-mono">
                  <span className="text-neutral-900 dark:text-white font-bold uppercase">
                    Fit Tip:{" "}
                  </span>
                  If your measurements fall between sizes, order the smaller size for
                  a tighter fit or the larger size for a relaxed, comfortable drape.
                </div>
              </div>
            </div>

            {/* Footer with Close action */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-black/60 flex items-center justify-between shrink-0">
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono uppercase tracking-wider">
                All measurements in centimeters & inches
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold uppercase tracking-widest bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors rounded-xs shadow-2xs cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
