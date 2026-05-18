"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface CountUpProps {
  to: number;
  durationMs?: number;
  className?: string;
}

export default function CountUp({ to, durationMs = 1500, className }: CountUpProps) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, {
    stiffness: 60,
    damping: 22,
    duration: durationMs / 1000,
  });
  const rounded = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    mv.set(to);
  }, [mv, to]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
