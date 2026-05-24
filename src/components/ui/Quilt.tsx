import React from "react";
import { QUILT_COLS, type QuiltPatch, type Weave } from "@/lib/domain/quilt";

interface QuiltProps {
  patches: QuiltPatch[];
  /** Number of patches stitched in (= questions answered). */
  answered: number;
  variant?: "compact" | "full";
  /** domainIndex of a band to highlight (used on domain transitions). */
  highlightDomain?: number;
  /** Staggered cascade reveal — used on the completion screen. */
  reveal?: boolean;
  className?: string;
}

// ── Fabric weaves ──────────────────────────────────────────────
// Every weave is drawn as a bold low-count motif grid (2×2 or 3×3) so the
// print still reads at a ~38px patch. Motifs sit inset within their cell, so
// nothing overflows the patch's rounded corners — no SVG clip needed.

/** Inset fraction of a cell — keeps corner motifs clear of the rounded edge. */
const PAD = 0.12;

function shweshwe(
  g: string,
  k: string,
  variant: number,
  x0: number,
  y0: number,
  cell: number,
  r: number,
  c: number,
): React.ReactNode[] {
  const cx = x0 + cell / 2;
  const cy = y0 + cell / 2;
  const rd = cell * 0.38;
  const filled = (r + c) % 2 === variant % 2;
  return [
    <polygon
      key="d"
      points={`${cx},${cy - rd} ${cx + rd},${cy} ${cx},${cy + rd} ${cx - rd},${cy}`}
      fill={filled ? k : "none"}
      stroke={k}
      strokeWidth={cell * 0.1}
      strokeLinejoin="round"
    />,
    <circle key="c" cx={cx} cy={cy} r={cell * 0.12} fill={filled ? g : k} />,
  ];
}

