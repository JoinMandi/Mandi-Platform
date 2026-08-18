// One-shot: v5 copy pass — de-diagnose chat replies, movement CTAs, and
// add 20s/30s age-band labels. Path-based value replacement (UTF-8 safe,
// idempotent): reads the current value at a path and swaps its exact JSON
// encoding in the raw text, so formatting elsewhere is untouched.
import { readFileSync, writeFileSync } from "node:fs";

const edits = {
  en: {
    // Replies that asserted a diagnosis → validation without diagnosing.
    "exhibition.chat.mind-cognition.hi.2": "Your memory isn't broken. So many women describe exactly this.",
    "exhibition.chat.body.hi.1": "Your body is telling you something — and it's worth listening to.",
    "exhibition.chat.other.hi.2": "Many women only make that connection much later.",
    // Movement CTAs — destigmatised, intentional women's health, African voice.
    "exhibition.story.hormoneHook.body":
      "Almost everything you just read traces back to shifting hormones. Understanding them is the key to feeling like yourself again — and that is what Mandi is building: intentional, destigmatised women's health, in your language, with an African voice.",
    "exhibition.story.hormoneHook.cta": "Join the Mandi journey",
    "exhibition.thanks.bodyPhone":
      "Watch your inbox. Your full blanket — and a movement for women's health with an African voice — is waiting at joinmandi.com.",
    "exhibition.thanks.fullCta": "Join the Mandi journey",
    "exhibition.email.body":
      "Leave your email and Mandi will send you your results — and welcome you to the journey the moment we launch.",
  },
  af: {
    "exhibition.chat.mind-cognition.hi.2": "Jou geheue is nie stukkend nie. Soveel vroue beskryf presies dit.",
    "exhibition.chat.body.hi.1": "Jou lyf vertel jou iets — en dis die moeite werd om te luister.",
    "exhibition.chat.other.hi.2": "Baie vroue maak daardie verband eers baie later.",
    "exhibition.story.hormoneHook.body":
      "Byna alles wat jy nou net gelees het, kom van veranderende hormone. Om hulle te verstaan is die sleutel om weer soos jouself te voel — en dit is wat Mandi bou: doelgerigte, gedestigmatiseerde vrouegesondheid, in jou taal, met 'n Afrika-stem.",
    "exhibition.story.hormoneHook.cta": "Sluit aan by die Mandi-reis",
    "exhibition.thanks.bodyPhone":
      "Hou jou inboks dop. Jou volle kombers — en 'n beweging vir vrouegesondheid met 'n Afrika-stem — wag by joinmandi.com.",
    "exhibition.thanks.fullCta": "Sluit aan by die Mandi-reis",
    "exhibition.email.body":
      "Los jou e-pos en Mandi stuur jou resultate — en verwelkom jou op die reis die oomblik wat ons loods.",
  },
  zu: {
    "exhibition.chat.mind-cognition.hi.2": "Inkumbulo yakho ayiphukile. Abesifazane abaningi kakhulu bachaza khona lokhu.",
    "exhibition.chat.body.hi.1": "Umzimba wakho ukutshela okuthile — futhi kufanele ukulalele.",
    "exhibition.chat.other.hi.2": "Abesifazane abaningi bakwenza lokho kuxhumana kamuva kakhulu.",
    "exhibition.story.hormoneHook.body":
      "Cishe konke osanda kukufunda kuvela kuma-hormone ashintshayo. Ukuwaqonda kuyisihluthulelo sokuphinde uzizwe unguwe — futhi yilokho uMandi akwakhayo: impilo yabesifazane ehlosiwe, engenakuhlazisa, ngolimi lwakho, ngezwi lase-Afrika.",
    "exhibition.story.hormoneHook.cta": "Joyina uhambo lukaMandi",
    "exhibition.thanks.bodyPhone":
      "Bheka ibhokisi lakho le-imeyili. Ingubo yakho ephelele — nombutho wempilo yabesifazane onezwi lase-Afrika — ukulindile ku-joinmandi.com.",
    "exhibition.thanks.fullCta": "Joyina uhambo lukaMandi",
    "exhibition.email.body":
      "Shiya i-imeyili yakho uMandi uzokuthumelela imiphumela yakho — futhi akwamukele ohambweni ngesikhathi esiqala ngaso.",
  },
  xh: {
    "exhibition.chat.mind-cognition.hi.2": "Inkumbulo yakho ayaphukanga. Abafazi abaninzi kakhulu bachaza kanye oku.",
    "exhibition.chat.body.hi.1": "Umzimba wakho ukuxelela into ethile — kwaye kufanelekile ukuyimamela.",
    "exhibition.chat.other.hi.2": "Abafazi abaninzi benza olo nxibelelwano kamva kakhulu.",
    "exhibition.story.hormoneHook.body":
      "Phantse yonke into osanda kuyifunda ivela kwii-hormone ezitshintshayo. Ukuziqonda sisitshixo sokuphinda uzive ungowakho — kwaye yiloo nto uMandi ayakhayo: impilo yabafazi enenjongo, engenazintloni, ngolwimi lwakho, ngelizwi lase-Afrika.",
    "exhibition.story.hormoneHook.cta": "Joyina uhambo lukaMandi",
    "exhibition.thanks.bodyPhone":
      "Jonga ibhokisi yakho ye-imeyile. Ingubo yakho epheleleyo — kunye nombutho wempilo yabafazi onelizwi lase-Afrika — ikulindile ku-joinmandi.com.",
    "exhibition.thanks.fullCta": "Joyina uhambo lukaMandi",
    "exhibition.email.body":
      "Shiya i-imeyile yakho uMandi uya kukuthumelela iziphumo zakho — kwaye akwamkele kuhambo ngexesha esisungula ngalo.",
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

  // Age bands: add 30-39 and 20-29 labels (numeric — same in every locale).
  if (!obj.exhibition?.capture?.ages?.["20-29"]) {
    raw = raw.replace(
      /("ages":\s*\{)/,
      `$1\n        "30-39": "30–39",\n        "20-29": "20–29",`,
    );
    console.log(`${lang}: age labels 20s/30s added`);
  }

  JSON.parse(raw); // validate before write
  writeFileSync(path, raw, "utf8");
}
