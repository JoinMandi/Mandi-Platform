#!/usr/bin/env node
/**
 * Phase 22 — export the four locale JSONs into a single
 * Google-Sheets-friendly CSV for native-speaker moderator review.
 *
 * Reads:   public/locales/{en,zu,xh,af}/common.json
 * Writes:  translations.csv  (repo root)
 *
 * Columns: key, english, isizulu, isixhosa, afrikaans, notes
 *   - `key`     dot-path joining nested JSON object keys
 *   - `english` source-of-truth value from en/common.json
 *   - `isizulu` / `isixhosa` / `afrikaans` — current value in that
 *     locale, or empty string if missing (the app falls back to
 *     English at runtime — see src/lib/i18n.ts → fallbackLng:"en")
 *   - `notes`   blank, for moderators to flag concerns
 *
 * RFC-4180 CSV escaping so commas, quotes, and newlines inside any
 * translation value paste cleanly into Google Sheets / Excel.
 *
 * Companion to Phase 7's `gen-translations.mjs` which goes the other
 * way (JSON ← machine-translation maps). After moderators edit the
 * sheet, you download the cells back as CSV and a future small
 * importer merges them into the locale JSON files.
 *
 * Usage:
 *   npm run translations:export
 *   # → writes ./translations.csv and prints a one-line summary
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const LOCALES_DIR = resolve(REPO_ROOT, "public", "locales");
const OUT_PATH = resolve(REPO_ROOT, "translations.csv");

const LANGS = /** @type {const} */ (["en", "zu", "xh", "af"]);
/** Sheet-column header for each lang. */
const LANG_HEADER = { en: "english", zu: "isizulu", xh: "isixhosa", af: "afrikaans" };

/** Recursively flatten a nested JSON object into `dot.path → string`. */
function flatten(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, path));
    } else {
      // arrays and primitives → JSON-stringify for round-trip safety
      out[path] = typeof v === "string" ? v : JSON.stringify(v);
    }
  }
  return out;
}

/** RFC 4180 escape: wrap in quotes if value contains comma, quote, or
 *  newline; double-up any internal quotes. */
function csvEscape(value) {
  if (value == null) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function loadLocale(lang) {
  const file = resolve(LOCALES_DIR, lang, "common.json");
  const raw = await readFile(file, "utf8");
  const parsed = JSON.parse(raw);
  return flatten(parsed);
}

async function main() {
  /** @type {Record<typeof LANGS[number], Record<string, string>>} */
  const locales = {};
  for (const lang of LANGS) {
    locales[lang] = await loadLocale(lang);
  }

  // English is the source-of-truth — every key the moderator should
  // care about is in en. (zu/xh/af keys not in en are stale; we still
  // include them for visibility so they can be pruned.)
  const allKeys = new Set(Object.keys(locales.en));
  for (const lang of ["zu", "xh", "af"]) {
    for (const k of Object.keys(locales[lang])) allKeys.add(k);
  }
  const keys = Array.from(allKeys).sort();

  // Header row
  const lines = [
    ["key", "english", "isizulu", "isixhosa", "afrikaans", "notes"]
      .map(csvEscape)
      .join(","),
  ];

  // Per-language fallback counters for the summary
  const fallbackCount = { zu: 0, xh: 0, af: 0 };

  for (const key of keys) {
    const en = locales.en[key] ?? "";
    const zu = locales.zu[key] ?? "";
    const xh = locales.xh[key] ?? "";
    const af = locales.af[key] ?? "";
    // "falling back" = empty OR identical to English (machine
    // translation may legitimately produce the same string, but
    // the common case here is "not translated yet")
    if (!zu || zu === en) fallbackCount.zu += 1;
    if (!xh || xh === en) fallbackCount.xh += 1;
    if (!af || af === en) fallbackCount.af += 1;
    lines.push(
      [key, en, zu, xh, af, ""].map(csvEscape).join(","),
    );
  }

  // Write with a UTF-8 BOM so Excel opens it as UTF-8 (Google Sheets
  // is fine either way; the BOM helps Windows Excel detect the
  // encoding and not mangle isiZulu characters).
  await writeFile(OUT_PATH, "﻿" + lines.join("\r\n") + "\r\n", "utf8");

  // eslint-disable-next-line no-console
  console.log(
    `[translations:export] Wrote ${keys.length} rows → ${OUT_PATH}\n` +
      `  isiZulu fallback (empty or = English): ${fallbackCount.zu}\n` +
      `  isiXhosa fallback                    : ${fallbackCount.xh}\n` +
      `  Afrikaans fallback                   : ${fallbackCount.af}`,
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[translations:export] failed:", err);
  process.exit(1);
});
