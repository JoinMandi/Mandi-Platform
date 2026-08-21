// One-shot: exhibition.prevQuestion label (chat's go-back-and-modify button).
import { readFileSync, writeFileSync } from "node:fs";

const labels = {
  en: "Previous question",
  af: "Vorige vraag",
  zu: "Umbuzo odlule",
  xh: "Umbuzo owandulele",
};

for (const lang of ["en", "af", "zu", "xh"]) {
  const path = `public/locales/${lang}/common.json`;
  let raw = readFileSync(path, "utf8");
  const obj = JSON.parse(raw);
  if (obj.exhibition?.prevQuestion) {
    console.log(`${lang}: already present`);
    continue;
  }
  raw = raw.replace(/"exhibition":\s*\{/, `"exhibition": {\n    "prevQuestion": ${JSON.stringify(labels[lang])},`);
  const check = JSON.parse(raw);
  if (check.exhibition?.prevQuestion !== labels[lang]) throw new Error(`${lang}: insert failed`);
  writeFileSync(path, raw, "utf8");
  console.log(`${lang}: prevQuestion added`);
}
