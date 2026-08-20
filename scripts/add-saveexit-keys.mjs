// One-shot: questionnaire save-and-exit chip + autosave reassurance keys.
// Files are canonically serialized, so parse -> mutate -> stringify is safe.
import { readFileSync, writeFileSync } from "node:fs";

const keys = {
  en: {
    saveExit: "Save and exit",
    autosaveNote: "Your answers save automatically on this device. You can leave and pick up any time.",
  },
  af: {
    saveExit: "Stoor en verlaat",
    autosaveNote: "Jou antwoorde stoor outomaties op hierdie toestel. Jy kan enige tyd verlaat en later voortgaan.",
  },
  zu: {
    saveExit: "Gcina uphume",
    autosaveNote: "Izimpendulo zakho zigcinwa ngokuzenzakalela kule divayisi. Ungahamba futhi uqhubeke noma nini.",
  },
  xh: {
    saveExit: "Gcina uphume",
    autosaveNote: "Iimpendulo zakho zigcinwa ngokuzenzekelayo kule divayisi. Ungahamba uze uqhubeke nanini na.",
  },
};

for (const lang of ["en", "af", "zu", "xh"]) {
  const path = `public/locales/${lang}/common.json`;
  const obj = JSON.parse(readFileSync(path, "utf8"));
  let added = 0;
  for (const [k, v] of Object.entries(keys[lang])) {
    if (obj.questionnaire[k] === undefined) {
      obj.questionnaire[k] = v;
      added++;
    }
  }
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n", "utf8");
  console.log(`${lang}: ${added} keys added`);
}
