// Repair: update-exhibition-facts.mjs inserted the disclaimer into the FIRST
// "story" object in the file (a different namespace), not exhibition.story.
// Remove the stray, insert anchored to the LAST "story": { (exhibition sits
// at the end of each locale file). Idempotent.
import { readFileSync, writeFileSync } from "node:fs";

const disclaimers = {
  en: "Educational information only — not medical advice.",
  af: "Slegs opvoedkundige inligting — nie mediese advies nie.",
  zu: "Ulwazi lwemfundo kuphela — akusiyo iseluleko sezokwelapha.",
  xh: "Lulwazi lwemfundo kuphela — ayisosiluleko sonyango.",
};

for (const lang of ["en", "af", "zu", "xh"]) {
  const path = `public/locales/${lang}/common.json`;
  let raw = readFileSync(path, "utf8");
  const obj = JSON.parse(raw);
  const text = disclaimers[lang];
  const strayLine = `"disclaimer": ${JSON.stringify(text)},`;

  if (obj.exhibition?.story?.disclaimer === text) {
    console.log(`${lang}: already correct`);
    continue;
  }

  // Remove the stray (first occurrence, injected right after a "story": {).
  const strayIdx = raw.indexOf(strayLine);
  if (strayIdx !== -1) {
    // remove the line plus its leading whitespace/newline
    const lineStart = raw.lastIndexOf("\n", strayIdx);
    raw = raw.slice(0, lineStart) + raw.slice(strayIdx + strayLine.length);
    console.log(`${lang}: stray removed`);
  }

  // Insert into the LAST "story": { — exhibition's.
  const anchor = raw.lastIndexOf('"story": {');
  if (anchor === -1) throw new Error(`${lang}: no story block found`);
  const insertAt = anchor + '"story": {'.length;
  raw = raw.slice(0, insertAt) + `\n      "disclaimer": ${JSON.stringify(text)},` + raw.slice(insertAt);

  const check = JSON.parse(raw); // validate before write
  if (check.exhibition?.story?.disclaimer !== text) {
    throw new Error(`${lang}: disclaimer still not in exhibition.story — aborting`);
  }
  writeFileSync(path, raw, "utf8");
  console.log(`${lang}: fixed`);
}
