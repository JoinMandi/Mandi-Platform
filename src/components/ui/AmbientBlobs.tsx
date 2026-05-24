"use client";

import { motion } from "framer-motion";

interface AmbientBlobsProps {
  intensity?: "soft" | "full";
  className?: string;
}

/**
 * Drifting warm gradient blobs — a decorative backdrop. Purely ambient: if the
 * motion stalls, a static blurred glow remains and no meaning is lost.
 */
export default function AmbientBlobs({
  intensity = "full",
  className = "",
}: AmbientBlobsProps) {
  const op = intensity === "soft" ? { a: 0.3, b: 0.26 } : { a: 0.6, b: 0.55 };
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <motion.div
        animate={{ y: [-12, 12, -12], x: [-8, 8, -8] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-10 top-10 h-80 w-80 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #F2C14E 0%, transparent 70%)",
          opacity: op.a,
        }}
      />
      <motion.div
        animate={{ y: [10, -14, 10], x: [6, -10, 6] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-16 h-96 w-96 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #E66C84 0%, transparent 70%)",
          opacity: op.b,
        }}
      />
    </div>
  );
}
