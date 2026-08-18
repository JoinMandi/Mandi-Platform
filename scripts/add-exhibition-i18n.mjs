// One-shot: insert the exhibition.* block into all four locale files,
// preserving existing content byte-for-byte (UTF-8 safe, unlike a
// PowerShell Get-Content/Set-Content round-trip). Idempotent.
import { readFileSync, writeFileSync } from "node:fs";

const blocks = {
  en: {
    attract: { title: "Every woman has a story. Stitch yours.", cta: "Tap to begin" },
    consent: {
      title: "A quick taste of Mandi",
      body: "Eight gentle questions, under two minutes. Nothing is stored unless you choose to leave your email at the end.",
      cta: "Let's stitch",
    },
    reveal: {
      heading: "Your blanket, so far",
      scoreLabel: "Your demo MenoScore",
      band: {
        mild: "Your symptoms look mild — staying informed is the best next stitch.",
        moderate: "Your symptoms look moderate — you are not imagining it, and you are not alone.",
        significant: "Your symptoms look significant — a doctor who understands menopause can change everything.",
      },
      cta: "Get my blanket",
    },
    email: {
      title: "Take your blanket home",
      body: "Leave your email and Mandi will send you your results — and let you know the moment we launch.",
      placeholder: "your@email.com",
      consent: "Store my email and demo answers so Mandi can send me my results and launch news.",
      cta: "Send my blanket",
      skip: "No thanks",
    },
    thanks: {
      title: "Sala kahle. Totsiens. Goodbye, for now.",
      bodyKiosk: "Thank you for stitching with us — please hand the tablet back.",
      bodyPhone: "Watch your inbox. Your full blanket is waiting at joinmandi.com.",
      fullCta: "Stitch the full blanket",
    },
  },
  af: {
    attract: { title: "Elke vrou het 'n storie. Stik joune.", cta: "Tik om te begin" },
    consent: {
      title: "'n Vinnige voorsmakie van Mandi",
      body: "Agt sagte vrae, onder twee minute. Niks word gestoor nie, tensy jy kies om jou e-pos aan die einde te los.",
      cta: "Kom ons stik",
    },
    reveal: {
      heading: "Jou kombers, tot dusver",
      scoreLabel: "Jou demo-MenoScore",
      band: {
        mild: "Jou simptome lyk lig — om ingelig te bly is die beste volgende steek.",
        moderate: "Jou simptome lyk matig — jy verbeel jou nie, en jy is nie alleen nie.",
        significant: "Jou simptome lyk beduidend — 'n dokter wat menopouse verstaan, kan alles verander.",
      },
      cta: "Kry my kombers",
    },
    email: {
      title: "Neem jou kombers huis toe",
      body: "Los jou e-pos en Mandi stuur jou resultate — en laat weet jou die oomblik wat ons loods.",
      placeholder: "jou@epos.com",
      consent: "Stoor my e-pos en demo-antwoorde sodat Mandi my resultate en loodsnuus kan stuur.",
      cta: "Stuur my kombers",
      skip: "Nee dankie",
    },
    thanks: {
      title: "Totsiens, vir eers.",
      bodyKiosk: "Dankie dat jy saam met ons gestik het — gee asseblief die tablet terug.",
      bodyPhone: "Hou jou inboks dop. Jou volle kombers wag by joinmandi.com.",
      fullCta: "Stik die volle kombers",
    },
  },
  zu: {
    attract: { title: "Wonke owesifazane unendaba. Thunga eyakho.", cta: "Thepha ukuqala" },
    consent: {
      title: "Ukunambitha okusheshayo kukaMandi",
      body: "Imibuzo eyisishiyagalombili emnene, ngaphansi kwemizuzu emibili. Akukho okugcinwayo ngaphandle kokuthi ukhethe ukushiya i-imeyili yakho ekugcineni.",
      cta: "Asithunge",
    },
    reveal: {
      heading: "Ingubo yakho, kuze kube manje",
      scoreLabel: "I-MenoScore yakho yedemo",
      band: {
        mild: "Izimpawu zakho zibukeka zilula — ukuhlala unolwazi kuyisinyathelo esilandelayo esihle kakhulu.",
        moderate: "Izimpawu zakho zibukeka ziphakathi — awuzicabangeli nje, futhi awuwedwa.",
        significant: "Izimpawu zakho zibukeka zinzima — udokotela oqonda i-menopause angashintsha konke.",
      },
      cta: "Ngithathele ingubo yami",
    },
    email: {
      title: "Hamba nengubo yakho",
      body: "Shiya i-imeyili yakho uMandi uzokuthumelela imiphumela yakho — futhi akwazise ngesikhathi esiqala ngaso.",
      placeholder: "eyakho@imeyili.com",
      consent: "Gcina i-imeyili yami nezimpendulo zedemo ukuze uMandi angithumelele imiphumela yami nezindaba zokwethulwa.",
      cta: "Thumela ingubo yami",
      skip: "Cha ngiyabonga",
    },
    thanks: {
      title: "Sala kahle, okwamanje.",
      bodyKiosk: "Siyabonga ngokuthunga nathi — sicela ubuyisele ithebulethi.",
      bodyPhone: "Bheka ibhokisi lakho le-imeyili. Ingubo yakho ephelele ikulindile ku-joinmandi.com.",
      fullCta: "Thunga ingubo ephelele",
    },
  },
  xh: {
    attract: { title: "Wonke umfazi unebali. Thunga elakho.", cta: "Cofa ukuqalisa" },
    consent: {
      title: "Incasa ekhawulezayo kaMandi",
      body: "Imibuzo esibhozo ethambileyo, ngaphantsi kwemizuzu emibini. Akukho nto igcinwayo ngaphandle kokuba ukhethe ukushiya i-imeyile yakho ekupheleni.",
      cta: "Masithunge",
    },
    reveal: {
      heading: "Ingubo yakho, ukuza kuthi ga ngoku",
      scoreLabel: "I-MenoScore yakho yedemo",
      band: {
        mild: "Iimpawu zakho zibonakala zilula — ukuhlala unolwazi lelona nyathelo lilandelayo lilungileyo.",
        moderate: "Iimpawu zakho zibonakala ziphakathi — awuzicingeli nje, kwaye awuwedwa.",
        significant: "Iimpawu zakho zibonakala zinzulu — ugqirha oyiqondayo i-menopause unokutshintsha yonke into.",
      },
      cta: "Ndifunele ingubo yam",
    },
    email: {
      title: "Goduka nengubo yakho",
      body: "Shiya i-imeyile yakho uMandi uya kukuthumelela iziphumo zakho — kwaye akwazise ngexesha esisungula ngalo.",
      placeholder: "eyakho@imeyile.com",
      consent: "Gcina i-imeyile yam neempendulo zedemo ukuze uMandi andithumelele iziphumo zam neendaba zokusungulwa.",
      cta: "Thumela ingubo yam",
      skip: "Hayi enkosi",
    },
    thanks: {
      title: "Sala kakuhle, okwangoku.",
      bodyKiosk: "Enkosi ngokuthunga nathi — nceda ubuyisele ithebhulethi.",
      bodyPhone: "Jonga ibhokisi yakho ye-imeyile. Ingubo yakho epheleleyo ikulindile ku-joinmandi.com.",
      fullCta: "Thunga ingubo epheleleyo",
    },
  },
};

