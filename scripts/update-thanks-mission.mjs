// One-shot: thanks-screen copy leans into the Mandi mission — menopause
// understood not endured, every woman in her own language, destigmatised
// women's health for South Africa. Path-based replace, UTF-8 safe.
import { readFileSync, writeFileSync } from "node:fs";

const edits = {
  en: {
    "exhibition.thanks.bodyPhone":
      "Watch your inbox. Mandi is building a home for women's health in South Africa — menopause understood, not endured; every woman in her own language. Your blanket is the first stitch. Come finish it at joinmandi.com.",
    "exhibition.thanks.bodyKiosk":
      "Thank you for stitching your story with us — Mandi is building destigmatised women's health for South Africa, and you are part of it now. Please hand the tablet back.",
  },
  af: {
    "exhibition.thanks.bodyPhone":
      "Hou jou inboks dop. Mandi bou 'n tuiste vir vrouegesondheid in Suid-Afrika — menopouse verstaan, nie verduur nie; elke vrou in haar eie taal. Jou kombers is die eerste steek. Kom voltooi dit by joinmandi.com.",
    "exhibition.thanks.bodyKiosk":
      "Dankie dat jy jou storie saam met ons gestik het — Mandi bou gedestigmatiseerde vrouegesondheid vir Suid-Afrika, en jy is nou deel daarvan. Gee asseblief die tablet terug.",
  },
  zu: {
    "exhibition.thanks.bodyPhone":
      "Bheka ibhokisi lakho le-imeyili. UMandi wakha ikhaya lempilo yabesifazane eNingizimu Afrika — i-menopause eqondwayo, hhayi ebekezelelwayo; wonke owesifazane ngolimi lwakhe. Ingubo yakho iwumthungo wokuqala. Woza uyiqedele ku-joinmandi.com.",
    "exhibition.thanks.bodyKiosk":
      "Siyabonga ngokuthunga indaba yakho nathi — uMandi wakha impilo yabesifazane engenakuhlazisa eNingizimu Afrika, futhi usuyingxenye yayo manje. Sicela ubuyisele ithebulethi.",
  },
  xh: {
    "exhibition.thanks.bodyPhone":
      "Jonga ibhokisi yakho ye-imeyile. UMandi wakha ikhaya lempilo yabafazi eMzantsi Afrika — i-menopause eqondwayo, kungekhona enyanyezelwayo; wonke umfazi ngolwimi lwakhe. Ingubo yakho ngumthungo wokuqala. Yiza uyigqibezele ku-joinmandi.com.",
    "exhibition.thanks.bodyKiosk":
      "Enkosi ngokuthunga ibali lakho nathi — uMandi wakha impilo yabafazi engenazintloni eMzantsi Afrika, kwaye ngoku uyinxalenye yayo. Nceda ubuyisele ithebhulethi.",
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
