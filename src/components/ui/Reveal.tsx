"use client";

import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

/**
 * Scroll-reveal wrapper — progressive enhancement.
 *
 * Content is fully visible by default (SSR / no-JS / reduced-motion all show it).
 * Only on a capable client does it arm a hidden state, then reveal on scroll via
 * IntersectionObserver. A hard timeout force-reveals if the observer never fires.
 *
 * The reveal is a CSS *transition*, never a keyframe: the revealed (resting) state
 * is plain `opacity:1` / no transform — defined by the ABSENCE of the hidden
 * classes. So content can never be trapped by a stalled/frozen animation; the
 * worst case is the transition not playing, and the element is still visible.
 */

type RevealVariant = "rise" | "fade" | "stitch";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  /** Stagger delay in ms — callers pass e.g. Math.min(i, 6) * 70. */
  delay?: number;
  variant?: RevealVariant;
  className?: string;
}

const HIDDEN: Record<RevealVariant, string> = {
  rise: "opacity-0 translate-y-6",
  fade: "opacity-0",
  stitch: "opacity-0 scale-90",
};

const TRANSITION = "transition-[opacity,transform] duration-700 ease-out";

// useLayoutEffect warns + no-ops on the server — fall back to useEffect there.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Reveal({
  children,
  as = "div",
  delay = 0,
  variant = "rise",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  // Arm the hidden state before the first client paint — but only where motion
  // is wanted and observable. Otherwise content simply stays visible.
  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;
    setArmed(true);
  }, []);

  useEffect(() => {
    if (!armed) return;
    const el = ref.current;
    if (!el) {
      setShown(true);
      return;
    }
    // Above-the-fold content reveals at once — no scroll needed.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    // Hard fallback — content is never hidden longer than this.
    const timer = window.setTimeout(() => setShown(true), 900);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [armed]);

  const classes = [className];
  // Hidden: no transition class → the arm step jumps instantly (no fade-out).
  if (armed && !shown) classes.push(HIDDEN[variant]);
  // Shown: transition class present + hidden classes gone → animates to the
  // plain resting state (opacity:1, no transform).
  else if (armed && shown) classes.push(TRANSITION);

  return createElement(
    as,
    {
      ref,
      className: classes.filter(Boolean).join(" "),
      style: armed && shown && delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children,
  );
}
