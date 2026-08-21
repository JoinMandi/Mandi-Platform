// One-shot: add exhibition.chat.greeting (the lead-in bubble before Q1).
// UTF-8 safe, idempotent; "chat": { is unique per locale file (verified).
import { readFileSync, writeFileSync } from "node:fs";

const greetings = {
  en: "Hi, I'm Mandi. I have eight quick questions about how you've been feeling lately — just tap the answer that fits.",
  af: "Hallo, ek is Mandi. Ek het agt vinnige vrae oor hoe jy die laaste tyd voel — tik net die antwoord wat pas.",
  zu: "Sawubona, nginguMandi. Nginemibuzo eyisishiyagalombili esheshayo mayelana nokuthi uzizwa kanjani muva nje — vele uthephe impendulo efanele.",
  xh: "Molo, ndinguMandi. Ndinemibuzo esibhozo ekhawulezayo malunga nendlela oziva ngayo kutshanje — cofa nje impendulo efanelekileyo.",
};

for (const lang of ["en", "af", "zu", "xh"]) {
  const path = `public/locales/${lang}/common.json`;
  let raw = readFileSync(path, "utf8");
  const obj = JSON.parse(raw);
  if (obj.exhibition?.chat?.greeting) {
    console.log(`${lang}: already present`);
    continue;
  }
  raw = raw.replace(/"chat":\s*\{/, `"chat": {\n      "greeting": ${JSON.stringify(greetings[lang])},`);
  const check = JSON.parse(raw);
  if (check.exhibition?.chat?.greeting !== greetings[lang]) {
    throw new Error(`${lang}: greeting not in exhibition.chat — aborting`);
  }
  writeFileSync(path, raw, "utf8");
  console.log(`${lang}: greeting added`);
}
