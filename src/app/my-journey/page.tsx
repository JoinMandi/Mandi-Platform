"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/NavBar";
import CountUp from "@/components/ui/CountUp";
import Button from "@/components/ui/Button";
import { fetchMyJourney, logSymptom } from "@/server/actions/journey";
import type { Persona } from "@/lib/domain/scoring";
import type {
  QuestionnaireResponseRow,
  SymptomLogRow,
  CheckinRow,
  SymptomDomain,
} from "@/lib/types/database";

const DOMAINS: Array<{ key: string; label: string }> = [
  { key: "mind-cognition",   label: "Mind" },
  { key: "mood",             label: "Mood" },
  { key: "nervous-system",   label: "Nerves" },
  { key: "body",             label: "Body" },
  { key: "urogenital",       label: "Cycle" },
  { key: "other",            label: "Other" },
  { key: "quality-of-life",  label: "Life" },
];

const PERSONA_LABEL: Record<Persona, string> = {
  sally: "Searching Sally", olga: "Oblivious Olga", vicky: "Victim Vicky",
  nelly: "Know-it-all Nelly", nina: "Natural Nina", retha: "Regretting Retha",
  colleen: "Comorbid Colleen",
};

export default function MyJourneyPage() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [latest, setLatest] = useState<QuestionnaireResponseRow | null>(null);
  const [logs, setLogs] = useState<SymptomLogRow[]>([]);
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);

  useEffect(() => {
    void (async () => {
      const result = await fetchMyJourney();
      if (!result) {
        setLoading(false);
        return;
      }
      setLoggedIn(true);
      setEmail(result.email);
      setLatest(result.latest);
      setLogs(result.logs);
      setCheckins(result.checkins);
      setLoading(false);
    })();
  }, []);

  const firstName = email?.split("@")[0] ?? "friend";

  const updateLog = async (date: string, domain: string, score: number) => {
    if (!loggedIn) return;
    // optimistic
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.logged_date === date && l.domain === domain);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], score };
        return next;
      }
      return [
        ...prev,
        {
          id: `tmp-${date}-${domain}`,
          user_id: null,
          logged_date: date,
          domain: domain as SymptomDomain,
          score,
          created_at: "",
        },
      ];
    });
    const saved = await logSymptom(date, domain, score);
    if (saved) {
      setLogs((prev) =>
        prev.map((l) =>
          l.logged_date === date && l.domain === domain ? saved : l,
        ),
      );
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-cream flex items-center justify-center">
          <p className="text-brown/50 text-sm">Loading your journey…</p>
        </main>
      </>
    );
  }

  if (!loggedIn) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-cream flex items-center justify-center px-6">
          <div className="bg-cream-soft rounded-4xl shadow-warm-xl p-8 max-w-md text-center">
            <p className="font-display text-2xl text-brown mb-3">Sign in to see your journey.</p>
            <Link href="/auth/login" className="link-warm text-terra">Sign in →</Link>
          </div>
        </main>
      </>
    );
  }

  const checkinStatus = computeCheckinStatus(latest, checkins);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        {/* Hero greeting */}
        <section className="relative overflow-hidden bg-mandi-gradient-soft">
          <div className="absolute inset-0 bg-cream/40" />
          <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
            <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-2">My Journey</p>
            <h1 className="font-display text-3xl sm:text-4xl text-brown leading-tight">
              Welcome back, {firstName}.
            </h1>
            <p className="text-brown/70 text-sm mt-2">This is where Mandi remembers what matters to you.</p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
          <LastRoadmap latest={latest} />
          <SymptomTracker logs={logs} onChange={updateLog} />
          <CheckIns latest={latest} status={checkinStatus} />
        </div>
      </main>
    </>
  );
}

// ───────────────────────────────────────────────────────────────