// v2 — the scrollable results story (no score). cute.* = one playful line
// per domain; facts themselves reuse questionnaire.facts.{domain}.
const storyBlocks = {
  en: {
    intro: { title: "Your blanket tells a story", sub: "Scroll down — every patch you stitched has something to say." },
    cute: {
      "context": "Every story starts somewhere.",
      "mind-cognition": "Losing words mid-sentence? They're not lost — just on a tea break.",
      "mood": "Feelings doing somersaults? There's a reason.",
      "nervous-system": "Your body has been sending you postcards.",
      "body": "Aches that arrived uninvited? We see them.",
      "urogenital": "The things nobody talks about — we talk about them.",
      "other": "The 'wait, THAT's menopause?' section.",
      "quality-of-life": "It touches the things you love. That matters.",
      "mindset": "You showed up. That's the biggest stitch of all.",
    },
    factLabel: "Why this happens",
    hormoneHook: {
      title: "It's not you. It's your hormones.",
      body: "Almost everything you just read traces back to shifting oestrogen and progesterone. Understanding them is the key to feeling like yourself again — and that's exactly what Mandi is for.",
      cta: "Learn how hormones work on joinmandi.com",
    },
    none: {
      title: "Your blanket looks calm — lucky you!",
      body: "No strong symptoms today. Menopause arrives differently for every woman — and knowing what to look for is the best head start there is.",
    },
  },
  af: {
    intro: { title: "Jou kombers vertel 'n storie", sub: "Rol af — elke lappie wat jy gestik het, het iets te sê." },
    cute: {
      "context": "Elke storie begin êrens.",
      "mind-cognition": "Woorde wat wegraak? Hulle is nie weg nie — net gou op 'n teepouse.",
      "mood": "Gevoelens wat bollemakiesie slaan? Daar is 'n rede.",
      "nervous-system": "Jou liggaam stuur vir jou poskaarte.",
      "body": "Pyne wat ongenooid opgedaag het? Ons sien hulle.",
      "urogenital": "Die dinge waaroor niemand praat nie — ons praat daaroor.",
      "other": "Die 'wag, is DIT menopouse?'-afdeling.",
      "quality-of-life": "Dit raak die dinge wat jy liefhet. Dit maak saak.",
      "mindset": "Jy het opgedaag. Dis die grootste steek van almal.",
    },
    factLabel: "Hoekom dit gebeur",
    hormoneHook: {
      title: "Dis nie jy nie. Dis jou hormone.",
      body: "Byna alles wat jy nou net gelees het, kom van veranderende estrogeen en progesteroon. Om hulle te verstaan is die sleutel om weer soos jouself te voel — en dis presies waarvoor Mandi daar is.",
      cta: "Leer hoe hormone werk op joinmandi.com",
    },
    none: {
      title: "Jou kombers lyk rustig — gelukkige jy!",
      body: "Geen sterk simptome vandag nie. Menopouse kom vir elke vrou anders — en om te weet waarna om te kyk, is die beste voorsprong wat daar is.",
    },
  },
  zu: {
    intro: { title: "Ingubo yakho ixoxa indaba", sub: "Skrolela phansi — yonke ingcephe oyithungile inokuthile ezokusho." },
    cute: {
      "context": "Yonke indaba iqala ndawana thize.",
      "mind-cognition": "Amagama alahlekayo phakathi komusho? Awalahlekile — asekhefini letiye nje.",
      "mood": "Imizwa eyenza amasaka? Kunesizathu.",
      "nervous-system": "Umzimba wakho ubulokhu ukuthumelela amaposikhadi.",
      "body": "Ubuhlungu obufike bungamenywanga? Siyabubona.",
      "urogenital": "Izinto okungakhulunywa ngazo — thina sikhuluma ngazo.",
      "other": "Isigaba se-'ima, LOKHO yi-menopause?'",
      "quality-of-life": "Kuthinta izinto ozithandayo. Lokho kubalulekile.",
      "mindset": "Ufikile. Lowo ngumthungo omkhulu kunayo yonke.",
    },
    factLabel: "Kungani lokhu kwenzeka",
    hormoneHook: {
      title: "Akuwena. Ngama-hormone akho.",
      body: "Cishe konke osanda kukufunda kubuyela ku-oestrogen ne-progesterone eshintshayo. Ukuwaqonda kuyisihluthulelo sokuphinde uzizwe unguwe — futhi yilokho kanye uMandi akhona ngakho.",
      cta: "Funda ukuthi ama-hormone asebenza kanjani ku-joinmandi.com",
    },
    none: {
      title: "Ingubo yakho ibukeka izolile — unenhlanhla!",
      body: "Azikho izimpawu ezinamandla namuhla. I-menopause ifika ngokwehlukile kuwo wonke owesifazane — futhi ukwazi okufanele ukubheke kuyisiqalo esihle kunazo zonke.",
    },
  },
  xh: {
    intro: { title: "Ingubo yakho ibalisa ibali", sub: "Skrola uye ezantsi — yonke ilaphu olithungileyo linento yokuthetha." },
    cute: {
      "context": "Lonke ibali liqala kwindawo ethile.",
      "mind-cognition": "Amagama alahlekayo phakathi kwesivakalisi? Awalahlekanga — akwikhefu leti nje.",
      "mood": "Iimvakalelo ezenza amajika? Kukho isizathu.",
      "nervous-system": "Umzimba wakho ubusoloko ukuthumelela iiposikhadi.",
      "body": "Iintlungu ezifike zingamenywanga? Siyazibona.",
      "urogenital": "Izinto ekungathethwa ngazo — thina sithetha ngazo.",
      "other": "Icandelo le-'yima, LEYO yi-menopause?'",
      "quality-of-life": "Ichaphazela izinto ozithandayo. Oko kubalulekile.",
      "mindset": "Ufikile. Ngowona mthungo mkhulu ke lowo.",
    },
    factLabel: "Kutheni oku kusenzeka",
    hormoneHook: {
      title: "Ayinguwe. Zii-hormone zakho.",
      body: "Phantse yonke into osanda kuyifunda ibuyela kwi-oestrogen ne-progesterone etshintshayo. Ukuziqonda sisitshixo sokuphinda uzive ungowakho — kwaye yiloo nto kanye uMandi akhoyo ngayo.",
      cta: "Funda indlela ii-hormone ezisebenza ngayo ku-joinmandi.com",
    },
    none: {
      title: "Ingubo yakho ibonakala izolile — unethamsanqa!",
      body: "Akukho zimpawu zinamandla namhlanje. I-menopause ifika ngokwahlukileyo kumfazi ngamnye — kwaye ukwazi omawukhangele kuyeyona ntshayelelo ilungileyo ikhoyo.",
    },
  },
};

