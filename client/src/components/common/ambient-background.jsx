import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AmbientBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Interactive Cursor Light Halo */}
      <motion.div
        className="hidden md:block absolute w-[450px] h-[450px] rounded-full bg-moonstone/12 blur-[130px] -translate-x-1/2 -translate-y-1/2"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={{
          type: "spring",
          damping: 35,
          stiffness: 150,
          mass: 0.5,
        }}
      />

      {/* Floating Ambient Mesh Orbs */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.12, 0.22, 0.15, 0.12],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-moonstone/20 blur-[160px]"
      />

      <motion.div
        animate={{
          x: [0, -90, 50, 0],
          y: [0, 80, -50, 0],
          scale: [1, 1.15, 0.95, 1],
          opacity: [0.08, 0.16, 0.08, 0.08],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-champagne/15 blur-[160px]"
      />

      <motion.div
        animate={{
          x: [0, 50, -60, 0],
          y: [0, -40, 50, 0],
          opacity: [0.06, 0.15, 0.06],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full bg-moonstone/15 blur-[150px]"
      />

      {/* Subtle Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none" />
    </div>
  );
}