function LastRoadmap({ latest }: { latest: QuestionnaireResponseRow | null }) {
  if (!latest) {
    return (
      <section className="bg-cream-soft rounded-3xl shadow-warm p-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">Roadmap</p>
        <h2 className="font-display text-2xl text-brown mb-3">You have not taken the questionnaire yet.</h2>
        <p className="text-brown/70 text-sm mb-5 max-w-xl">
          Spend ten minutes with Mandi and get a personalised roadmap — articles, resources, and a
          doctor-ready summary tailored to you.
        </p>
        <Link href="/questionnaire">
          <Button variant="primary">Take the questionnaire →</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-cream-soft rounded-3xl shadow-warm p-8">
      <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">Your last roadmap</p>
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="bg-terra/10 border-2 border-terra/30 rounded-3xl px-7 py-5 text-center min-w-[130px]">
          <p className="font-display text-5xl text-terra leading-none">
            <CountUp to={latest.meno_score ?? 0} />
          </p>
          <p className="text-[10px] uppercase tracking-wider text-brown/55 mt-1">MenoScore</p>
        </div>
        <div className="flex-1">
          <h2 className="font-display text-2xl text-brown leading-tight">
            {PERSONA_LABEL[latest.persona ?? "sally"]} · {latest.score_band ?? "—"}
          </h2>
          <p className="text-brown/65 text-sm mt-1">
            Completed {new Date(latest.completed_at).toLocaleDateString()}
          </p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <Link href="/roadmap"><Button variant="primary" size="sm">View full roadmap</Button></Link>
            <Link href="/questionnaire"><Button variant="secondary" size="sm">Redo questionnaire</Button></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────

function SymptomTracker({
  logs,
  onChange,
}: {
  logs: SymptomLogRow[];
  onChange: (date: string, domain: string, score: number) => void;
}) {
  const [editing, setEditing] = useState<{ date: string; domain: string } | null>(null);
  const days = useMemo(() => last7Days(), []);

  const getScore = (date: string, domain: string): number | null => {
    const log = logs.find((l) => l.logged_date === date && l.domain === domain);
    return log ? log.score : null;
  };

  return (
    <section className="bg-cream-soft rounded-3xl shadow-warm p-8">
      <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">Symptom tracker</p>
      <h2 className="font-display text-2xl text-brown mb-2">How you have been this week.</h2>
      <p className="text-brown/65 text-sm mb-6">Tap a dot to log a score (0 = not at all, 3 = extremely).</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr>
              <th className="text-left pb-3 pr-4 text-[11px] uppercase tracking-wider text-brown/50 font-semibold"></th>
              {days.map((d) => {
                const dt = new Date(d);
                return (
                  <th key={d} className="pb-3 px-1 text-[10px] uppercase tracking-wider text-brown/50 font-semibold text-center">
                    <div className="font-display text-lg text-brown leading-none">
                      {dt.getDate()}
                    </div>
                    <div>{dt.toLocaleDateString(undefined, { weekday: "short" })}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {DOMAINS.map((d) => (
              <tr key={d.key}>
                <td className="py-2 pr-4 text-sm font-medium text-brown/85">{d.label}</td>
                {days.map((day) => {
                  const score = getScore(day, d.key);
                  const isEditing =
                    editing?.date === day && editing?.domain === d.key;
                  return (
                    <td key={day} className="py-1 text-center">
                      <button
                        onClick={() => setEditing({ date: day, domain: d.key })}
                        className={`w-8 h-8 rounded-full inline-flex items-center justify-center font-semibold text-sm
                          transition-colors
                          ${score === null ? "bg-cream border border-cream-deep text-brown/30" :
                            score === 0 ? "bg-cream-deep text-brown/50" :
                            score === 1 ? "bg-golden/50 text-brown" :
                            score === 2 ? "bg-coral text-cream" :
                                          "bg-terra text-cream"}`}
                      >
                        {score === null ? "·" : score}
                      </button>
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="relative"
                          >
                            <div className="absolute z-20 top-2 left-1/2 -translate-x-1/2 bg-cream-soft border border-cream-deep rounded-2xl shadow-warm-lg p-2 flex gap-1">
                              {[0,1,2,3].map((n) => (
                                <button
                                  key={n}
                                  onClick={() => { onChange(day, d.key, n); setEditing(null); }}
                                  className="w-7 h-7 rounded-full text-xs font-semibold bg-cream hover:bg-terra hover:text-cream text-brown transition-colors"
                                >
                                  {n}
                                </button>
                              ))}
                              <button
                                onClick={() => setEditing(null)}
                                className="w-7 h-7 rounded-full text-brown/50 hover:text-terra text-xs"
                                aria-label="Cancel"
                              >
                                ✕
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────

type CheckinKey = "6week" | "3month";
type CheckinState = "upcoming" | "available" | "completed";
type CheckinStatusMap = Record<CheckinKey, { state: CheckinState; checkin?: CheckinRow }>;

function computeCheckinStatus(
  latest: QuestionnaireResponseRow | null,
  checkins: CheckinRow[],
): CheckinStatusMap {
  const six = checkins.find((c) => c.type === "6week" && c.completed_at);
  const three = checkins.find((c) => c.type === "3month" && c.completed_at);

  if (!latest) {
    return {
      "6week": { state: "upcoming" },
      "3month": { state: "upcoming" },
    };
  }

  const startDate = new Date(latest.completed_at);
  const now = Date.now();
  const weeks = (now - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7);

  return {
    "6week": six
      ? { state: "completed", checkin: six }
      : weeks >= 6
      ? { state: "available" }
      : { state: "upcoming" },
    "3month": three
      ? { state: "completed", checkin: three }
      : weeks >= 12
      ? { state: "available" }
      : { state: "upcoming" },
  };
}

function CheckIns({
  latest,
  status,
}: {
  latest: QuestionnaireResponseRow | null;
  status: CheckinStatusMap;
}) {
  return (
    <section className="bg-cream-soft rounded-3xl shadow-warm p-8">
      <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">Check-ins</p>
      <h2 className="font-display text-2xl text-brown mb-2">How your journey is going.</h2>
      <p className="text-brown/65 text-sm mb-6">Two gentle moments to look back — and forward.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <CheckinCard
          title="6-week check-in"
          subtitle="Early changes, first actions taken."
          state={status["6week"].state}
          disabled={!latest}
          beforeScore={latest?.meno_score ?? undefined}
        />
        <CheckinCard
          title="3-month check-in"
          subtitle="Full review. Mirrors the NHS / NICE milestone."
          state={status["3month"].state}
          disabled={!latest}
          beforeScore={latest?.meno_score ?? undefined}
        />
      </div>
    </section>
  );
}

function CheckinCard({
  title, subtitle, state, disabled, beforeScore,
}: {
  title: string;
  subtitle: string;
  state: CheckinState;
  disabled?: boolean;
  beforeScore?: number;
}) {
  const pillColor =
    state === "available" ? "bg-coral/25 text-terra" :
    state === "completed" ? "bg-golden/30 text-brown" :
    "bg-brown/10 text-brown/60";

  const pillLabel =
    state === "available" ? "Available now" :
    state === "completed" ? "Completed" :
    "Upcoming";

  return (
    <article className="bg-cream rounded-3xl p-6 border-l-4 border-pink-mandi shadow-warm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-lg text-brown">{title}</h3>
        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full ${pillColor}`}>
          {pillLabel}
        </span>
      </div>
      <p className="text-brown/65 text-sm leading-relaxed mb-4">{subtitle}</p>

      {state === "available" && (
        <Link href="/questionnaire?checkin=1">
          <Button variant="primary" size="sm" disabled={disabled}>Start check-in →</Button>
        </Link>
      )}

      {state === "upcoming" && (
        <p className="text-xs text-brown/50 italic">Mandi will surface this when the time is right.</p>
      )}

      {state === "completed" && beforeScore !== undefined && (
        <p className="text-xs text-brown/55">
          Started at <span className="font-semibold text-terra">{beforeScore}</span> — well done for showing up for yourself.
        </p>
      )}
    </article>
  );
}

// ───────────────────────────────────────────────────────────────

function last7Days(): string[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return isoDate(d);
  });
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
