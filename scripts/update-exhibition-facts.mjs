// One-shot: apply the evidence-matched rewordings to questionnaire.facts.*
// (verdicts + citations in docs/FACTS-SOURCES.md) and add the
// exhibition.story.disclaimer key. UTF-8 safe, idempotent.
import { readFileSync, writeFileSync } from "node:fs";

// Only the 4 REWORD verdicts — the other 5 facts are supported as written.
const rewords = {
  en: {
    context:
      "Perimenopause — the years of change before periods stop — most often lasts around 4 to 8 years, though for some women it is shorter or longer. Menopause itself is just one day.",
    mood:
      "Mood changes in menopause are physical, not a personal failing. Oestrogen interacts with serotonin, one of the brain's mood chemicals — so when hormone levels shift, mood can shift too.",
    other:
      "Suddenly cannot tolerate alcohol the way you used to? Oestrogen interacts with histamine — the chemical behind allergy-type reactions — and some women notice new sensitivities in midlife. You are not imagining it.",
    mindset:
      "It is never too late to ask for help. Some symptoms — including vaginal and bladder ones — respond well to treatment no matter how many years have passed since menopause.",
  },
  af: {
    context:
      "Perimenopouse — die jare van verandering voordat maandstondes ophou — duur meestal ongeveer 4 tot 8 jaar, hoewel dit vir sommige vroue korter of langer is. Menopouse self is net een dag.",
    mood:
      "Buiveranderinge in menopouse is fisies, nie 'n persoonlike mislukking nie. Estrogeen werk in op serotonien, een van die brein se buichemikalieë — so wanneer hormoonvlakke verskuif, kan jou bui ook verskuif.",
    other:
      "Kan jy skielik nie alkohol verdra soos vroeër nie? Estrogeen werk in op histamien — die chemikalie agter allergie-tipe reaksies — en sommige vroue merk nuwe sensitiwiteite in die middeljare op. Jy verbeel jou nie.",
    mindset:
      "Dit is nooit te laat om hulp te vra nie. Sommige simptome — insluitend vaginale en blaassimptome — reageer goed op behandeling, maak nie saak hoeveel jare sedert menopouse verby is nie.",
  },
  zu: {
    context:
      "I-perimenopause — iminyaka yoshintsho ngaphambi kokuthi izinsuku zenyanga ziphele — ivamise ukuthatha iminyaka engaba mi-4 kuya kwengu-8, nakuba kwabanye besifazane imfushane noma inde. I-menopause uqobo lusuku olulodwa nje.",
    mood:
      "Ukushintsha kwemizwa ku-menopause kungokomzimba, akusikho ukwehluleka komuntu. I-oestrogen isebenzisana ne-serotonin, elinye lamakhemikhali emizwa obuchopho — ngakho lapho amazinga ama-hormone eshintsha, imizwa nayo ingashintsha.",
    other:
      "Awusakwazi ukubekezelela utshwala njengakuqala? I-oestrogen isebenzisana ne-histamine — ikhemikhali engemuva kokusabela okufana nama-allergy — futhi abanye besifazane baqaphela ukuzwela okusha eminyakeni ephakathi. Awuzicabangeli nje.",
    mindset:
      "Akukaze kube sekwephuzile ukucela usizo. Ezinye izimpawu — kuhlanganise nezesitho sangasese nezesinye — zisabela kahle ekwelashweni noma sekudlule iminyaka emingaki selokhu kwaba yi-menopause.",
  },
  xh: {
    context:
      "I-perimenopause — iminyaka yotshintsho phambi kokuba iimeko zenyanga ziphele — idla ngokuthatha malunga neminyaka emi-4 ukuya kwesi-8, nangona kwabanye abafazi imfutshane okanye inde. I-menopause ngokwayo lusuku olunye nje.",
    mood:
      "Utshintsho lweemvakalelo kwi-menopause lolomzimba, ayikokusilela komntu. I-oestrogen isebenzisana ne-serotonin, enye yeekhemikhali zemvakalelo zengqondo — ngoko xa amanqanaba ee-hormone etshintsha, iimvakalelo nazo zinokutshintsha.",
    other:
      "Awusakwazi ukunyamezela utywala njengangaphambili? I-oestrogen isebenzisana ne-histamine — ikhemikhali esemva kokusabela okufana ne-allergy — kwaye abanye abafazi baphawula uvakalelo olutsha kwiminyaka ephakathi. Awuzicingeli nje.",
    mindset:
      "Akuze kube semva kwexesha ukucela uncedo. Ezinye iimpawu — kuquka ezesini nezesinyi — zisabela kakuhle kunyango nokuba kudlule iminyaka emingaphi ukususela kwi-menopause.",
  },
};

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

  for (const [key, next] of Object.entries(rewords[lang])) {
    const old = obj.questionnaire?.facts?.[key];
    if (old === undefined) {
      console.log(`${lang}: facts.${key} MISSING — skipped`);
      continue;
    }
    if (old === next) {
      console.log(`${lang}: facts.${key} already updated`);
      continue;
    }
    const from = JSON.stringify(old);
    const to = JSON.stringify(next);
    if (!raw.includes(from)) throw new Error(`${lang}: facts.${key} old value not found in raw`);
    raw = raw.replace(from, to);
    console.log(`${lang}: facts.${key} reworded`);
  }

  if (!obj.exhibition?.story?.disclaimer) {
    raw = raw.replace(/"story":\s*\{/, `"story": {\n      "disclaimer": ${JSON.stringify(disclaimers[lang])},`);
    console.log(`${lang}: story.disclaimer added`);
  }

  JSON.parse(raw); // validate before write
  writeFileSync(path, raw, "utf8");
}
