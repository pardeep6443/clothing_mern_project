import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/theme-context";

// Animation variants
const heroContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.15,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Light Mode Banner assets (User uploaded desert campaign + local high-res fallbacks)
const LIGHT_BANNER_LOCAL = "/Gemini_Generated_Image_hzqxabhzqxabhzqx (2).png";
const LIGHT_BANNER_EDITORIAL = "/Gemini_Generated_Image_hzqxabhzqxabhzqx.png";
const LIGHT_BANNER_FALLBACK = "/images/daylight-desert-editorial.jpg";

// Dark Mode Banner asset (Noir haute couture studio campaign)
const DARK_BANNER_CDN =
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2400&q=85";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();

  // Handle image load error fallback for light banner
  const [lightImgSrc, setLightImgSrc] = useState(LIGHT_BANNER_LOCAL);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  return (
    <div
      ref={ref}
      id="home-front-banner"
      className="relative min-h-[95vh] sm:min-h-screen flex items-end pb-20 sm:pb-24 overflow-hidden pt-20 transition-colors duration-700 select-none bg-[#0D0D10]"
    >
      {/* Dynamic Background Parallax Container with Cinematic Dual-Mode Cross-Fade */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* ========================================================================= */}
        {/* 1. LIGHT MODE BANNER: Desert Haute Couture Campaign with DAYLIGHT Letters */}
        {/* ========================================================================= */}
        <motion.div
          initial={false}
          animate={{
            opacity: !isDark ? 1 : 0,
            scale: !isDark ? 1 : 1.04,
          }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={lightImgSrc}
            onError={() => {
              if (lightImgSrc === LIGHT_BANNER_LOCAL) {
                setLightImgSrc(LIGHT_BANNER_EDITORIAL);
              } else if (lightImgSrc === LIGHT_BANNER_EDITORIAL) {
                setLightImgSrc(LIGHT_BANNER_FALLBACK);
              }
            }}
            alt="DAYLIGHT Summer 2026 Ready-to-Wear Desert Campaign"
            className="w-full h-full object-cover object-top filter brightness-[0.96] contrast-[1.03]"
            referrerPolicy="no-referrer"
          />

          {/* Grand Architectural DAYLIGHT Typography Overlay (rendered within the original visual) */}
          {/*
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden px-4">
            <span
              className="font-literature tracking-[0.16em] sm:tracking-[0.24em] text-white/40 mix-blend-overlay uppercase leading-none text-center transform -translate-y-4"
              style={{
                fontSize: "clamp(3.5rem, 13vw, 13rem)",
                textShadow: "0 2px 20px rgba(0, 0, 0, 0.15)",
              }}
            >
              DAYLIGHT
            </span>
          </div>
          */}

          {/* Diamond Star Accent in Lower Flank (Iconic detail from the uploaded visual) */}
          <div className="absolute bottom-28 right-8 sm:bottom-32 sm:right-16 text-white/55 text-2xl sm:text-3xl select-none pointer-events-none drop-shadow-md">
            ✦
          </div>

          {/* Warm Desert Sunlit Vignette to keep text ultra-crisp and luxurious */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        </motion.div>

        {/* ========================================================================= */}
        {/* 2. DARK MODE BANNER: Midnight Noir Haute Couture Campaign                 */}
        {/* ========================================================================= */}
        <motion.div
          initial={false}
          animate={{
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 1.04,
          }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={DARK_BANNER_CDN}
            alt="DAYLIGHT Noir Haute Couture Midnight Collection"
            className="w-full h-full object-cover object-top filter brightness-[0.78] contrast-105"
            referrerPolicy="no-referrer"
          />

          {/* Deep Chiaroscuro Noir Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/45" />
        </motion.div>
      </motion.div>

      {/* Floating Haute Couture Theme Synchronization Pill (Top Right) */}
      <div className="absolute top-24 right-6 sm:top-28 sm:right-12 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] tracking-[0.24em] uppercase font-mono transition-all duration-500 cursor-pointer backdrop-blur-md ${
            isDark
              ? "bg-black/60 border-white/20 text-white/80 hover:border-white/50 hover:text-white"
              : "bg-white/80 border-[#C5A880]/40 text-[#8C6D3B] hover:border-[#C5A880] hover:text-[#5C4520]"
          }`}
          title={isDark ? "Switch to Light Mode (Daylight Campaign)" : "Switch to Dark Mode (Noir Campaign)"}
        >
          {isDark ? (
            <>
              <Moon className="w-3 h-3 text-indigo-300 group-hover:-rotate-12 transition-transform" />
              <span>NOIR CAMPAIGN</span>
            </>
          ) : (
            <>
              <Sun className="w-3 h-3 text-amber-500 group-hover:rotate-45 transition-transform" />
              <span>DAYLIGHT CAMPAIGN</span>
            </>
          )}
          <span className="w-1 h-1 rounded-full bg-current opacity-60" />
        </button>
      </div>

      {/* Hero Editorial Typography & Dior-Style Actions */}
      <motion.div
        variants={heroContainerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 text-center text-white flex flex-col items-center"
      >
        {/* Capsule Subtitle */}
        <motion.div variants={heroItemVariants} className="mb-3">
          <span className="inline-block font-sans text-[11px] sm:text-xs tracking-[0.35em] font-light uppercase text-white/90 border border-white/20 px-4 py-1.5 backdrop-blur-xs">
            {isDark
              ? "SUMMER 2026 READY-TO-WEAR • NOIR ATELIER"
              : "SUMMER 2026 READY-TO-WEAR • DAYLIGHT EDITORIAL"}
          </span>
        </motion.div>

        {/* Couture Headline */}
        <motion.h1
          variants={heroItemVariants}
          className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-[0.18em] text-white leading-tight uppercase max-w-5xl my-2 drop-shadow-sm"
        >
          THE NEW SILHOUETTES
        </motion.h1>

        {/* Minimalist Subtext */}
        <motion.p
          variants={heroItemVariants}
          className="font-serif italic text-lg sm:text-2xl text-white/85 max-w-2xl mt-3 font-light tracking-wide leading-relaxed drop-shadow-sm"
        >
          {isDark
            ? "An ode to midnight tailoring, shadow play, and raw couture expression."
            : "An ode to architectural tailoring, noble desert textures, and radiant daylight."}
        </motion.p>

        {/* Dior-style Call-to-Action Buttons */}
        <motion.div
          variants={heroItemVariants}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-8 sm:mt-10 w-full sm:w-auto"
        >
          <Link
            to="/shop/listing"
            onClick={() => {
              sessionStorage.removeItem("filters");
              sessionStorage.setItem("filters", JSON.stringify({}));
              window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            }}
            className="w-full sm:w-auto px-10 py-4 bg-white text-[#111111] hover:bg-[#F5F5F5] font-sans text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 shadow-lg text-center cursor-pointer hover:shadow-2xl"
          >
            DISCOVER THE COLLECTION
          </Link>

          <button
            onClick={() => {
              const el = document.getElementById("lookbook");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-10 py-4 bg-black/25 backdrop-blur-md border border-white/80 text-white hover:bg-white hover:text-[#111111] font-sans text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 text-center cursor-pointer"
          >
            VIEW LOOKBOOK
          </button>
        </motion.div>
      </motion.div>

      {/* Subtle Scroll Cue */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/70 font-sans text-[10px] tracking-[0.25em] pointer-events-none"
      >
        <span>SCROLL TO EXPLORE</span>
        <ChevronDown className="w-4 h-4 animate-bounce text-white/70" />
      </motion.div>
    </div>
  );
}
