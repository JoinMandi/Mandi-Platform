// One-shot: sweeter capture checkboxes. Consent stays a real POPIA consent
// (keeping details to send results) but warm; marketing drops the Ts&Cs tone
// to one keep-me-in-the-loop line (the fine print below covers opt-out).
import { readFileSync, writeFileSync } from "node:fs";

const edits = {
  en: {
    "exhibition.email.consent": "Yes, Mandi may keep my details and send me my blanket and results.",
    "exhibition.capture.marketing": "Keep me in the loop, news, events and the Mandi journey.",
  },
  af: {
    "exhibition.email.consent": "Ja, Mandi mag my besonderhede hou en my kombers en resultate vir my stuur.",
    "exhibition.capture.marketing": "Hou my op hoogte, nuus, geleenthede en die Mandi-reis.",
  },
  zu: {
    "exhibition.email.consent": "Yebo, uMandi angagcina imininingwane yami angithumelele ingubo yami nemiphumela.",
    "exhibition.capture.marketing": "Ngigcine ngaziswa, izindaba, imicimbi nohambo lukaMandi.",
  },
  xh: {
    "exhibition.email.consent": "Ewe, uMandi angagcina iinkcukacha zam andithumelele ingubo yam neziphumo.",
    "exhibition.capture.marketing": "Ndigcine ndisazi, iindaba, imisitho nohambo lukaMandi.",
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
