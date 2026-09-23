import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, ShieldAlert, Terminal } from "lucide-react";

export default function SiteLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING DAYLIGHT CORE...");
  const [isVisible, setIsVisible] = useState(true);

  const statuses = [
    "INITIALIZING DAYLIGHT CORE...",
    "CALIBRATING 480 GSM FRENCH TERRY...",
    "APPLYING ACID WASH ALGORITHMS...",
    "INDEXING SS26 ARCHIVE...",
    "ESTABLISHING SECURE PROTOCOLS...",
    "DAYLIGHT READY // ENTER THE DROP",
  ];

  useEffect(() => {
    // Progress counter animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
          }, 350);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 8) + 4;
        return next > 100 ? 100 : next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const statusIndex = Math.min(
      Math.floor((progress / 100) * statuses.length),
      statuses.length - 1
    );
    setStatusText(statuses[statusIndex]);
  }, [progress]);

  const handleSkip = () => {
    setProgress(100);
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="site-loader"
          initial={{ opacity: 1 }}
          exit={{
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[9999] flex flex-col justify-between bg-gunmetal-deep text-champagne p-6 sm:p-12 overflow-hidden select-none"
        >
          {/* Background Grid & Ambient Glow */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#7EACB50A_1px,transparent_1px),linear-gradient(to_bottom,#7EACB50A_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
          
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-moonstone/25 blur-[120px] pointer-events-none"
          />

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between font-mono text-xs text-champagne/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-moonstone animate-ping" />
              <span className="text-moonstone font-bold tracking-widest">
                [ DAYLIGHT // SYSTEM BOOT ]
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-block text-champagne/40">
                LOC: 34.0522° N // LOS ANGELES
              </span>
              <button
                onClick={handleSkip}
                className="px-3 py-1 bg-gunmetal-card border border-gunmetal-border hover:border-moonstone text-champagne/80 hover:text-moonstone font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer rounded"
              >
                SKIP INTRO [ESC]
              </button>
            </div>
          </div>

          {/* Center Brand & Staggered Reveal */}
          <div className="relative z-10 my-auto text-center space-y-6 max-w-4xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              <span className="font-mono text-[11px] sm:text-xs text-moonstone/80 tracking-[0.3em] uppercase block mb-3">
                // SS26 ARCHIVE • DISTRESSED BY DESIGN
              </span>

              {/* Kinetic Letter Stagger */}
              <div className="overflow-hidden py-2">
                <div className="flex items-center justify-center gap-1 sm:gap-3">
                  {"DAYLIGHT".split("").map((letter, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: 80, opacity: 0, rotate: -8 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.1 + i * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="font-literature text-6xl sm:text-8xl md:text-9xl font-normal text-champagne tracking-widest inline-block hover:text-moonstone transition-colors duration-200"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Slogan */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-display text-lg sm:text-2xl text-moonstone tracking-widest uppercase font-bold"
            >
              WRECKAGE & REBIRTH
            </motion.p>
          </div>

          {/* Bottom Progress & Telemetry */}
          <div className="relative z-10 max-w-2xl mx-auto w-full space-y-3 font-mono">
            {/* Live Status Ticker */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-champagne/80 truncate">
                <Terminal className="w-3.5 h-3.5 text-moonstone animate-pulse shrink-0" />
                <span className="truncate">{statusText}</span>
              </div>
              <span className="font-bold text-moonstone shrink-0 ml-4">
                {progress}%
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-1.5 bg-gunmetal-subtle border border-gunmetal-border rounded-full overflow-hidden p-0.5 relative">
              <motion.div
                className="h-full bg-gradient-to-r from-moonstone-700 via-moonstone to-champagne rounded-full shadow-[0_0_14px_#7EACB5]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-champagne/40">
              <span>EDITION: LIMITED 200 PCS</span>
              <span className="tracking-widest">EST. 2026 // ALL RIGHTS RESERVED</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
