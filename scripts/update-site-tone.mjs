// Main-site tone pass to the exhibition standard: de-diagnose, de-assume,
// possibility framing, mission CTAs, POPIA overclaims -> factual promises.
// EN + AF authored (festival languages); ZU/XH keep their existing valid
// translations of the previous copy and are flagged for the translator
// queue. Path-based value replacement, UTF-8 safe, idempotent.
// roadmap.safety.* is NEVER touched (clinically frozen).
import { readFileSync, writeFileSync } from "node:fs";

const edits = {
  en: {
    // landing
    "landing.browseCta": "Check out the Mandi journey",
    "landing.reassurance": "Private. Free. We never share your details.",
    "landing.built.line4": "Free to use. Your details stay yours. Always.",
    "landing.inside.read.body": "Plain-language education. Twenty-three years of misunderstanding, finally being untangled.",
    // consent
    "consent.title": "Ready when you are.",
    "consent.body": "Mandi will ask you fifty-six gentle questions about how you have been feeling. It takes about ten minutes, and every answer stitches a patch into a blanket that is yours alone.",
    "consent.body2": "Your answers stay yours. We never sell or share your details, and you can ask us to erase everything at any time. That is your right in law (POPIA), and our promise either way.",
    "consent.checkbox": "Yes, Mandi may keep my answers to stitch my blanket and build my roadmap.",
    "consent.cta": "Let's stitch",
    // roadmap (safety.* untouched)
    "roadmap.band.mild.line": "Your answers suggest early signals. Staying curious now is a lovely head start.",
    "roadmap.band.moderate.line": "Your answers suggest this is touching your days. Support exists, and you deserve it.",
    "roadmap.band.significant.line": "Your answers suggest a lot is going on. You do not have to carry it alone, real help exists.",
    "roadmap.persona.sally.body": "What you are feeling is real, and so many women describe exactly this. There is support available to you, starting today.",
    "roadmap.persona.olga.headline": "Your answers are worth a closer look.",
    "roadmap.persona.olga.body": "Many women put things down to stress or ageing, and later find that hormones were part of the story too.",
    "roadmap.persona.vicky.headline": "You deserve to be heard.",
    "roadmap.persona.vicky.body": "If getting answers has been hard before, you are not alone, and it can go differently from here. Mandi will walk with you to the right care.",
    "roadmap.persona.nelly.headline": "You know a lot. Here is what research is saying now.",
    "roadmap.persona.retha.body": "Research on starting support later in life is more encouraging than many women have been told. There are options worth exploring.",
    "roadmap.steps.book-first.body": "Many women find that talking to an HRT-informed doctor changes everything. Find one who speaks your language and understands hormones.",
    "roadmap.steps.download-first.body": "Download a one-page summary of your symptom profile, MenoScore, and questions to ask. Many women say it changed their consultation.",
    "roadmap.steps.options-first.body": "Body-identical HRT, lifestyle approaches, integrative care. Understand what is available and what research is saying.",
    "roadmap.retake": "Bodies change with time, and so do answers. You can stitch a fresh blanket whenever you like.",
    // hrt
    "hrt.compare.intro": "Not all HRT is the same. That one distinction is the key to everything that follows.",
    "hrt.timeline.t2003.body": "The FDA applies class-wide black-box warnings to all HRT products, including body-identical hormones that were never part of the study. A generation of women is denied treatment based on findings that may not apply to them.",
    "hrt.timeline.t2008.body": "The E3N cohort study finds that body-identical progesterone does not carry the increased breast cancer risk seen with the synthetic progestin used in WHI. Researchers increasingly point to the specific synthetic used in 2002, rather than oestrogen itself.",
    "hrt.timeline.t2013.headline": "Follow-up data tells a different story about oestrogen.",
    "hrt.timeline.t2013.body": "A decade of WHI follow-up finds that oestrogen-only HRT was associated with lower breast cancer incidence and mortality in the women studied. It takes ten years for this to reach the public.",
    "hrt.timeline.t2025.body": "The US HHS and FDA announce the removal of broad black-box warnings. In its press release, the FDA suggests women who start HRT within 10 years of menopause may see substantially lower cardiovascular, Alzheimer's and fracture risk, figures researchers are still weighing.",
    "hrt.cta.questionnaire": "See what your symptoms say",
    // about
    "about.name.p3": "Mandi is that companion, a place to understand what your body is saying, in the language you feel most at home in.",
    "about.story.p1": "In my late 40s, I mentioned heart palpitations to two older colleagues over lunch. One immediately suggested I see a heart specialist. The other said it was just part of getting older. Neither mentioned menopause. Neither mentioned that heart palpitations are one of the many recognised symptoms of hormonal change. I had no idea.",
    "about.story.p2": "Soon thereafter I moved to Cape Town at the age of 50, ready for exciting new adventures. Instead, I ended up in hospital with a severe kidney infection caused by a bladder infection. I saw a urologist. My GP. A gynaecologist. Not one of them asked whether I was on HRT. Not one of them connected my recurring infections to my hormones, even though research keeps pointing to that link. They treated my symptoms, not the cause.",
    "about.vision.p2": "South Africa has twelve official languages. Most digital health platforms offer one: English. We can do so much better. Mandi is built to grow with the country, into every community where women have been left without informed answers and proper medical care.",
    "about.cta.button": "Start your blanket",
    // auth
    "auth.login.title": "Good to see you.",
    "auth.login.submit": "Sign in",
    "auth.login.newCta": "Join the Mandi journey",
    "auth.signup.title": "Start your Mandi journey.",
    "auth.signup.subtitle": "Keep your blanket safe, track how you feel, and watch your story unfold over time.",
    "auth.signup.submit": "Join the Mandi journey",
    "auth.strength.weak": "Not strong enough yet",
    "auth.strength.strong": "Beautifully strong",
    // journey
    "journey.intro": "Your blanket, your notes, your pace. Kept safe here for you.",
    "journey.checkins.threeMonthSub": "A full review, the three-month milestone specialists recommend.",
    "journey.pdf.footerLine1": "Generated by JoinMandi. This summary is yours, made from your own answers, downloaded because you chose to.",
    "journey.pdf.footerLine2": "Mandi never shares this document. Only you decide who sees it.",
    // resources
    "resources.title": "Knowledge that meets you where you are.",
    "resources.subhead": "Everything here is written in plain language and grounded in research, no jargon, no judgment, no selling.",
    "resources.intro": "Take what you need, at your own pace. The information you deserve to have, in words that make sense.",
    "resources.items.symptoms.title": "The many symptoms of hormonal change",
    "resources.items.symptoms.description": "Heart palpitations. Joint pain. Brain fog. Dry eyes. A guide to the whole landscape, so you can find yourself in it.",
    "resources.items.brain.description": "New research on oestrogen and the brain, and why the timing of treatment is such an active conversation among researchers.",
    "resources.notice1": "More resources are added regularly, prepared for review with our clinical partner Dr Funeka Bango.",
    // events
    "events.subhead": "Where women meet, learn and laugh together. Menopause was private, this is where it becomes communal.",
    "events.host.body": "A gynaecologist running a monthly Q&A, an NGO hosting a community morning, a workplace supporting its people. If you would like to gather women with Mandi, this platform is yours too, free to list.",
    "events.principle.line": "Community gatherings are always free. Expert sessions sometimes carry a fee.",
    // doctor
    "doctor.meetTitle": "Doctors who listen.",
    "doctor.hrtFriendly": "Open to HRT conversations",
    "doctor.contactBelow": "Reach her practice directly:",
    "doctor.profile.bookBody": "Booking happens directly with her practice, in a new tab. Your details go straight to them, never through Mandi.",
    "doctor.profile.notFoundBody": "We could not find her profile just now. The directory has the current list of practitioners.",
    "doctor.empty": "No clinics match your selection yet. New practitioners join all the time, check back soon.",
    // mothers
    "mothers.subhead": "For the women who came before us, whose bodies built the medicine we have today, and whose voices were not always honoured. This page remembers them.",
    "mothers.wall.intro": "Stories women have shared with us. Short, true, and kept anonymous.",
  },
  af: {
    "landing.browseCta": "Loer na die Mandi-reis",
    "landing.reassurance": "Privaat. Gratis. Ons deel nooit jou besonderhede nie.",
    "landing.built.line4": "Gratis om te gebruik. Jou besonderhede bly joune. Altyd.",
    "landing.inside.read.body": "Opvoeding in gewone taal. Drie en twintig jaar se misverstand wat uiteindelik ontrafel word.",
    "consent.title": "Gereed wanneer jy is.",
    "consent.body": "Mandi gaan jou ses en vyftig sagte vrae vra oor hoe jy voel. Dit neem omtrent tien minute, en elke antwoord stik 'n lappie in 'n kombers wat net joune is.",
    "consent.body2": "Jou antwoorde bly joune. Ons verkoop of deel nooit jou besonderhede nie, en jy kan enige tyd vra dat ons alles uitvee. Dit is jou reg in die wet (POPIA), en in elk geval ons belofte.",
    "consent.checkbox": "Ja, Mandi mag my antwoorde hou om my kombers te stik en my padkaart te bou.",
    "consent.cta": "Kom ons stik",
    "roadmap.band.mild.line": "Jou antwoorde dui op vroeë tekens. Om nou nuuskierig te bly is 'n pragtige voorsprong.",
    "roadmap.band.moderate.line": "Jou antwoorde dui daarop dat dit aan jou dae raak. Ondersteuning bestaan, en jy verdien dit.",
    "roadmap.band.significant.line": "Jou antwoorde dui daarop dat daar baie aangaan. Jy hoef dit nie alleen te dra nie, daar is regte hulp.",
    "roadmap.persona.sally.body": "Wat jy voel is eg, en soveel vroue beskryf presies dit. Daar is ondersteuning vir jou beskikbaar, van vandag af.",
    "roadmap.persona.olga.headline": "Jou antwoorde is 'n nadere kyk werd.",
    "roadmap.persona.olga.body": "Baie vroue skryf dinge aan stres of ouer word toe, en vind later dat hormone ook deel van die storie was.",
    "roadmap.persona.vicky.headline": "Jy verdien om gehoor te word.",
    "roadmap.persona.vicky.body": "As dit voorheen moeilik was om antwoorde te kry, is jy nie alleen nie, en dit kan van hier af anders verloop. Mandi stap saam met jou na die regte sorg.",
    "roadmap.persona.nelly.headline": "Jy weet baie. Hier is wat navorsing nou sê.",
    "roadmap.persona.retha.body": "Navorsing oor ondersteuning wat later in die lewe begin, is meer bemoedigend as wat baie vroue vertel is. Daar is opsies wat die moeite werd is om te verken.",
    "roadmap.steps.book-first.body": "Baie vroue vind dat 'n gesprek met 'n HRT-ingeligte dokter alles verander. Vind een wat jou taal praat en hormone verstaan.",
    "roadmap.steps.download-first.body": "Laai 'n eenbladsy-opsomming af van jou simptoomprofiel, MenoScore, en vrae om te vra. Baie vroue sê dit het hul konsultasie verander.",
    "roadmap.steps.options-first.body": "Liggaamsidentiese HRT, leefstylbenaderings, integrerende sorg. Verstaan wat beskikbaar is en wat navorsing sê.",
    "roadmap.retake": "Liggame verander met tyd, en so ook antwoorde. Jy kan enige tyd 'n vars kombers stik.",
    "hrt.compare.intro": "Nie alle HRT is dieselfde nie. Daardie een onderskeid is die sleutel tot alles wat volg.",
    "hrt.timeline.t2003.body": "Die FDA plaas omvattende waarskuwings op alle HRT-produkte, insluitend liggaamsidentiese hormone wat nooit deel van die studie was nie. 'n Generasie vroue word behandeling geweier op grond van bevindings wat dalk nie op hulle van toepassing is nie.",
    "hrt.timeline.t2008.body": "Die E3N-kohortstudie vind dat liggaamsidentiese progesteroon nie die verhoogde borskankerrisiko dra wat by die sintetiese progestien in WHI gesien is nie. Navorsers wys al hoe meer na die spesifieke sintetiese middel wat in 2002 gebruik is, eerder as estrogeen self.",
    "hrt.timeline.t2013.headline": "Opvolgdata vertel 'n ander storie oor estrogeen.",
    "hrt.timeline.t2013.body": "'n Dekade se WHI-opvolg vind dat estrogeen-alleen-HRT geassosieer was met laer borskankervoorkoms en -sterftes by die vroue wat bestudeer is. Dit neem tien jaar om die publiek te bereik.",
    "hrt.timeline.t2025.body": "Die Amerikaanse HHS en FDA kondig die verwydering van breë waarskuwings aan. In sy persverklaring stel die FDA voor dat vroue wat HRT binne 10 jaar ná menopouse begin, aansienlik laer kardiovaskulêre, Alzheimer- en fraktuurrisiko kan sien, syfers wat navorsers nog weeg.",
    "hrt.cta.questionnaire": "Kyk wat jou simptome sê",
    "about.name.p3": "Mandi is daardie metgesel, 'n plek om te verstaan wat jou liggaam sê, in die taal waarin jy die meeste tuis voel.",
    "about.story.p1": "In my laat 40's het ek hartkloppings teenoor twee ouer kollegas oor middagete genoem. Een het dadelik voorgestel ek sien 'n hartspesialis. Die ander het gesê dis net deel van ouer word. Nie een het menopouse genoem nie. Nie een het genoem dat hartkloppings een van die baie erkende simptome van hormonale verandering is nie. Ek het geen idee gehad nie.",
    "about.story.p2": "Kort daarna het ek op 50 na Kaapstad getrek, gereed vir opwindende nuwe avonture. In plaas daarvan het ek in die hospitaal beland met 'n ernstige nierinfeksie wat deur 'n blaasinfeksie veroorsaak is. Ek het 'n uroloog gesien. My huisarts. 'n Ginekoloog. Nie een het gevra of ek op HRT is nie. Nie een het my herhalende infeksies met my hormone verbind nie, al wys navorsing aanhoudend na daardie verband. Hulle het my simptome behandel, nie die oorsaak nie.",
    "about.vision.p2": "Suid-Afrika het twaalf amptelike tale. Die meeste digitale gesondheidsplatforms bied een: Engels. Ons kan soveel beter doen. Mandi is gebou om saam met die land te groei, tot in elke gemeenskap waar vroue sonder ingeligte antwoorde en behoorlike mediese sorg gelaat is.",
    "about.cta.button": "Begin jou kombers",
    "auth.login.title": "Goed om jou te sien.",
    "auth.login.submit": "Teken in",
    "auth.login.newCta": "Sluit aan by die Mandi-reis",
    "auth.signup.title": "Begin jou Mandi-reis.",
    "auth.signup.subtitle": "Hou jou kombers veilig, hou boek van hoe jy voel, en sien hoe jou storie oor tyd ontvou.",
    "auth.signup.submit": "Sluit aan by die Mandi-reis",
    "auth.strength.weak": "Nog nie sterk genoeg nie",
    "auth.strength.strong": "Pragtig sterk",
    "journey.intro": "Jou kombers, jou notas, jou pas. Hier veilig gehou vir jou.",
    "journey.checkins.threeMonthSub": "'n Volle hersiening, die drie-maande-mylpaal wat spesialiste aanbeveel.",
    "journey.pdf.footerLine1": "Gegenereer deur JoinMandi. Hierdie opsomming is joune, gemaak uit jou eie antwoorde, afgelaai omdat jy so gekies het.",
    "journey.pdf.footerLine2": "Mandi deel nooit hierdie dokument nie. Net jy besluit wie dit sien.",
    "resources.title": "Kennis wat jou ontmoet waar jy is.",
    "resources.subhead": "Alles hier is in gewone taal geskryf en in navorsing gegrond, geen jargon, geen oordeel, geen verkopery nie.",
    "resources.intro": "Neem wat jy nodig het, teen jou eie pas. Die inligting wat jy verdien om te hê, in woorde wat sin maak.",
    "resources.items.symptoms.title": "Die baie simptome van hormonale verandering",
    "resources.items.symptoms.description": "Hartkloppings. Gewrigspyn. Breinmis. Droë oë. 'n Gids tot die hele landskap, sodat jy jouself daarin kan vind.",
    "resources.items.brain.description": "Nuwe navorsing oor estrogeen en die brein, en hoekom die tydsberekening van behandeling so 'n lewendige gesprek onder navorsers is.",
    "resources.notice1": "Meer hulpbronne word gereeld bygevoeg, voorberei vir hersiening saam met ons kliniese vennoot Dr Funeka Bango.",
    "events.subhead": "Waar vroue mekaar ontmoet, leer en saam lag. Menopouse was privaat, hier word dit gemeenskaplik.",
    "events.host.body": "'n Ginekoloog met 'n maandelikse vraesessie, 'n NRO wat 'n gemeenskapsoggend aanbied, 'n werkplek wat sy mense ondersteun. As jy vroue saam met Mandi wil bymekaarbring, is hierdie platform ook joune, gratis om te lys.",
    "events.principle.line": "Gemeenskapsbyeenkomste is altyd gratis. Kundige sessies kan soms 'n fooi dra.",
    "doctor.meetTitle": "Dokters wat luister.",
    "doctor.hrtFriendly": "Oop vir HRT-gesprekke",
    "doctor.contactBelow": "Kontak haar praktyk direk:",
    "doctor.profile.bookBody": "Besprekings gebeur direk met haar praktyk, in 'n nuwe oortjie. Jou besonderhede gaan reguit na hulle, nooit deur Mandi nie.",
    "doctor.profile.notFoundBody": "Ons kon nie nou haar profiel vind nie. Die gids het die huidige lys praktisyns.",
    "doctor.empty": "Geen klinieke pas nog by jou keuse nie. Nuwe praktisyns sluit heeltyd aan, kom loer gou weer.",
    "mothers.subhead": "Vir die vroue wat voor ons gekom het, wie se liggame die medisyne gebou het wat ons vandag het, en wie se stemme nie altyd geëer is nie. Hierdie bladsy onthou hulle.",
    "mothers.wall.intro": "Stories wat vroue met ons gedeel het. Kort, waar, en anoniem gehou.",
  },
};