// v3 — variant C chat response bank (EN/AF verbatim from the prototype's COPY
// section; zu/xh machine drafts flagged for review) + variant B page gate +
// richer capture form strings (prototype p_* keys).
const chatBlocks = {
  en: {
    "mind-cognition": {
      hi: { "1": "That word-finding feeling — it isn't your mind failing you.", "2": "Your memory isn't broken. Hormones reach it too." },
      lo: { "1": "Good. Your clarity is holding.", "2": "Thank you — useful to know." },
    },
    "nervous-system": {
      hi: { "1": "Sleep is where it starts for a lot of women. You're not alone.", "2": "Your body is keeping you up at night. That counts." },
      lo: { "1": "Good — your nights are holding.", "2": "Thank you." },
    },
    "body": {
      hi: { "1": "Your body is talking. This isn't just getting older.", "2": "It's real, and it's well documented." },
      lo: { "1": "Thank you — noted.", "2": "Good." },
    },
    "other": {
      hi: { "1": "Yes — that one surprises almost everybody.", "2": "It's menopause. Really." },
      lo: { "1": "Good to know.", "2": "Thank you." },
    },
    "quality-of-life": {
      hi: { "1": "This is where symptoms reach your life. It counts most.", "2": "Thank you. This is the part people don't see." },
      lo: { "1": "Thank you.", "2": "Noted." },
    },
  },
  af: {
    "mind-cognition": {
      hi: { "1": "Daai woord-soek gevoel — dis nie jou kop wat jou faal nie.", "2": "Jou geheue is nie stukkend nie. Hormone raak dit ook." },
      lo: { "1": "Goed so. Jou helderheid hou nog stand.", "2": "Dankie — dis nuttig om te weet." },
    },
    "nervous-system": {
      hi: { "1": "Slaap is waar dit vir baie vroue begin. Jy is nie alleen nie.", "2": "Jou lyf hou jou snags wakker. Dit tel." },
      lo: { "1": "Goed — jou nagte hou nog.", "2": "Dankie." },
    },
    "body": {
      hi: { "1": "Jou lyf praat. Dit is nie sommer net ouer word nie.", "2": "Dit is regtig, en dit is bekend." },
      lo: { "1": "Dankie — genoteer.", "2": "Goed so." },
    },
    "other": {
      hi: { "1": "Ja — daai een verras byna almal.", "2": "Dis menopouse. Regtig." },
      lo: { "1": "Goed om te weet.", "2": "Dankie." },
    },
    "quality-of-life": {
      hi: { "1": "Dit is waar simptome lewens raak. Dit tel die meeste.", "2": "Dankie. Dit is die deel wat mense nie sien nie." },
      lo: { "1": "Dankie.", "2": "Genoteer." },
    },
  },
  zu: {
    "mind-cognition": {
      hi: { "1": "Lowo muzwa wokulahlekelwa amagama — akusiyo ingqondo yakho ekwehlulayo.", "2": "Inkumbulo yakho ayiphukile. Ama-hormone ayayifinyelela nayo." },
      lo: { "1": "Kuhle. Ukucaca kwakho kusabambile.", "2": "Siyabonga — kuyasiza ukwazi." },
    },
    "nervous-system": {
      hi: { "1": "Ubuthongo yilapho kuqala khona kwabaningi besifazane. Awuwedwa.", "2": "Umzimba wakho ukugcina uphapheme ebusuku. Lokho kubalulekile." },
      lo: { "1": "Kuhle — ubusuku bakho busabambile.", "2": "Siyabonga." },
    },
    "body": {
      hi: { "1": "Umzimba wakho uyakhuluma. Lokhu akusikho nje ukuguga.", "2": "Kuyiqiniso, futhi kuyaziwa." },
      lo: { "1": "Siyabonga — kuqashelwe.", "2": "Kuhle." },
    },
    "other": {
      hi: { "1": "Yebo — leyo imangaza cishe wonke umuntu.", "2": "Yi-menopause. Ngempela." },
      lo: { "1": "Kuhle ukwazi.", "2": "Siyabonga." },
    },
    "quality-of-life": {
      hi: { "1": "Yilapho izimpawu zifinyelela khona empilweni yakho. Kubaluleke kakhulu.", "2": "Siyabonga. Le yingxenye abantu abangayiboni." },
      lo: { "1": "Siyabonga.", "2": "Kuqashelwe." },
    },
  },
  xh: {
    "mind-cognition": {
      hi: { "1": "Loo mvakalelo yokulahlekelwa ngamagama — ayiyongqondo yakho ekusilelayo.", "2": "Inkumbulo yakho ayaphukanga. Ii-hormone ziyayifikelela nayo." },
      lo: { "1": "Kulungile. Ukucaca kwakho kusabambile.", "2": "Enkosi — kuluncedo ukwazi." },
    },
    "nervous-system": {
      hi: { "1": "Ubuthongo kulapho kuqala khona kubafazi abaninzi. Awuwedwa.", "2": "Umzimba wakho ukugcina uphaphile ebusuku. Oko kubalulekile." },
      lo: { "1": "Kulungile — ubusuku bakho busabambile.", "2": "Enkosi." },
    },
    "body": {
      hi: { "1": "Umzimba wakho uyathetha. Oku akukokuguga nje.", "2": "Kuyinyani, kwaye kuyaziwa." },
      lo: { "1": "Enkosi — kuqwalaselwe.", "2": "Kulungile." },
    },
    "other": {
      hi: { "1": "Ewe — leyo imangalisa phantse wonke umntu.", "2": "Yi-menopause. Ngenene." },
      lo: { "1": "Kulungile ukwazi.", "2": "Enkosi." },
    },
    "quality-of-life": {
      hi: { "1": "Kulapho iimpawu zifikelela khona ebomini bakho. Kubaluleke kakhulu.", "2": "Enkosi. Le yinxalenye abantu abangayiboniyo." },
      lo: { "1": "Enkosi.", "2": "Kuqwalaselwe." },
    },
  },
};

