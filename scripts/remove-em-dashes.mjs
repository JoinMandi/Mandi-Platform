// One-shot: strip em dashes from the exhibition copy + the nine facts
// (rendered in the exhibition story) in all four locales. Parenthetical
// and connective dashes become commas. Idempotent by nature.
import { readFileSync, writeFileSync } from "node:fs";

const strip = (s) =>
  s
    .replace(/\s*—\s*/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/\s+([.;!?])/g, "$1");

function collectStrings(node, out) {
  if (typeof node === "string") {
    if (node.includes("—")) out.push(node);
    return;
  }
  if (node && typeof node === "object") {
    for (const v of Object.values(node)) collectStrings(v, out);
  }
}

for (const lang of ["en", "af", "zu", "xh"]) {
  const path = `public/locales/${lang}/common.json`;
  let raw = readFileSync(path, "utf8");
  const obj = JSON.parse(raw);

  const targets = [];
  collectStrings(obj.exhibition, targets);
  // Whole questionnaire namespace: question texts, hints, facts, domains —
  // all rendered in the exhibition flow (and shared with the main app).
  collectStrings(obj.questionnaire, targets);
  // Main-site namespaces (v2 of the sweep). roadmap.safety.* is clinically
  // frozen — excluded byte-for-byte, even punctuation.
  for (const ns of [
    "landing", "about", "resources", "hrt", "mothers", "events", "doctor",
    "journey", "auth", "consent", "transition", "footer", "brand", "nav", "language",
  ]) {
    collectStrings(obj[ns], targets);
  }
  if (obj.roadmap) {
    const { safety, ...roadmapRest } = obj.roadmap;
    collectStrings(roadmapRest, targets);
  }

  let n = 0;
  for (const old of targets) {
    const next = strip(old);
    if (next === old) continue;
    const from = JSON.stringify(old);
    if (!raw.includes(from)) throw new Error(`${lang}: value not found in raw`);
    raw = raw.replace(from, JSON.stringify(next));
    n++;
  }
  JSON.parse(raw); // validate before write
  writeFileSync(path, raw, "utf8");
  console.log(`${lang}: ${n} strings de-dashed`);
}