// New keys inserted per namespace (same value structure per language).
const adds = {
  en: {
    roadmap: { disclaimer: "Educational information only, not medical advice.", nextSteps: "Your next steps" },
    journey: { greetingNoName: "Welcome back." },
    landing: {
      mission: "Menopause understood, not endured. Intentional, destigmatised women's health, in your language, with an African voice.",
      footerLine: "JoinMandi.com · MrsKing Productions · August 2026",
    },
  },
  af: {
    roadmap: { disclaimer: "Slegs opvoedkundige inligting, nie mediese advies nie.", nextSteps: "Jou volgende treë" },
    journey: { greetingNoName: "Welkom terug." },
    landing: {
      mission: "Menopouse verstaan, nie verduur nie. Doelgerigte, gedestigmatiseerde vrouegesondheid, in jou taal, met 'n Afrika-stem.",
      footerLine: "JoinMandi.com · MrsKing Productions · Augustus 2026",
    },
  },
  zu: {
    roadmap: { disclaimer: "Ulwazi lwemfundo kuphela, akusiyo iseluleko sezokwelapha.", nextSteps: "Izinyathelo zakho ezilandelayo" },
    journey: { greetingNoName: "Siyakwamukela futhi." },
    landing: {
      mission: "I-menopause eqondwayo, hhayi ebekezelelwayo. Impilo yabesifazane ehlosiwe, engenakuhlazisa, ngolimi lwakho, ngezwi lase-Afrika.",
      footerLine: "JoinMandi.com · MrsKing Productions · Agasti 2026",
    },
  },
  xh: {
    roadmap: { disclaimer: "Lulwazi lwemfundo kuphela, ayisosiluleko sonyango.", nextSteps: "Amanyathelo akho alandelayo" },
    journey: { greetingNoName: "Wamkelekile kwakhona." },
    landing: {
      mission: "I-menopause eqondwayo, kungekhona enyanyezelwayo. Impilo yabafazi enenjongo, engenazintloni, ngolwimi lwakho, ngelizwi lase-Afrika.",
      footerLine: "JoinMandi.com · MrsKing Productions · Agasti 2026",
    },
  },
};

