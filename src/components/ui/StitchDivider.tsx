interface StitchDividerProps {
  tone?: "ink" | "gold" | "cream";
  className?: string;
}

const STROKE: Record<NonNullable<StitchDividerProps["tone"]>, string> = {
  ink: "rgba(44,24,16,0.45)",
  gold: "#F2C14E",
  cream: "rgba(253,246,236,0.55)",
};

/** A dashed running-stitch divider — echoes the quilt patch seam. Static, decorative. */
export default function StitchDivider({ tone = "ink", className = "" }: StitchDividerProps) {
  return (
    <svg
      aria-hidden
      width="100%"
      height="8"
      className={`block ${className}`}
    >
      <line
        x1="0"
        y1="4"
        x2="100%"
        y2="4"
        stroke={STROKE[tone]}
        strokeWidth="2.4"
        strokeDasharray="6 5"
        strokeLinecap="round"
      />
    </svg>
  );
}
