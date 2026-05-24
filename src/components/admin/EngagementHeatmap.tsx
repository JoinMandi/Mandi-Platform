"use client";

import type { SymptomLogRow, SymptomDomain } from "@/lib/types/database";

interface EngagementHeatmapProps {
  /** Most-recent-first list of logs for one user (last 30 days). */
  logs: SymptomLogRow[];
  days?: number;
}

const DOMAIN_ORDER: SymptomDomain[] = [
  "mind-cognition",
  "mood",
  "nervous-system",
  "body",
  "urogenital",
  "other",
  "quality-of-life",
];

const DOMAIN_LABEL: Record<SymptomDomain, string> = {
  "mind-cognition": "Mind",
  mood: "Mood",
  "nervous-system": "Nerves",
  body: "Body",
  urogenital: "Cycle",
  other: "Other",
  "quality-of-life": "Life",
};

/** A compact 30-day × 7-domain symptom log heatmap. */
export default function EngagementHeatmap({
  logs,
  days = 30,
}: EngagementHeatmapProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayStrings = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    return d.toISOString().slice(0, 10);
  });

  // Index logs by (date, domain) for O(1) lookup.
  const idx = new Map<string, number>();
  for (const l of logs) {
    if (!l.logged_date || !l.domain || l.score === null) continue;
    idx.set(`${l.logged_date}|${l.domain}`, l.score);
  }

  const cellColor = (score: number | undefined) => {
    if (score === undefined) return "bg-cream-deep/40";
    if (score === 0) return "bg-cream-deep/70";
    if (score === 1) return "bg-golden/55";
    if (score === 2) return "bg-coral";
    return "bg-terra";
  };

  return (
    <div className="overflow-x-auto">
      <table className="text-xs">
        <thead>
          <tr>
            <th className="text-left pr-3 pb-2 text-brown/55 font-semibold">&nbsp;</th>
            {dayStrings.map((d, i) => {
              const date = new Date(d);
              const show = i % 5 === 0 || i === dayStrings.length - 1;
              return (
                <th
                  key={d}
                  className="text-center pb-2 px-[1px] text-brown/45 font-semibold"
                  style={{ minWidth: 10 }}
                >
                  {show ? date.getDate() : ""}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {DOMAIN_ORDER.map((domain) => (
            <tr key={domain}>
              <td className="pr-3 py-0.5 text-brown/80 font-medium whitespace-nowrap">
                {DOMAIN_LABEL[domain]}
              </td>
              {dayStrings.map((d) => {
                const score = idx.get(`${d}|${domain}`);
                return (
                  <td key={d} className="p-[1px]">
                    <div
                      title={score !== undefined ? `${d}: ${score}` : d}
                      className={`h-3 w-3 rounded-sm ${cellColor(score)}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-brown/55">
        <span>Less</span>
        <span className="h-3 w-3 rounded-sm bg-cream-deep/40" />
        <span className="h-3 w-3 rounded-sm bg-cream-deep/70" />
        <span className="h-3 w-3 rounded-sm bg-golden/55" />
        <span className="h-3 w-3 rounded-sm bg-coral" />
        <span className="h-3 w-3 rounded-sm bg-terra" />
        <span>More</span>
      </div>
    </div>
  );
}
