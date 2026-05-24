"use client";

interface FunnelStep {
  label: string;
  count: number;
}

interface FunnelBarProps {
  steps: FunnelStep[];
  /** Optional baseline; defaults to the first step's count for % calculation. */
  baseline?: number;
}

const COLORS = ["bg-terra", "bg-coral", "bg-golden", "bg-sun"];

/** Horizontal funnel — each step is a stacked bar with absolute count + %.
 *  No keyframes: widths are inline `style` so it can't get stuck mid-render. */
export default function FunnelBar({ steps, baseline }: FunnelBarProps) {
  const base = baseline ?? steps[0]?.count ?? 0;
  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const pct = base > 0 ? Math.round((s.count / base) * 100) : 0;
        const width = base > 0 ? Math.max((s.count / base) * 100, 4) : 4;
        return (
          <div key={s.label}>
            <div className="flex items-baseline justify-between mb-1 text-sm">
              <span className="font-semibold text-brown">{s.label}</span>
              <span className="text-brown/65">
                <span className="font-bold text-brown">{s.count.toLocaleString()}</span>
                <span className="text-xs ml-2">{pct}%</span>
              </span>
            </div>
            <div className="h-3 rounded-full bg-cream-deep/40 overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${COLORS[i % COLORS.length]}`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
