// One-shot: capture copy alludes to building her FULL blanket on Mandi -
// the complete 56-question assessment, more info, and joining the journey.
import { readFileSync, writeFileSync } from "node:fs";

const edits = {
  en: {
    "exhibition.email.body":
      "Leave your email and Mandi will send you your blanket, your link to the full 56-question assessment, and a place on the journey, so you can finish your blanket in your own time, in your own home.",
  },
  af: {
    "exhibition.email.body":
      "Los jou e-pos en Mandi stuur jou kombers, jou skakel na die volledige 56-vraag-assessering, en 'n plek op die reis, sodat jy jou kombers in jou eie tyd, in jou eie huis kan voltooi.",
  },
  zu: {
    "exhibition.email.body":
      "Shiya i-imeyili yakho uMandi akuthumelele ingubo yakho, isixhumanisi sakho sokuhlolwa okuphelele kwemibuzo engu-56, kanye nendawo ohambweni, ukuze uqedele ingubo yakho ngesikhathi sakho, ekhaya lakho.",
  },
  xh: {
    "exhibition.email.body":
      "Shiya i-imeyile yakho uMandi akuthumelele ingubo yakho, ikhonkco lakho lovavanyo olupheleleyo lwemibuzo engama-56, kunye nendawo kuhambo, ukuze ugqibezele ingubo yakho ngexesha lakho, ekhayeni lakho.",
  },
};

const getPath = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

for (const lang of ["en", "af", "zu", "xh"]) {
  const path = `public/locales/${lang}/common.json`;
  let raw = readFileSync(path, "utf8");
  const obj = JSON.parse(raw);
  for (const [keyPath, next] of Object.entries(edits[lang])) {
    const old = getPath(obj, keyPath);
    if (old === undefined) throw new Error(`${lang}: ${keyPath} missing`);
    if (old === next) {
      console.log(`${lang}: ${keyPath} already updated`);
      continue;
    }
    const from = JSON.stringify(old);
    if (!raw.includes(from)) throw new Error(`${lang}: ${keyPath} old value not found`);
    raw = raw.replace(from, JSON.stringify(next));
    console.log(`${lang}: ${keyPath} updated`);
  }
  JSON.parse(raw);
  writeFileSync(path, raw, "utf8");
}
