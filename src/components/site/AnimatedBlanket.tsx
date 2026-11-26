"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The animated Mandi blanket from Evelien's "turning golden" board.
 * 56 patches; half of the affected patches turn golden over ~10 seconds while
 * the MenoScore drops from 64 to 44. Pure client-side, loops forever.
 */

const MOTIFS: ((ink: string) => string)[] = [
  (k) =>
    `<path d="M11 3l8 8-8 8-8-8z" fill="${k}"/><path d="M29 4l7 7-7 7-7-7z" fill="none" stroke="${k}" stroke-width="2"/><circle cx="29" cy="11" r="2.2" fill="${k}"/><path d="M11 22l7 7-7 7-7-7z" fill="none" stroke="${k}" stroke-width="2"/><circle cx="11" cy="29" r="2.2" fill="${k}"/><path d="M29 21l8 8-8 8-8-8z" fill="${k}"/>`,
  (k) =>
    `<path d="M5 5l11 6-11 6z M35 5l-11 6 11 6z M5 23l11 6-11 6z M35 23l-11 6 11 6z" fill="none" stroke="${k}" stroke-width="2.4" stroke-linejoin="round"/>`,
  (k) => {
    let s = "";
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        const x = 7 + c * 13;
        const y = 7 + r * 13;
        s +=
          (r + c) % 2 === 0
            ? `M${x - 5} ${y + 4}L${x} ${y - 5}L${x + 5} ${y + 4}Z `
            : `M${x - 5} ${y - 4}L${x} ${y + 5}L${x + 5} ${y - 4}Z `;
      }
    return `<path d="${s}" fill="none" stroke="${k}" stroke-width="1.8" stroke-linejoin="round"/>`;
  },
  (k) => {
    let s = "";
    [
      [11, 11],
      [29, 11],
      [11, 29],
      [29, 29],
    ].forEach(([x, y]) => {
      for (let a = 0; a < 5; a++) {
        const t = (a * 72 * Math.PI) / 180 - Math.PI / 2;
        const px = (x + Math.cos(t) * 4.2).toFixed(1);
        const py = (y + Math.sin(t) * 4.2).toFixed(1);
        s += `<ellipse cx="${px}" cy="${py}" rx="2.2" ry="3.6" transform="rotate(${a * 72} ${px} ${py})" fill="${k}"/>`;
      }
    });
    return s;
  },
  (k) => {
    let s = "";
    [
      [11, 11],
      [29, 11],
      [11, 29],
      [29, 29],
    ].forEach(([x, y]) => {
      s += `<circle cx="${x}" cy="${y}" r="3.6" fill="none" stroke="${k}" stroke-width="1.8"/><circle cx="${x}" cy="${y}" r="1.2" fill="${k}"/>`;
      for (let a = 0; a < 8; a++) {
        const t = (a * Math.PI) / 4;
        s += `<circle cx="${(x + Math.cos(t) * 6.7).toFixed(1)}" cy="${(y + Math.sin(t) * 6.7).toFixed(1)}" r="1.1" fill="${k}"/>`;
      }
    });
    return s;
  },
  (k) =>
    `<rect x="3" y="3" width="10" height="10" rx="1.5" fill="${k}" opacity=".3"/><rect x="27" y="3" width="10" height="10" rx="1.5" fill="${k}" opacity=".3"/><rect x="15" y="15" width="10" height="10" rx="1.5" fill="${k}" opacity=".38"/><rect x="3" y="27" width="10" height="10" rx="1.5" fill="${k}" opacity=".3"/><rect x="27" y="27" width="10" height="10" rx="1.5" fill="${k}" opacity=".3"/>`,
];

const LEVELS = [
  [
    ["#F8EEE2", "#C94A2B"],
    ["#EFE6DC", "#A8968A"],
    ["#F6E8D2", "#B8431F"],
  ],
  [
    ["#F3DEC6", "#9E3A26"],
    ["#F5E3CB", "#2C1810"],
    ["#F2D5C2", "#B8431F"],
  ],
  [
    ["#E2805C", "#FFFFFF"],
    ["#E3974A", "#FFFFFF"],
    ["#D9728A", "#FFFFFF"],
    ["#EC9264", "#FFFFFF"],
  ],
  [
    ["#B8472E", "#FFFFFF"],
    ["#C9562F", "#FFFFFF"],
    ["#9C3A27", "#FFFFFF"],
    ["#A8402B", "#FFFFFF"],
  ],
] as const;

const BRIGHT = [
  ["#FFD66B", "#673C33"],
  ["#FFAA4F", "#FFFFFF"],
  ["#FFC94F", "#673C33"],
  ["#F7A267", "#FFFFFF"],
  ["#FFE58A", "#B8431F"],
] as const;

