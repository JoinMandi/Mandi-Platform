// Audit the tone pass: for every intended edit, is the value at that path
// the intended NEW value? Also list any OTHER key that now holds one of the
// new values without being a target (first-occurrence misfire collateral).
import { readFileSync } from "node:fs";

// Re-declare the intended path->new maps by importing the script's data is
// not possible (it executes); duplicate the two maps' intent by reading the
// current en/af values against the shipped script would be circular. Instead:
// hardcode the intended values here from scripts/update-site-tone.mjs.
import { execSync } from "node:child_process";

const src = readFileSync("scripts/update-site-tone.mjs", "utf8");
const editsMatch = src.match(/const edits = \{[\s\S]*?\n\};/);
if (!editsMatch) throw new Error("could not extract edits");
// Safe: evaluating a literal object sliced out of our own checked-in script
// (scripts/update-site-tone.mjs), not external input. Dev-only tool.
const objectLiteral = editsMatch[0].replace("const edits = ", "").replace(/;\s*$/, "");
// eslint-disable-next-line no-eval
const edits = eval("(" + objectLiteral + ")");

const getPath = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

function walk(node, prefix, out) {
  if (typeof node === "string") {
    out.push([prefix, node]);
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) walk(v, prefix ? `${prefix}.${k}` : k, out);
  }
}

for (const lang of ["en", "af"]) {
  const obj = JSON.parse(readFileSync(`public/locales/${lang}/common.json`, "utf8"));
  const intended = edits[lang];
  const newValues = new Map(Object.entries(intended).map(([p, v]) => [v, p]));

  const misses = [];
  for (const [path, next] of Object.entries(intended)) {
    if (getPath(obj, path) !== next) misses.push(`${path} => "${String(getPath(obj, path)).slice(0, 60)}"`);
  }

  const all = [];
  walk(obj, "", all);
  const collaterals = all
    .filter(([p, v]) => newValues.has(v) && newValues.get(v) !== p && !p.startsWith("exhibition"))
    .map(([p, v]) => `${p} wrongly holds value intended for ${newValues.get(v)}`);

  console.log(`--- ${lang} ---`);
  console.log(misses.length ? "MISSED:\n  " + misses.join("\n  ") : "all intended edits landed");
  console.log(collaterals.length ? "COLLATERAL:\n  " + collaterals.join("\n  ") : "no collateral");
}