const captureBlocks = {
  en: {
    pageGate: "Answer all four to continue.",
    whatsapp: "WhatsApp number (optional)",
    whatsappPlaceholder: "082 000 0000",
    age: "Your age (optional)",
    ages: { "40-44": "40–44", "45-49": "45–49", "50-54": "50–54", "55-59": "55–59", "60plus": "60+", "none": "Prefer not to say" },
    marketing: "Yes, Mandi may contact me about my full assessment, events and support. I can tell them to stop at any time.",
    finePrint: "We never share your details. You can ask us to erase everything at any time.",
  },
  af: {
    pageGate: "Antwoord al vier om voort te gaan.",
    whatsapp: "WhatsApp-nommer (opsioneel)",
    whatsappPlaceholder: "082 000 0000",
    age: "Jou ouderdom (opsioneel)",
    ages: { "40-44": "40–44", "45-49": "45–49", "50-54": "50–54", "55-59": "55–59", "60plus": "60+", "none": "Verkies om nie te sê nie" },
    marketing: "Ja, Mandi mag my kontak oor my volledige assessering, geleenthede en ondersteuning. Ek kan enige tyd sê ek wil nie meer nie.",
    finePrint: "Ons deel nooit jou besonderhede nie. Jy kan enige tyd vra dat ons alles uitvee.",
  },
  zu: {
    pageGate: "Phendula zozine ukuze uqhubeke.",
    whatsapp: "Inombolo ye-WhatsApp (uma uthanda)",
    whatsappPlaceholder: "082 000 0000",
    age: "Iminyaka yakho (uma uthanda)",
    ages: { "40-44": "40–44", "45-49": "45–49", "50-54": "50–54", "55-59": "55–59", "60plus": "60+", "none": "Ngincamela ukungasho" },
    marketing: "Yebo, uMandi angangithinta mayelana nokuhlolwa kwami okuphelele, imicimbi nokwesekwa. Ngingasho noma nini ukuthi angabe esangithinta.",
    finePrint: "Asisoze sabelane ngemininingwane yakho. Ungacela ukuthi sisule konke noma nini.",
  },
  xh: {
    pageGate: "Phendula zone ukuze uqhubeke.",
    whatsapp: "Inombolo ye-WhatsApp (ukuba uyathanda)",
    whatsappPlaceholder: "082 000 0000",
    age: "Iminyaka yakho (ukuba uyathanda)",
    ages: { "40-44": "40–44", "45-49": "45–49", "50-54": "50–54", "55-59": "55–59", "60plus": "60+", "none": "Ndikhetha ukungatsho" },
    marketing: "Ewe, uMandi angandiqhagamshelana malunga novavanyo lwam olupheleleyo, imisitho nenkxaso. Ndingatsho nanini na ukuba mayeke.",
    finePrint: "Asisoze sabelane ngeenkcukacha zakho. Ungacela ukuba sicime yonke into nanini na.",
  },
};

