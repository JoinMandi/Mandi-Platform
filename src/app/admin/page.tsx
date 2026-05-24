"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCrmOverview, type CrmOverview } from "@/server/actions/admin-crm";
import SegmentChip from "@/components/admin/SegmentChip";
import FunnelBar from "@/components/admin/FunnelBar";
import { PERSONAS, SCORE_BANDS, LANGUAGE_CODES } from "@/lib/domain/crm";

const PERSONA_LABEL: Record<string, string> = {
  sally: "Searching Sally",
  olga: "Oblivious Olga",
  vicky: "Victim Vicky",
  nelly: "Know-it-all Nelly",
  nina: "Natural Nina",
  retha: "Regretting Retha",
  colleen: "Comorbid Colleen",
};
const PERSONA_ACCENT: Record<string, "terra" | "golden" | "coral" | "pink" | "sun" | "brown" | "cream"> = {
  sally: "coral",
  olga: "golden",
  vicky: "pink",
  nelly: "brown",
  nina: "sun",
  retha: "terra",
  colleen: "terra",
};
const BAND_LABEL: Record<string, string> = {
  mild: "Mild — early signals",
  moderate: "Moderate — active change",
  significant: "Significant — high impact",
};
const BAND_ACCENT: Record<string, "golden" | "coral" | "terra"> = {
  mild: "golden",
  moderate: "coral",
  significant: "terra",
};
const LANGUAGE_LABEL: Record<string, string> = {
  en: "English",
  zu: "isiZulu",
  xh: "isiXhosa",
  af: "Afrikaans",
};

export default function AdminDashboard() {
  const [data, setData] = useState<CrmOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setData(await fetchCrmOverview());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
        <p className="text-terra">Failed to load dashboard: {error}</p>
      </div>
    );
  }
  if (!data) {
    return <DashboardSkeleton />;
  }

  const conversion =
    data.funnel.signedUp > 0
      ? Math.round((data.funnel.answeredQuestionnaire / data.funnel.signedUp) * 100)
      : 0;

  return (
    <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">CRM</p>
        <h1 className="font-display text-4xl text-brown">Engagement</h1>
        <p className="text-brown/65 mt-2">
          Where Mandi&rsquo;s women are in the journey — segments, compliance, and recent activity.
        </p>
      </header>

      {/* Hero stats */}
      <section className="grid sm:grid-cols-3 gap-5 mb-12">
        <StatCard label="Signed up" value={data.funnel.signedUp} accent="border-terra" />
        <StatCard
          label="Conversion to questionnaire"
          value={`${conversion}%`}
          sub={`${data.funnel.answeredQuestionnaire.toLocaleString()} completed`}
          accent="border-golden"
        />
        <StatCard
          label="Completed 6-week check-in"
          value={data.compliance.sixWeekDone}
          sub={`of ${data.compliance.sixWeekDue} due (${Math.round(data.compliance.sixWeekRate * 100)}%)`}
          accent="border-coral"
        />
      </section>

      {/* Funnel */}
      <section className="bg-cream-soft rounded-3xl shadow-warm p-7 mb-8">
        <h2 className="font-display text-2xl text-brown mb-1">Journey funnel</h2>
        <p className="text-brown/60 text-sm mb-6">
          From signup to symptom tracking to her first check-in.
        </p>
        <FunnelBar
          steps={[
            { label: "Signed up", count: data.funnel.signedUp },
            { label: "Answered the 56-question screen", count: data.funnel.answeredQuestionnaire },
            { label: "Tracked symptoms at least once", count: data.funnel.trackedSymptoms },
            { label: "Completed the 6-week check-in", count: data.funnel.completedSixWeek },
          ]}
        />
      </section>

      {/* Segments grid */}
      <section className="grid lg:grid-cols-3 gap-6 mb-8">
        <SegmentGroup title="By persona">
          {PERSONAS.map((p) => (
            <SegmentChip
              key={p}
              label={PERSONA_LABEL[p] ?? p}
              count={data.byPersona[p]}
              accent={PERSONA_ACCENT[p]}
            />
          ))}
        </SegmentGroup>
        <SegmentGroup title="By score band">
          {SCORE_BANDS.map((b) => (
            <SegmentChip key={b} label={BAND_LABEL[b]} count={data.byBand[b]} accent={BAND_ACCENT[b]} />
          ))}
        </SegmentGroup>
        <SegmentGroup title="By language">
          {LANGUAGE_CODES.map((c) => (
            <SegmentChip
              key={c}
              label={LANGUAGE_LABEL[c] ?? c}
              count={data.byLanguage[c] ?? 0}
              accent="brown"
            />
          ))}
        </SegmentGroup>
      </section>

      {/* Compliance */}
      <section className="bg-cream-soft rounded-3xl shadow-warm p-7 mb-8">
        <h2 className="font-display text-2xl text-brown mb-1">Check-in compliance</h2>
        <p className="text-brown/60 text-sm mb-6">
          Of users past each milestone, how many actually checked in.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <ComplianceRing
            title="6-week check-in"
            done={data.compliance.sixWeekDone}
            due={data.compliance.sixWeekDue}
            rate={data.compliance.sixWeekRate}
          />
          <ComplianceRing
            title="3-month check-in"
            done={data.compliance.threeMonthDone}
            due={data.compliance.threeMonthDue}
            rate={data.compliance.threeMonthRate}
          />
        </div>
      </section>

      {/* Phase 20: "Most engaged this week" removed. Singling out
          individuals by behavioural metric on the dashboard is a POPIA
          concern; the funnel + segments + compliance rings above carry
          the same signal in aggregate. Per-user activity is still
          available via the `/admin/users/[id]` drill-down (audited per
          view since Phase 13). */}

      {/* Top engagement events (Half B — graceful empty state if table missing) */}
      <section className="bg-cream-soft rounded-3xl shadow-warm p-7 mb-8">
        <h2 className="font-display text-2xl text-brown mb-1">Top click-throughs (last 30 days)</h2>
        <p className="text-brown/60 text-sm mb-6">
          Tracked via <code className="text-xs">engagement_events</code>. Empty until the Phase-8
          migration is applied and a user clicks something.
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          <TopList
            title="Doctor bookings"
            items={data.topByEvent.doctor_book_click}
            emptyLabel="No booking clicks yet"
          />
          <TopList
            title="Content opens"
            items={data.topByEvent.content_link_click}
            emptyLabel="No content clicks yet"
          />
          <TopList
            title="Event RSVPs"
            items={data.topByEvent.event_rsvp_click}
            emptyLabel="No RSVP clicks yet"
          />
        </div>
      </section>

      {/* Footer link to legacy stats */}
      <p className="text-xs text-brown/45 italic mt-6">
        Need the moderation queue? Visit{" "}
        <Link href="/admin/stories" className="text-terra font-semibold">Stories</Link>,{" "}
        <Link href="/admin/events" className="text-terra font-semibold">Events</Link>, or{" "}
        <Link href="/admin/content" className="text-terra font-semibold">Content</Link>.
      </p>
    </div>
  );
}

