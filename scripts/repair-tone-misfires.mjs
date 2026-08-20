// Repair the tone-pass misfires: the string-value replace hit the first
// occurrence of duplicated values, clobbering unrelated keys across two runs.
// Fix by PATH (parse -> mutate -> canonical re-serialize), restoring
// clobbered keys from git HEAD and applying the intended edits precisely.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const getPath = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);
const setPath = (obj, path, value) => {
  const keys = path.split(".");
  const last = keys.pop();
  const parent = keys.reduce((o, k) => o?.[k], obj);
  if (parent === undefined) throw new Error(`parent missing for ${path}`);
  parent[last] = value;
};

// Keys that may have been clobbered by first-occurrence replaces: restore
// from HEAD unless they were themselves intended targets.
const RESTORE_FROM_HEAD = [
  "landing.cta",
  "landing.close.cta",
  "landing.close.title",
  "questionnaire.resumeTitle",
  "nav.login",
  "auth.signup.haveCta",
  "journey.signedOutCta",
  "journey.pdf.signedOutCta",
];

// Intended values that must hold after repair (per language).
const INTENDED = {
  en: {
    "about.cta.button": "Start your blanket",
    "auth.login.title": "Good to see you.",
    "auth.login.submit": "Sign in",
    "auth.login.newCta": "Join the Mandi journey",
    "auth.signup.submit": "Join the Mandi journey",
  },
  af: {
    "about.cta.button": "Begin jou kombers",
    "auth.login.title": "Goed om jou te sien.",
    "auth.login.submit": "Teken in",
    "auth.login.newCta": "Sluit aan by die Mandi-reis",
    "auth.signup.submit": "Sluit aan by die Mandi-reis",
  },
};

for (const lang of ["en", "af", "zu", "xh"]) {
  const path = `public/locales/${lang}/common.json`;
  const obj = JSON.parse(readFileSync(path, "utf8"));
  const head = JSON.parse(
    execSync(`git show HEAD:${path}`, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }),
  );

  for (const key of RESTORE_FROM_HEAD) {
    const headVal = getPath(head, key);
    if (headVal === undefined) continue;
    if (getPath(obj, key) !== headVal) {
      console.log(`${lang}: restored ${key}`);
      setPath(obj, key, headVal);
    }
  }
  for (const [key, value] of Object.entries(INTENDED[lang] ?? {})) {
    if (getPath(obj, key) === undefined) {
      console.log(`${lang}: ${key} missing, skipped`);
      continue;
    }
    if (getPath(obj, key) !== value) {
      console.log(`${lang}: set ${key}`);
      setPath(obj, key, value);
    }
  }

  // Canonical re-serialize (2-space, trailing newline) — kills the
  // first-occurrence-replace hazard for good; other scripts parse JSON.
  writeFileSync(path, JSON.stringify(obj, null, 2) + "\n", "utf8");
  console.log(`${lang}: written`);
}
