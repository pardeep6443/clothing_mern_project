import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FooterBrandWatermark() {
  // Local artistic brand mode: 'day' | 'night'
  // Strictly isolated to this component - NEVER alters the global site theme
  const [mode, setMode] = useState("day");
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "day" ? "night" : "day"));
  }, []);

  // Touch handlers for mobile swipe gestures (non-intrusive to page scrolling)
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchMove = (e) => {
    if (!touchStartY.current) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(deltaY) > 8) {
      setIsDragging(true);
      const damped = Math.max(-40, Math.min(40, deltaY * 0.35));
      setDragOffset(damped);
    }
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;
    setDragOffset(0);

    // Swipe UP (negative delta) -> Nightfall
    if (deltaY < -20 || (deltaY < -10 && deltaTime < 250)) {
      setMode("night");
    }
    // Swipe DOWN (positive delta) -> Daylight
    else if (deltaY > 20 || (deltaY > 10 && deltaTime < 250)) {
      setMode("day");
    }
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e) => {
    touchStartY.current = e.clientY;
    touchStartTime.current = Date.now();
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
    }

    if (isDragging && touchStartY.current) {
      const deltaY = e.clientY - touchStartY.current;
      const damped = Math.max(-45, Math.min(45, deltaY * 0.4));
      setDragOffset(damped);
    }
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const deltaY = e.clientY - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;
    setDragOffset(0);

    if (deltaY < -20 || (deltaY < -10 && deltaTime < 250)) {
      setMode("night");
    } else if (deltaY > 20 || (deltaY > 10 && deltaTime < 250)) {
      setMode("day");
    }
  };

  const isNight = mode === "night";

  // Letter sets: DAYLIGHT (8 letters) <-> NIGHTFALL (9 letters)
  const dayLetters = ["D", "A", "Y", "L", "I", "G", "H", "T"];
  const nightLetters = ["N", "I", "G", "H", "T", "F", "A", "L", "L"];

  return (
    <div
      ref={containerRef}
      id="footer-brand-watermark"
      className={`relative w-full py-8 sm:py-14 select-none overflow-hidden cursor-ns-resize rounded-2xl transition-all duration-700 ${
        isNight
          ? "dark bg-gradient-to-b from-[#09090D] via-[#0E0E14] to-[#07070A] border border-[#27272A]/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-[#EDEDED]"
          : "bg-gradient-to-b from-[#FAF8F5]/90 via-[#F5F2EA]/70 to-[#ECE7DC]/60 border border-[#E5E5E5]/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-[#111111]"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
        setDragOffset(0);
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Ethereal Celestial Atmosphere (Contained purely within watermark) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Luminous Sun / Moon Rising Behind the Letters */}
        <motion.div
          className="relative w-48 h-48 sm:w-72 sm:h-72 rounded-full blur-[2px] transition-all duration-1000 ease-out"
          animate={{
            scale: isNight ? 1.05 : 0.95,
            y: isNight ? -10 : 10,
          }}
          style={{
            background: isNight
              ? "radial-gradient(circle at 45% 45%, rgba(199, 210, 254, 0.22) 0%, rgba(129, 140, 248, 0.12) 40%, rgba(99, 102, 241, 0.04) 65%, transparent 80%)"
              : "radial-gradient(circle at 50% 50%, rgba(254, 240, 138, 0.35) 0%, rgba(212, 175, 55, 0.18) 40%, rgba(245, 158, 11, 0.05) 70%, transparent 85%)",
            boxShadow: isNight
              ? "0 0 90px rgba(99, 102, 241, 0.2), inset 0 0 35px rgba(224, 231, 255, 0.2)"
              : "0 0 100px rgba(212, 175, 55, 0.22), inset 0 0 35px rgba(254, 243, 199, 0.3)",
          }}
        >
          {/* Subtle Crescent Orbit in Night Mode */}
          {isNight && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute -top-3 -right-3 w-36 h-36 rounded-full border border-indigo-300/20 blur-[1px]"
            />
          )}
        </motion.div>

        {/* Dynamic Specular Spotlight that follows cursor */}
        <div
          className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle 350px at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${
              isNight ? "rgba(129, 140, 248, 0.12)" : "rgba(212, 175, 55, 0.14)"
            }, transparent 70%)`,
          }}
        />

        {/* Minimalist 1px Horizon Line */}
        <div
          className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] transition-all duration-1000 ${
            isNight
              ? "bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent"
              : "bg-gradient-to-r from-transparent via-[#C5A880]/30 to-transparent"
          }`}
        />

        {/* Constellation micro-stars (Night Mode) */}
        {isNight && (
          <div className="absolute inset-0">
            <span className="absolute top-[28%] left-[16%] w-1 h-1 bg-white rounded-full animate-ping opacity-50" />
            <span className="absolute top-[32%] right-[20%] w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse opacity-70" />
            <span className="absolute bottom-[35%] left-[28%] w-1 h-1 bg-purple-200 rounded-full animate-pulse opacity-40" />
            <span className="absolute top-[60%] right-[14%] w-1 h-1 bg-white rounded-full opacity-60" />
          </div>
        )}
      </div>

      {/* 2. Floating Minimalist Celestial Capsule Indicator */}
      <div className="relative z-10 flex justify-center pb-2 sm:pb-3 px-2">
        <button
          type="button"
          onClick={toggleMode}
          className={`group inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[9px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.28em] uppercase font-mono transition-all duration-500 cursor-pointer ${
            isNight
              ? "bg-[#0E0E14]/80 border-indigo-400/30 text-indigo-200/90 hover:border-indigo-300 hover:text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              : "bg-white/80 border-[#C5A880]/30 text-[#8C6D3B] hover:border-[#C5A880] hover:text-[#5C4520] shadow-[0_4px_20px_rgba(212,175,55,0.08)]"
          } backdrop-blur-md`}
          title={isNight ? "Swipe down or click for Daylight" : "Swipe up or click for Nightfall"}
        >
          {/* Celestial Symbol */}
          <span className="text-xs transition-transform duration-500 group-hover:rotate-45">
            {isNight ? "☽" : "☼"}
          </span>

          <span className="font-semibold whitespace-nowrap">
            {isNight ? "SWIPE ↓ DAYLIGHT" : "SWIPE ↑ NIGHTFALL"}
          </span>

          <span className="w-1 h-1 rounded-full bg-current opacity-60 group-hover:scale-150 transition-transform" />
        </button>
      </div>

      {/* 3. The Grand Kinetic Typography (Fully Responsive on All Mobile Viewports) */}
      <div
        className="relative z-10 w-full max-w-full text-center select-none px-1 overflow-hidden"
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={toggleMode}
      >
        <div
          className="relative inline-flex items-center justify-center font-literature font-normal leading-none cursor-pointer tracking-[0.05em] xs:tracking-[0.1em] sm:tracking-[0.18em] md:tracking-[0.24em] max-w-full overflow-hidden"
          style={{
            perspective: "1000px",
            // Responsive clamp: guarantees 9 letters never exceed viewport width on 320px-400px mobile phones
            fontSize: "clamp(1.75rem, 7.2vw, 7.8rem)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {!isNight ? (
              /* DAYLIGHT LETTERS */
              <motion.div
                key="word-daylight"
                className="inline-flex items-center justify-center whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {dayLetters.map((char, index) => (
                  <motion.span
                    key={`day-${char}-${index}`}
                    className="inline-block relative transition-transform duration-300 hover:-translate-y-1"
                    initial={{ y: 50, rotateX: -65, opacity: 0, filter: "blur(4px)" }}
                    animate={{
                      y: 0,
                      rotateX: 0,
                      opacity: 1,
                      filter: "blur(0px)",
                      transition: {
                        duration: 0.55,
                        delay: index * 0.035,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                    exit={{
                      y: -50,
                      rotateX: 65,
                      opacity: 0,
                      filter: "blur(4px)",
                      transition: {
                        duration: 0.35,
                        delay: index * 0.02,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                    style={{
                      transformStyle: "preserve-3d",
                      textShadow: isHovered
                        ? "0 0 30px rgba(212, 175, 55, 0.4), 0 0 8px rgba(212, 175, 55, 0.2)"
                        : "0 2px 20px rgba(212, 175, 55, 0.12)",
                    }}
                  >
                    {/* Haute Couture Solar Gradient */}
                    <span className="bg-gradient-to-b from-[#111111] via-[#333333] to-[#8C8C94] dark:from-[#FFFFFF] dark:via-[#F5F5F0] dark:to-[#A3A3A3] bg-clip-text text-transparent">
                      {char}
                    </span>
                  </motion.span>
                ))}
              </motion.div>
            ) : (
              /* NIGHTFALL LETTERS */
              <motion.div
                key="word-nightfall"
                className="inline-flex items-center justify-center whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {nightLetters.map((char, index) => (
                  <motion.span
                    key={`night-${char}-${index}`}
                    className="inline-block relative transition-transform duration-300 hover:-translate-y-1"
                    initial={{ y: -50, rotateX: 65, opacity: 0, filter: "blur(4px)" }}
                    animate={{
                      y: 0,
                      rotateX: 0,
                      opacity: 1,
                      filter: "blur(0px)",
                      transition: {
                        duration: 0.55,
                        delay: index * 0.035,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                    exit={{
                      y: 50,
                      rotateX: -65,
                      opacity: 0,
                      filter: "blur(4px)",
                      transition: {
                        duration: 0.35,
                        delay: index * 0.02,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                    style={{
                      transformStyle: "preserve-3d",
                      textShadow: isHovered
                        ? "0 0 35px rgba(129, 140, 248, 0.55), 0 0 12px rgba(168, 85, 247, 0.35)"
                        : "0 0 25px rgba(99, 102, 241, 0.3)",
                    }}
                  >
                    {/* Haute Couture Moonlit Silver & Electric Indigo Gradient */}
                    <span className="bg-gradient-to-b from-[#FFFFFF] via-[#E0E7FF] to-[#818CF8] bg-clip-text text-transparent">
                      {char}
                    </span>
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Liquid Light Specular Beam Sweep across the letters */}
          <motion.div
            key={mode}
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            initial={{ x: "-130%" }}
            animate={{ x: "130%" }}
            transition={{
              repeat: Infinity,
              repeatDelay: 4.5,
              duration: 2.2,
              ease: "easeInOut",
            }}
            style={{
              background: isNight
                ? "linear-gradient(105deg, transparent 25%, rgba(199, 210, 254, 0.7) 50%, transparent 75%)"
                : "linear-gradient(105deg, transparent 25%, rgba(254, 243, 199, 0.8) 50%, transparent 75%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