// ── Small presentational pieces ──────────────────────────────────

/** Phase 13: perceived-perf skeleton while the CRM action is in flight.
 *  Mirrors the real layout (header + 3 stat cards + funnel + segment groups
 *  + compliance) so the page doesn't feel "stuck loading." */
function DashboardSkeleton() {
  return (
    <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto animate-pulse">
      <header className="mb-10">
        <div className="h-3 w-16 bg-cream-deep/60 rounded mb-3" />
        <div className="h-9 w-44 bg-cream-deep/70 rounded mb-2" />
        <div className="h-4 w-72 bg-cream-deep/40 rounded" />
      </header>
      <section className="grid sm:grid-cols-3 gap-5 mb-12">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-cream-soft rounded-3xl shadow-warm p-6 border-l-4 border-cream-deep h-32"
          >
            <div className="h-3 w-24 bg-cream-deep/60 rounded mb-4" />
            <div className="h-10 w-20 bg-cream-deep/70 rounded mb-3" />
            <div className="h-3 w-28 bg-cream-deep/40 rounded" />
          </div>
        ))}
      </section>
      <section className="bg-cream-soft rounded-3xl shadow-warm p-7 mb-8">
        <div className="h-6 w-40 bg-cream-deep/60 rounded mb-2" />
        <div className="h-3 w-56 bg-cream-deep/40 rounded mb-6" />
        <div className="space-y-3">
          {[0.95, 0.7, 0.45, 0.25].map((w, i) => (
            <div key={i} className="h-7 bg-cream-deep/40 rounded" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
      </section>
      <section className="grid lg:grid-cols-3 gap-6 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-cream-soft rounded-3xl shadow-warm p-6 h-56">
            <div className="h-3 w-20 bg-cream-deep/60 rounded mb-4" />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-6 w-16 bg-cream-deep/40 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}


function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className={`bg-cream-soft rounded-3xl shadow-warm p-6 border-l-4 ${accent}`}>
      <p className="text-[11px] uppercase tracking-[0.2em] text-brown/55 font-semibold mb-3">
        {label}
      </p>
      <p className="font-display text-4xl text-brown leading-none">{value}</p>
      {sub && <p className="text-xs text-brown/55 mt-3">{sub}</p>}
    </div>
  );
}

function SegmentGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-cream-soft rounded-3xl shadow-warm p-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-brown/55 font-semibold mb-4">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ComplianceRing({
  title,
  done,
  due,
  rate,
}: {
  title: string;
  done: number;
  due: number;
  rate: number;
}) {
  const pct = Math.round(rate * 100);
  const C = 2 * Math.PI * 36; // radius 36
  const dash = C * rate;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
        <circle cx={40} cy={40} r={36} fill="none" stroke="#EADFD1" strokeWidth={8} />
        <circle
          cx={40}
          cy={40}
          r={36}
          fill="none"
          stroke="#C94A2B"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
        />
      </svg>
      <div>
        <p className="font-display text-3xl text-brown leading-none">{pct}%</p>
        <p className="text-sm text-brown/60 mt-1">
          {done} of {due} {title.toLowerCase()}
        </p>
      </div>
    </div>
  );
}

function TopList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: { targetId: string; count: number }[] | undefined;
  emptyLabel: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-brown/55 font-semibold mb-3">
        {title}
      </p>
      {!items || items.length === 0 ? (
        <p className="text-brown/45 text-xs italic">{emptyLabel}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.slice(0, 5).map((it) => (
            <li key={it.targetId} className="flex items-baseline justify-between text-sm">
              <span className="text-brown/80 font-mono text-[11px] truncate max-w-[70%]" title={it.targetId}>
                {it.targetId}
              </span>
              <span className="text-terra font-bold">{it.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
