import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) =>
      setPos({ x: e.clientX, y: e.clientY });

    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <motion.div
      className="fixed z-[9999] pointer-events-none mix-blend-difference"
      animate={{ x: pos.x - 8, y: pos.y - 8 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <span className="text-white font-mono text-xs">&lt;/&gt;</span>
    </motion.div>
  );
}