function floral(
  g: string,
  k: string,
  _variant: number,
  x0: number,
  y0: number,
  cell: number,
): React.ReactNode[] {
  const cx = x0 + cell / 2;
  const cy = y0 + cell / 2;
  const off = cell * 0.21;
  const petals = [0, 1, 2, 3, 4].map((p) => (
    <g key={`p${p}`} transform={`rotate(${p * 72} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy - off} rx={cell * 0.1} ry={cell * 0.2} fill={k} />
    </g>
  ));
  return [
    ...petals,
    <circle
      key="eye"
      cx={cx}
      cy={cy}
      r={cell * 0.105}
      fill={g}
      stroke={k}
      strokeWidth={cell * 0.045}
    />,
  ];
}

function geometric(
  g: string,
  k: string,
  variant: number,
  x0: number,
  y0: number,
  cell: number,
  r: number,
  c: number,
): React.ReactNode[] {
  const pad = cell * PAD;
  const cx = x0 + cell / 2;
  const lft = x0 + pad;
  const rgt = x0 + cell - pad;
  const top = y0 + pad;
  const bot = y0 + cell - pad;
  const up = (r + c) % 2 === variant % 2;
  const verts: [number, number][] = up
    ? [
        [lft, bot],
        [cx, top],
        [rgt, bot],
      ]
    : [
        [lft, top],
        [cx, bot],
        [rgt, top],
      ];
  const gx = (verts[0][0] + verts[1][0] + verts[2][0]) / 3;
  const gy = (verts[0][1] + verts[1][1] + verts[2][1]) / 3;
  const toPts = (k2: number) =>
    verts.map(([x, y]) => `${gx + (x - gx) * k2},${gy + (y - gy) * k2}`).join(" ");
  return [
    <polygon key="big" points={toPts(1)} fill={k} />,
    <polygon key="inner" points={toPts(0.44)} fill={g} />,
  ];
}

function lace(
  _g: string,
  k: string,
  _variant: number,
  x0: number,
  y0: number,
  cell: number,
): React.ReactNode[] {
  const cx = x0 + cell / 2;
  const cy = y0 + cell / 2;
  const rr = cell * 0.3;
  // Round trig-derived coords to 3dp so server + client serialise identically
  // (otherwise React fires a hydration warning on the last decimal digit).
  const r3 = (n: number) => Math.round(n * 1000) / 1000;
  const dots = [0, 1, 2, 3, 4, 5].map((d) => {
    const a = (d / 6) * Math.PI * 2;
    return (
      <circle
        key={`o${d}`}
        cx={r3(cx + Math.cos(a) * (rr + cell * 0.07))}
        cy={r3(cy + Math.sin(a) * (rr + cell * 0.07))}
        r={r3(cell * 0.05)}
        fill={k}
      />
    );
  });
  return [
    <circle
      key="ring"
      cx={cx}
      cy={cy}
      r={rr}
      fill="none"
      stroke={k}
      strokeWidth={cell * 0.08}
    />,
    ...dots,
    <circle key="eye" cx={cx} cy={cy} r={cell * 0.06} fill={k} />,
  ];
}

function woven(
  _g: string,
  k: string,
  _variant: number,
  x0: number,
  y0: number,
  cell: number,
  r: number,
  c: number,
): React.ReactNode[] {
  // The quiet weave — a faint 2-tone basket check, near-solid at a glance.
  return [
    <rect
      key="w"
      x={x0 + cell * 0.14}
      y={y0 + cell * 0.14}
      width={cell * 0.72}
      height={cell * 0.72}
      rx={cell * 0.06}
      fill={k}
      opacity={(r + c) % 2 === 0 ? 0.17 : 0.07}
    />,
  ];
}

const WEAVES: Record<
  Weave,
  (
    g: string,
    k: string,
    v: number,
    x0: number,
    y0: number,
    cell: number,
    r: number,
    c: number,
  ) => React.ReactNode[]
> = { shweshwe, floral, geometric, lace, woven };

/** The generative fabric print, drawn into the 0–100 patch viewBox. */
function FabricSwatch({ patch }: { patch: QuiltPatch }) {
  const { weave, ground, ink, variant, scale } = patch;
  const cell = 94 / scale;
  const draw = WEAVES[weave];
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < scale; r++) {
    for (let c = 0; c < scale; c++) {
      const x0 = 3 + c * cell;
      const y0 = 3 + r * cell;
      cells.push(
        <g key={`${r}-${c}`}>{draw(ground, ink, variant, x0, y0, cell, r, c)}</g>,
      );
    }
  }
  return <g transform={`rotate(${variant * 90} 50 50)`}>{cells}</g>;
}

function PatchCell({
  patch,
  stitched,
  highlighted,
  reveal,
}: {
  patch: QuiltPatch;
  stitched: boolean;
  highlighted: boolean;
  reveal: boolean;
}) {
  // A square viewBox + width:100% + height:auto makes the patch size itself.
  const svgClass = "block h-auto w-full";

  if (!stitched) {
    return (
      <svg viewBox="0 0 100 100" className={svgClass} aria-hidden>
        <rect x={4} y={4} width={92} height={92} rx={9} fill="#EEE0C8" />
        {/* a faint ghost of the fabric to come */}
        <g opacity={0.13}>
          <FabricSwatch patch={patch} />
        </g>
        <rect
          x={4}
          y={4}
          width={92}
          height={92}
          rx={9}
          fill="none"
          stroke="rgba(44,24,16,0.34)"
          strokeWidth={3}
          strokeDasharray="7 5"
        />
        {highlighted && (
          <rect
            x={1.5}
            y={1.5}
            width={97}
            height={97}
            rx={10}
            fill="none"
            stroke="#C94A2B"
            strokeWidth={3.5}
          />
        )}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${svgClass} animate-stitch-in ${patch.isGolden ? "animate-patch-shimmer" : ""}`}
      style={reveal ? { animationDelay: `${patch.index * 16}ms` } : undefined}
      aria-hidden
    >
      <rect x={3} y={3} width={94} height={94} rx={9} fill={patch.ground} />
      <FabricSwatch patch={patch} />
      {/* fabric edge */}
      <rect
        x={3}
        y={3}
        width={94}
        height={94}
        rx={9}
        fill="none"
        stroke="rgba(44,24,16,0.3)"
        strokeWidth={2}
      />
      {/* hand-sewn running stitch */}
      <rect
        x={9}
        y={9}
        width={82}
        height={82}
        rx={6}
        fill="none"
        stroke="rgba(44,24,16,0.5)"
        strokeWidth={2.4}
        strokeDasharray="5.5 4.5"
        strokeLinecap="round"
      />
      {highlighted && (
        <rect
          x={1.5}
          y={1.5}
          width={97}
          height={97}
          rx={10}
          fill="none"
          stroke="#2C1810"
          strokeWidth={4}
        />
      )}
      {patch.isGolden && <circle cx={50} cy={50} r={7} fill="#FFF6DC" opacity={0.95} />}
    </svg>
  );
}

export default function Quilt({
  patches,
  answered,
  variant = "compact",
  highlightDomain,
  reveal = false,
  className = "",
}: QuiltProps) {
  const gap = variant === "compact" ? "gap-1" : "gap-1.5";
  const max = variant === "compact" ? "max-w-[304px]" : "max-w-[440px]";
  return (
    <div
      className={`grid ${gap} ${max} w-full ${className}`}
      style={{ gridTemplateColumns: `repeat(${QUILT_COLS}, minmax(0, 1fr))` }}
    >
      {patches.map((p) => (
        <PatchCell
          key={p.index}
          patch={p}
          stitched={p.index < answered}
          highlighted={highlightDomain !== undefined && p.domainIndex === highlightDomain}
          reveal={reveal}
        />
      ))}
    </div>
  );
}
