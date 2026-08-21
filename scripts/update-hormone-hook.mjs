// One-shot: hormone hook recast from assertion to possibility/awareness —
// "don't count out hormones" framing. Path-based replace, UTF-8 safe.
import { readFileSync, writeFileSync } from "node:fs";

const edits = {
  en: {
    "exhibition.story.hormoneHook.title": "Don't count out your hormones.",
    "exhibition.story.hormoneHook.body":
      "So many women live with symptoms like these for years — never knowing hormones could be part of the story. Whatever your blanket looks like, they are worth understanding. That is what Mandi is building: intentional, destigmatised women's health, in your language, with an African voice.",
  },
  af: {
    "exhibition.story.hormoneHook.title": "Moenie jou hormone uitsluit nie.",
    "exhibition.story.hormoneHook.body":
      "Soveel vroue leef jare lank met simptome soos hierdie — sonder om te weet dat hormone deel van die storie kan wees. Hoe jou kombers ook al lyk, dit is die moeite werd om hulle te verstaan. Dit is wat Mandi bou: doelgerigte, gedestigmatiseerde vrouegesondheid, in jou taal, met 'n Afrika-stem.",
  },
  zu: {
    "exhibition.story.hormoneHook.title": "Ungawashiyi ngaphandle ama-hormone akho.",
    "exhibition.story.hormoneHook.body":
      "Abesifazane abaningi kakhulu baphila iminyaka nezimpawu ezifana nalezi — bengazi ukuthi ama-hormone angaba yingxenye yendaba. Noma ngabe ingubo yakho ibukeka kanjani, kufanele uwaqonde. Yilokho uMandi akwakhayo: impilo yabesifazane ehlosiwe, engenakuhlazisa, ngolimi lwakho, ngezwi lase-Afrika.",
  },
  xh: {
    "exhibition.story.hormoneHook.title": "Musa ukuzishiya ngaphandle ii-hormone zakho.",
    "exhibition.story.hormoneHook.body":
      "Abafazi abaninzi kakhulu baphila iminyaka neempawu ezifana nezi — bengazi ukuba ii-hormone zinokuba yinxalenye yebali. Nokuba ingubo yakho ibonakala njani, kufanelekile ukuba uziqonde. Yiloo nto uMandi ayakhayo: impilo yabafazi enenjongo, engenazintloni, ngolwimi lwakho, ngelizwi lase-Afrika.",
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