function texture(svg: string) {
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${svg}</svg>`,
  )
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
  return `url("data:image/svg+xml,${encoded}") center/86% 86% no-repeat`;
}

const level = (i: number) => {
  const h = (i * 37 + 11) % 17;
  return h < 4 ? 0 : h < 8 ? 1 : h < 13 ? 2 : 3;
};
const motif = (i: number) =>
  level(i) === 0 && i % 2 === 0 ? 5 : (i * 7 + Math.floor(i / 5)) % 5;
const rotation = (i: number) => (((i * 13) % 7) - 3) * 0.5;

const ORDER = Array.from({ length: 56 }, (_, i) => i)
  .filter((i) => level(i) >= 1)
  .sort((a, b) => ((a * 29) % 56) - ((b * 29) % 56));
const GOLD_COUNT = Math.round(ORDER.length * 0.5);
const REST = ORDER.slice(GOLD_COUNT).filter((_, n) => n % 3 !== 2);
const TOTAL = 12 + GOLD_COUNT + REST.length + 26;

export default function AnimatedBlanket({
  animate = true,
}: {
  animate?: boolean;
}) {
  const [tick, setTick] = useState(0);
  const [cell, setCell] = useState(40);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 130);
    return () => window.clearInterval(id);
  }, [animate]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const width = el.clientWidth;
      const gap = Math.max(3, Math.round(40 / 8));
      const pad = Math.round(40 * 0.42);
      const next = Math.floor((width - 2 * pad - 7 * gap) / 8);
      setCell(Math.max(22, Math.min(40, next || 40)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const gap = Math.max(3, Math.round(cell / 8));
  const pad = Math.round(cell * 0.42);
  const t = animate ? tick % TOTAL : TOTAL - 1;
  const k = t - 12;
  const goldCount = Math.max(0, Math.min(GOLD_COUNT, k));
  const lightCount = Math.max(0, Math.min(REST.length, k - GOLD_COUNT));
  const goldSet = new Set(ORDER.slice(0, goldCount));
  const lightSet = new Set(REST.slice(0, lightCount));
  const sequence = ORDER.slice(0, GOLD_COUNT).concat(REST);
  const done = goldCount + lightCount;
  const newest = done > 0 && done < sequence.length ? sequence[done - 1] : -1;
  const width = 8 * cell + 7 * gap + 2 * pad;
  const fraction = done / sequence.length;

  const patches = Array.from({ length: 56 }, (_, i) => {
    let background: string;
    let outline: string;
    let glow: string;

    if (goldSet.has(i)) {
      background =
        texture(MOTIFS[motif(i)]("#9A4A12")) +
        ", linear-gradient(135deg,#FCE79A,#F2C14E 55%,#E2A72E)";
      outline = "rgba(154,74,18,.5)";
      glow = "0 0 0 1.5px #E9B13A, 0 0 10px rgba(242,193,78,.8)";
    } else if (lightSet.has(i)) {
      const palette = BRIGHT[(i * 3 + Math.floor(i / 4)) % BRIGHT.length];
      background = `${texture(MOTIFS[motif(i)](palette[1]))}, ${palette[0]}`;
      outline = "rgba(255,255,255,.8)";
      glow = "0 2px 8px rgba(255,170,79,.45)";
    } else {
      const palette =
        LEVELS[level(i)][(i * 3 + Math.floor(i / 4)) % LEVELS[level(i)].length];
      background = `${texture(MOTIFS[motif(i)](palette[1]))}, ${palette[0]}`;
      outline =
        level(i) >= 2 ? "rgba(255,255,255,.75)" : "rgba(120,70,40,.35)";
      glow =
        level(i) >= 2
          ? "0 1px 2px rgba(80,40,20,.18)"
          : "0 1px 2px rgba(80,40,20,.18)";
    }

    return {
      height: cell,
      borderRadius: Math.round(cell / 6),
      background,
      outline: `1px dashed ${outline}`,
      outlineOffset: -3,
      boxShadow: glow,
      transform: `rotate(${rotation(i)}deg) scale(${i === newest ? 1.14 : 1})`,
      transition: "transform .35s ease, box-shadow .35s ease",
    };
  });

  return (
    <div
      ref={root}
      className="flex w-full max-w-[400px] flex-col gap-3 font-sans"
    >
      <div
        className="flex items-center justify-between gap-3"
        style={{ width }}
      >
        <span
          className="rounded-full px-3.5 py-[7px] text-[13px] font-bold text-brown"
          style={{ background: k <= 0 ? "#FFFFFF" : "#FCE79A" }}
        >
          {k <= 0 ? "Her first blanket" : "Four months later"}
        </span>
        <span className="text-[13px] font-bold text-brown-warm">
          MenoScore{" "}
          <span className="text-xl font-extrabold text-brown">
            {Math.round(64 - 20 * fraction)}
          </span>
        </span>
      </div>

      <div
        role="img"
        aria-label="A Mandi blanket of 56 hand-sewn patches. As her symptoms improve, patches turn golden."
        className="grid"
        style={{
          width,
          gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
          gap,
          padding: pad,
          background: "#FFFBF3",
          borderRadius: Math.round(cell * 0.6),
          boxShadow: "0 18px 44px rgba(140,60,30,.22)",
        }}
      >
        {patches.map((style, i) => (
          <div key={i} aria-hidden style={style} />
        ))}
      </div>
    </div>
  );
}
