"use client";

/**
 * Phase 21 — doctor-ready summary, print-to-PDF via the browser.
 *
 * No new dependency: the page is HTML + Tailwind with `@media print`
 * styles tuned for letter/A4 paper, then it calls `window.print()`
 * after a short delay so the layout has time to settle. The user
 * saves as PDF from her browser's print dialog and hands it to her
 * doctor.
 *
 * Everything goes through `react-i18next` (`fetchDoctorSummary` returns
 * the data; question text comes from `questions.ts → textKey` looked up
 * via the same i18n keys that drive /questionnaire). Switching her
 * language switches the PDF — Phase 7 fallback semantics apply.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { fetchDoctorSummary } from "@/server/actions/journey";
import { questions } from "@/lib/domain/questions";
import type { QuestionnaireResponseRow } from "@/lib/types/database";

interface SummaryData {
  email: string | null;
  latest: QuestionnaireResponseRow | null;
  symptomSummary: { domain: string; average: number; count: number }[];
}

export default function DoctorSummaryPage() {
  const { t } = useTranslation("common");
  const [data, setData] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetchDoctorSummary();
        if (!res) {
          setError("not-signed-in");
          return;
        }
        if (!res.latest) {
          setError("no-response");
          setData(res);
          return;
        }
        setData(res);
        // Give the layout a beat to render, then open the print dialog.
        // Most browsers honour ~300ms; longer is safer for slower paints.
        const timer = setTimeout(() => {
          window.print();
        }, 600);
        return () => clearTimeout(timer);
      } catch (e) {
        setError(e instanceof Error ? e.message : "unknown");
      }
    })();
  }, []);

  if (error === "not-signed-in") {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="bg-cream-soft rounded-4xl shadow-warm-xl p-8 max-w-md text-center">
          <p className="font-display text-2xl text-brown mb-3">
            {t("journey.pdf.signedOutTitle")}
          </p>
          <Link href="/auth/login" className="link-warm text-terra">
            {t("journey.pdf.signedOutCta")} →
          </Link>
        </div>
      </main>
    );
  }
  if (error === "no-response") {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="bg-cream-soft rounded-4xl shadow-warm-xl p-8 max-w-md text-center">
          <p className="font-display text-2xl text-brown mb-3">
            {t("journey.pdf.noResponseTitle")}
          </p>
          <p className="text-brown/65 text-sm mb-5">
            {t("journey.pdf.noResponseBody")}
          </p>
          <Link href="/questionnaire" className="link-warm text-terra">
            {t("journey.pdf.noResponseCta")} →
          </Link>
        </div>
      </main>
    );
  }
  if (error) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <p className="text-terra">{error}</p>
      </main>
    );
  }
  if (!data || !data.latest) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-brown/50 text-sm">{t("journey.pdf.loading")}</p>
      </main>
    );
  }

  const { latest, email, symptomSummary } = data;
  const answers = (latest.answers as Record<number, unknown> | null) ?? {};
  const completed = new Date(latest.completed_at).toLocaleDateString();
  const generated = new Date().toLocaleString();

  // Group questions by their canonical domain for the answers section.
  const byDomain = new Map<string, typeof questions>();
  for (const q of questions) {
    const arr = byDomain.get(q.domain) ?? [];
    arr.push(q);
    byDomain.set(q.domain, arr);
  }

  return (
    <>
      {/* Print-specific styles: hide non-essential chrome, tighten margins,
          break sections cleanly. */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 18mm 14mm;
          }
          html, body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .print-page-break {
            break-before: page;
            page-break-before: always;
          }
        }
      `}</style>

      <main className="min-h-screen bg-cream print:bg-white">
        {/* Screen-only top bar with manual print button — the auto-print on
            mount may be cancelled or fail; this gives her a way to retry. */}
        <div className="no-print bg-brown text-cream px-6 py-3 flex items-center justify-between">
          <p className="text-sm">
            {t("journey.pdf.barHint")}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="text-sm bg-cream text-brown font-semibold rounded-full px-4 py-1.5 hover:bg-golden transition-colors"
            >
              {t("journey.pdf.printButton")}
            </button>
            <Link
              href="/my-journey"
              className="text-sm text-cream/80 hover:text-cream underline"
            >
              {t("journey.pdf.backLink")}
            </Link>
          </div>
        </div>

        <article className="max-w-3xl mx-auto px-6 py-10 print:px-0 print:py-0 text-brown print:text-black">
          {/* Header */}
          <header className="print-section mb-8 pb-6 border-b-2 border-cream-deep print:border-black/30">
            <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-1 print:text-black/60">
              {t("journey.pdf.headerEyebrow")}
            </p>
            <h1 className="font-display text-3xl print:text-2xl text-brown print:text-black">
              {t("journey.pdf.headerTitle")}
            </h1>
            <div className="grid sm:grid-cols-2 gap-2 text-sm mt-3 text-brown/80 print:text-black">
              <p>
                <span className="font-semibold">{t("journey.pdf.patientLabel")}:</span>{" "}
                {email ?? "—"}
              </p>
              <p>
                <span className="font-semibold">{t("journey.pdf.completedLabel")}:</span>{" "}
                {completed}
              </p>
              <p>
                <span className="font-semibold">{t("journey.pdf.languageLabel")}:</span>{" "}
                {(latest.language_code ?? "en").toUpperCase()}
              </p>
              <p>
                <span className="font-semibold">{t("journey.pdf.generatedLabel")}:</span>{" "}
                {generated}
              </p>
            </div>
          </header>

          {/* MenoScore + band + top domains */}
          <section className="print-section mb-8">
            <h2 className="font-display text-xl text-brown print:text-black mb-3">
              {t("journey.pdf.scoreHeading")}
            </h2>
            <div className="flex flex-wrap gap-6 items-baseline">
              <p>
                <span className="font-display text-5xl print:text-3xl text-terra print:text-black">
                  {latest.meno_score ?? "—"}
                </span>
                <span className="text-brown/55 print:text-black/60 text-sm ml-2">
                  / 100
                </span>
              </p>
              {latest.score_band && (
                <p className="text-base">
                  <span className="font-semibold">
                    {t("journey.pdf.bandLabel")}:
                  </span>{" "}
                  {t(`journey.summary.band.${latest.score_band}`)}
                </p>
              )}
            </div>
            {latest.top_domains && latest.top_domains.length > 0 && (
              <p className="text-sm mt-2 text-brown/80 print:text-black">
                <span className="font-semibold">{t("journey.pdf.topAreasLabel")}:</span>{" "}
                {latest.top_domains
                  .map((d) => t(`journey.summary.domain.${d}`, d))
                  .join(" · ")}
              </p>
            )}
            {(latest.self_harm_flag || latest.colleen_flag) && (
              <div className="mt-3 text-sm flex flex-wrap gap-2">
                {latest.self_harm_flag && (
                  <span className="px-3 py-1 rounded-full bg-brown text-cream print:bg-black print:text-white text-xs font-semibold">
                    {t("journey.pdf.flagSelfHarm")}
                  </span>
                )}
                {latest.colleen_flag && (
                  <span className="px-3 py-1 rounded-full bg-terra text-cream print:bg-black print:text-white text-xs font-semibold">
                    {t("journey.pdf.flagComorbid")}
                  </span>
                )}
              </div>
            )}
            {/* Crisis resource travels WITH the flag — a bare pill on a
                printed document helps nobody. Copy is the clinically frozen
                SADAG string; addition flagged for clinical review. */}
            {latest.self_harm_flag && (
              <p className="mt-2 text-xs text-brown/80 print:text-black">
                {t("roadmap.safety.selfHarm.sadag")}
              </p>
            )}
          </section>

          {/* Recent symptom tracker summary */}
          {symptomSummary.length > 0 && (
            <section className="print-section mb-8">
              <h2 className="font-display text-xl text-brown print:text-black mb-3">
                {t("journey.pdf.trackerHeading")}
              </h2>
              <p className="text-brown/65 text-sm mb-3 print:text-black/70">
                {t("journey.pdf.trackerBody")}
              </p>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-cream-deep print:border-black/30">
                    <th className="text-left py-2 pr-4 font-semibold">
                      {t("journey.pdf.trackerColSymptom")}
                    </th>
                    <th className="text-left py-2 pr-4 font-semibold">
                      {t("journey.pdf.trackerColAverage")}
                    </th>
                    <th className="text-left py-2 font-semibold">
                      {t("journey.pdf.trackerColCount")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {symptomSummary.map((s) => (
                    <tr
                      key={s.domain}
                      className="border-b border-cream-deep/50 print:border-black/15"
                    >
                      <td className="py-1.5 pr-4">
                        {t(`journey.tracker.symptom.${s.domain}.label`, s.domain)}
                      </td>
                      <td className="py-1.5 pr-4 font-mono">{s.average.toFixed(1)}</td>
                      <td className="py-1.5 text-brown/65 print:text-black/60">
                        {s.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* All 56 answers grouped by domain — the meat of the doctor's
              brief. Page-break before this so the score summary above
              stays together on its own page. */}
          <section className="print-page-break">
            <h2 className="font-display text-xl text-brown print:text-black mb-3">
              {t("journey.pdf.answersHeading")}
            </h2>
            <p className="text-brown/65 text-sm mb-5 print:text-black/70">
              {t("journey.pdf.answersBody")}
            </p>

            {Array.from(byDomain.entries()).map(([domain, qs]) => (
              <div key={domain} className="print-section mb-6">
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-terra print:text-black/65 mb-2 border-b border-cream-deep print:border-black/20 pb-1">
                  {t(`journey.summary.domain.${domain}`, domain)}
                </h3>
                <ol className="space-y-2 list-decimal list-inside marker:text-brown/40">
                  {qs.map((q) => {
                    const answer = answers[q.id];
                    return (
                      <li key={q.id} className="text-sm leading-snug">
                        <span className="text-brown print:text-black">
                          {t(`questionnaire.${q.textKey}`, q.textKey)}
                        </span>
                        <div className="ml-5 mt-0.5 text-brown/85 print:text-black/85">
                          <span className="font-semibold">
                            {t("journey.pdf.answerLabel")}:
                          </span>{" "}
                          {renderAnswer(answer, t("questionnaire.yes"), t("questionnaire.no"))}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </section>

          <footer className="print-section mt-10 pt-5 border-t border-cream-deep print:border-black/30 text-xs text-brown/55 print:text-black/60">
            <p>{t("journey.pdf.footerLine1")}</p>
            <p className="mt-1">{t("journey.pdf.footerLine2")}</p>
          </footer>
        </article>
      </main>
    </>
  );
}

/** Stringify an answer for the print page. Covers the answer types
 *  produced by the questionnaire: scale (0–4), yes/no/notsure
 *  strings, multi-select arrays, number/measurement objects, plain
 *  strings, and missing answers. */
function renderAnswer(answer: unknown, yesLabel = "Yes", noLabel = "No"): string {
  if (answer == null || answer === "") return "—";
  if (typeof answer === "number") return String(answer);
  if (typeof answer === "boolean") return answer ? yesLabel : noLabel;
  if (typeof answer === "string") return answer;
  if (Array.isArray(answer)) {
    return answer.length === 0 ? "—" : answer.map(String).join(", ");
  }
  if (typeof answer === "object") {
    // measurement: { value, unit } shape
    const obj = answer as Record<string, unknown>;
    if ("value" in obj && "unit" in obj) {
      return `${String(obj.value)} ${String(obj.unit)}`;
    }
    // Never let raw JSON reach a document handed to a clinician.
    return "—";
  }
  return String(answer);
}
