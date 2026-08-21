// One-shot: exhibition.restart label (the every-step start-over control).
import { readFileSync, writeFileSync } from "node:fs";

const labels = { en: "Start over", af: "Begin oor", zu: "Qala phansi", xh: "Qala kwakhona" };

for (const lang of ["en", "af", "zu", "xh"]) {
  const path = `public/locales/${lang}/common.json`;
  let raw = readFileSync(path, "utf8");
  const obj = JSON.parse(raw);
  if (obj.exhibition?.restart) {
    console.log(`${lang}: already present`);
    continue;
  }
  raw = raw.replace(/"exhibition":\s*\{/, `"exhibition": {\n    "restart": ${JSON.stringify(labels[lang])},`);
  const check = JSON.parse(raw);
  if (check.exhibition?.restart !== labels[lang]) throw new Error(`${lang}: insert failed`);
  writeFileSync(path, raw, "utf8");
  console.log(`${lang}: restart added`);
}