// Top-level namespace anchors that are unique in every locale file (keys are
// English in all languages; journey.roadmap starts with "emptyEyebrow" so the
// title/loading/eyebrow context disambiguates the top-level blocks).
const ANCHORS = {
  roadmap: /"roadmap":\s*\{\s*\n(\s*)"title"/,
  journey: /"journey":\s*\{\s*\n(\s*)"loading"/,
  landing: /"landing":\s*\{\s*\n(\s*)"eyebrow"/,
};

const getPath = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

for (const lang of ["en", "af", "zu", "xh"]) {
  const path = `public/locales/${lang}/common.json`;
  let raw = readFileSync(path, "utf8");
  const obj = JSON.parse(raw);

  for (const [keyPath, next] of Object.entries(edits[lang] ?? {})) {
    if (keyPath.startsWith("roadmap.safety")) throw new Error("safety strings are frozen");
    const old = getPath(obj, keyPath);
    if (old === undefined) {
      // en is the source of truth; other locales may have pre-existing gaps.
      if (lang === "en") throw new Error(`en: ${keyPath} missing`);
      console.log(`${lang}: ${keyPath} not present, skipped (translation gap)`);
      continue;
    }
    if (old === next) continue;
    const from = JSON.stringify(old);
    if (!raw.includes(from)) throw new Error(`${lang}: ${keyPath} old value not found`);
    raw = raw.replace(from, JSON.stringify(next));
  }
  console.log(`${lang}: ${Object.keys(edits[lang] ?? {}).length} tone edits applied`);

  for (const [ns, keys] of Object.entries(adds[lang])) {
    const missing = Object.entries(keys).filter(([k]) => getPath(obj, `${ns}.${k}`) === undefined);
    if (!missing.length) continue;
    if (!ANCHORS[ns].test(raw)) throw new Error(`${lang}: anchor for ${ns} not found`);
    // Insert every missing key in ONE replace — after the first insert the
    // anchor no longer matches, so per-key replaces silently no-op.
    raw = raw.replace(ANCHORS[ns], (m, indent) => {
      const lines = missing
        .map(([k, v]) => `${indent}"${k}": ${JSON.stringify(v)},\n`)
        .join("");
      return m.replace(/\{\s*\n/, `{\n${lines}`);
    });
    console.log(`${lang}: added ${missing.map(([k]) => `${ns}.${k}`).join(", ")}`);
  }

  const check = JSON.parse(raw); // validate before write
  for (const [ns, keys] of Object.entries(adds[lang])) {
    for (const key of Object.keys(keys)) {
      if (getPath(check, `${ns}.${key}`) === undefined) throw new Error(`${lang}: ${ns}.${key} failed to insert`);
    }
  }
  writeFileSync(path, raw, "utf8");
}
console.log("NOTE: zu/xh tone rewrites deferred to translator queue (em-dash sweep still applies).");
