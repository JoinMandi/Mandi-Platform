// One-shot: fact label -> "The menopause link", less-assuming capture body,
// story CTA softened to "Check out the Mandi journey" (Join stays on thanks).
import { readFileSync, writeFileSync } from "node:fs";

const edits = {
  en: {
    "exhibition.story.factLabel": "The menopause link",
    "exhibition.email.body":
      "You've stitched a few patches today. Leave your email and we'll send your results and the link to the full 56-question blanket, so you can finish it in your own time and discover more.",
    "exhibition.story.hormoneHook.cta": "Check out the Mandi journey",
  },
  af: {
    "exhibition.story.factLabel": "Die menopouse-skakel",
    "exhibition.email.body":
      "Jy het vandag 'n paar lappies gestik. Los jou e-pos en ons stuur jou resultate en die skakel na die volle 56-vraag-kombers, sodat jy dit in jou eie tyd kan voltooi en meer kan ontdek.",
    "exhibition.story.hormoneHook.cta": "Loer na die Mandi-reis",
  },
  zu: {
    "exhibition.story.factLabel": "Ukuxhumana ne-menopause",
    "exhibition.email.body":
      "Uthunge izingcephe ezimbalwa namuhla. Shiya i-imeyili yakho sikuthumelele imiphumela yakho nesixhumanisi sengubo ephelele yemibuzo engu-56, uyiqedele ngesikhathi sakho, uthole okwengeziwe.",
    "exhibition.story.hormoneHook.cta": "Bheka uhambo lukaMandi",
  },
  xh: {
    "exhibition.story.factLabel": "Unxibelelwano ne-menopause",
    "exhibition.email.body":
      "Uthunge amalaphu ambalwa namhlanje. Shiya i-imeyile yakho sikuthumelele iziphumo zakho nekhonkco lengubo epheleleyo yemibuzo engama-56, uyigqibezele ngexesha lakho, ufumane okungakumbi.",
    "exhibition.story.hormoneHook.cta": "Jonga uhambo lukaMandi",
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
