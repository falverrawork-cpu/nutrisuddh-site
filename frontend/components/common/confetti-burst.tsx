"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

const PARTICLES = [
  { x: -220, y: -180, color: "#0B6E4F" },
  { x: -180, y: -120, color: "#F4D35E" },
  { x: -140, y: -210, color: "#EE964B" },
  { x: -90, y: -150, color: "#0B6E4F" },
  { x: -40, y: -230, color: "#F4D35E" },
  { x: 40, y: -210, color: "#EE964B" },
  { x: 90, y: -150, color: "#0B6E4F" },
  { x: 140, y: -220, color: "#F4D35E" },
  { x: 180, y: -130, color: "#EE964B" },
  { x: 220, y: -180, color: "#0B6E4F" },
  { x: -120, y: -80, color: "#F4D35E" },
  { x: 120, y: -90, color: "#EE964B" }
];

export function ConfettiBurst({ show, onDone }: { show: boolean; onDone: () => void }) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onDone, 1200);
    return () => clearTimeout(timer);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-[95]">
          {PARTICLES.map((particle, index) => (
            <motion.span
              key={index}
              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
              style={{ backgroundColor: particle.color }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
              animate={{ x: particle.x, y: particle.y, opacity: [1, 1, 0], scale: [1, 1, 0.6], rotate: 180 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut", delay: index * 0.02 }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