/** Insert a named sub-block into the exhibition object if missing. */
function mergeSub(raw, name, obj) {
  if (JSON.parse(raw).exhibition[name]) return { raw, added: false };
  const inner = JSON.stringify(obj, null, 2)
    .split("\n")
    .map((l, i) => (i === 0 ? l : "    " + l))
    .join("\n");
  const updated = raw.replace(/"exhibition":\s*\{/, `"exhibition": {\n    "${name}": ${inner},`);
  JSON.parse(updated); // throws if malformed — nothing written
  return { raw: updated, added: true };
}

for (const [lang, block] of Object.entries(blocks)) {
  const path = `public/locales/${lang}/common.json`;
  let raw = readFileSync(path, "utf8");

  if (!JSON.parse(raw).exhibition) {
    const inner = JSON.stringify(block, null, 2)
      .split("\n")
      .map((l, i) => (i === 0 ? l : "  " + l))
      .join("\n");
    raw = raw.replace(/\}\s*$/, `,\n  "exhibition": ${inner}\n}\n`);
    JSON.parse(raw); // throws if malformed — nothing written
    console.log(`${lang}: exhibition block added`);
  }

  for (const [name, source] of [
    ["story", storyBlocks],
    ["chat", chatBlocks],
    ["capture", captureBlocks],
  ]) {
    const r = mergeSub(raw, name, source[lang]);
    raw = r.raw;
    console.log(`${lang}: ${name} ${r.added ? "added" : "already present"}`);
  }
  writeFileSync(path, raw, "utf8");
}
