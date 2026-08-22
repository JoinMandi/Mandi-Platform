// Idempotent: adds the pre-launch keys (roadmap.keep.*, footer.getInvolved,
// landing.media.*) to all four locales. Node only — never round-trip these
// files through PowerShell (mojibake). zu/xh are machine drafts for the
// translator; en + af are authored.
import { readFileSync, writeFileSync } from "node:fs";

const CREDITS =
  "MrsKing Productions · produced by Hermi King · directed by Hanneke Schutte · Silwerskermfees 2026";

const KEYS = {
  en: {
    "roadmap.keep": {
      eyebrow: "Keep your blanket",
      title: "Keep your MenoScore and your Blanket safe",
      body: "Right now your blanket lives only on this device. Leave your email, and WhatsApp if you like, and Mandi will keep it safe for you. You'll also be first to hear as the Mandi journey grows.",
      consent: "Yes, Mandi may keep my details and my blanket, and get in touch with me about them.",
      submit: "Keep my blanket",
      thanksTitle: "Your blanket is safe with Mandi.",
      thanksBody: "Thank you for joining the Mandi journey. We'll be in touch, in your language.",
    },
    "footer.getInvolved": "Questions, a story to share, or want to get involved? Write to us at",
    "landing.media": {
      eyebrow: "In the media",
      seriesTitle: "Meer as warm gloede (More Than Hot Flushes)",
      seriesBody: "A four-part Afrikaans documentary series on kykNET that breaks the silence around menopause, following Antoinette Louw and the South African women and experts who speak openly about what really changes.",
      seriesCredits: CREDITS,
      seriesCta: "See the series at Silwerskermfees",
      radioTitle: "Channel Africa: Cultural Spotlight",
      radioBody: "Producer Hermi King in conversation with Mmatsheko Mosito on why menopause, seen through an African lens, is a story that needed telling.",
      radioCta: "Listen to the interview",
    },
  },
  af: {
    "roadmap.keep": {
      eyebrow: "Hou jou kombers",
      title: "Hou jou MenoScore en jou Kombers veilig",
      body: "Op die oomblik leef jou kombers net op hierdie toestel. Los jou e-pos, en WhatsApp as jy wil, en Mandi hou dit veilig vir jou. Jy hoor ook eerste soos die Mandi-reis groei.",
      consent: "Ja, Mandi mag my besonderhede en my kombers hou, en my daaroor kontak.",
      submit: "Hou my kombers",
      thanksTitle: "Jou kombers is veilig by Mandi.",
      thanksBody: "Dankie dat jy by die Mandi-reis aansluit. Ons sal in verbinding tree, in jou taal.",
    },
    "footer.getInvolved": "Vrae, 'n storie om te deel, of wil jy betrokke raak? Skryf aan ons by",
    "landing.media": {
      eyebrow: "In die media",
      seriesTitle: "Meer as warm gloede",
      seriesBody: "'n Vierdelige Afrikaanse dokumentêre reeks op kykNET wat die stilte rondom menopouse oopbreek, saam met Antoinette Louw en die Suid-Afrikaanse vroue en kenners wat eerlik praat oor wat werklik verander.",
      seriesCredits: "MrsKing Productions · vervaardig deur Hermi King · regie Hanneke Schutte · Silwerskermfees 2026",
      seriesCta: "Sien die reeks by Silwerskermfees",
      radioTitle: "Channel Africa: Cultural Spotlight",
      radioBody: "Vervaardiger Hermi King in gesprek met Mmatsheko Mosito oor hoekom menopouse, deur 'n Afrika-lens, 'n storie is wat vertel moes word.",
      radioCta: "Luister na die onderhoud",
    },
  },
  zu: {
    "roadmap.keep": {
      eyebrow: "Gcina ingubo yakho",
      title: "Gcina i-MenoScore yakho nengubo yakho kuphephile",
      body: "Njengamanje ingubo yakho ihlala kuphela kule divayisi. Shiya i-imeyili yakho, ne-WhatsApp uma uthanda, uMandi uzoyigcina iphephile. Uzozwa kuqala njengoba uhambo lukaMandi lukhula.",
      consent: "Yebo, uMandi angagcina imininingwane yami nengubo yami, angithinte ngazo.",
      submit: "Gcina ingubo yami",
      thanksTitle: "Ingubo yakho iphephile kuMandi.",
      thanksBody: "Siyabonga ngokujoyina uhambo lukaMandi. Sizoxhumana nawe, ngolimi lwakho.",
    },
    "footer.getInvolved": "Imibuzo, indaba ongayabelana, noma ufuna ukubamba iqhaza? Sibhalele ku",
    "landing.media": {
      eyebrow: "Emithonjeni yezindaba",
      seriesTitle: "Meer as warm gloede (More Than Hot Flushes)",
      seriesBody: "Uchungechunge lwedokhumentari yesi-Afrikaans olunezingxenye ezine ku-kykNET oluphula ukuthula mayelana nokuphela kokuya esikhathini, lulandela u-Antoinette Louw nabesifazane baseNingizimu Afrika nochwepheshe abakhuluma ngokukhululekile ngalokho okushintsha ngempela.",
      seriesCredits: CREDITS,
      seriesCta: "Bona uchungechunge e-Silwerskermfees",
      radioTitle: "Channel Africa: Cultural Spotlight",
      radioBody: "Umkhiqizi u-Hermi King exoxa no-Mmatsheko Mosito ngokuthi kungani ukuphela kokuya esikhathini, ngeso lase-Afrika, kuyindaba okwakufanele ixoxwe.",
      radioCta: "Lalela ingxoxo",
    },
  },
  xh: {
    "roadmap.keep": {
      eyebrow: "Gcina ingubo yakho",
      title: "Gcina i-MenoScore yakho nengubo yakho ikhuselekile",
      body: "Ngoku ingubo yakho ihlala kuphela kwesi sixhobo. Shiya i-imeyile yakho, ne-WhatsApp ukuba uyathanda, uMandi uza kuyigcina ikhuselekile. Uza kuva kuqala njengoko uhambo lukaMandi lukhula.",
      consent: "Ewe, uMandi angagcina iinkcukacha zam nengubo yam, andiqhagamshelane ngazo.",
      submit: "Gcina ingubo yam",
      thanksTitle: "Ingubo yakho ikhuselekile kuMandi.",
      thanksBody: "Enkosi ngokujoyina uhambo lukaMandi. Siza kuqhagamshelana nawe, ngolwimi lwakho.",
    },
    "footer.getInvolved": "Imibuzo, ibali onokulabelana ngalo, okanye ufuna ukubandakanyeka? Sibhalele ku",
    "landing.media": {
      eyebrow: "Kumajelo eendaba",
      seriesTitle: "Meer as warm gloede (More Than Hot Flushes)",
      seriesBody: "Uthotho lwedokhumentari yesiAfrikaans olunamacandelo amane ku-kykNET oluphula ukuthula malunga nokuphela kokuya exesheni, lulandela u-Antoinette Louw nabafazi boMzantsi Afrika neengcali abathetha ngokukhululekileyo ngoko kutshintsha ngokwenene.",
      seriesCredits: CREDITS,
      seriesCta: "Bona uthotho e-Silwerskermfees",
      radioTitle: "Channel Africa: Cultural Spotlight",
      radioBody: "Umvelisi u-Hermi King encokola no-Mmatsheko Mosito malunga nokuba kutheni ukuphela kokuya exesheni, ngeliso lase-Afrika, kulibali ekwakufuneka libaliswe.",
      radioCta: "Mamela udliwano-ndlebe",
    },
  },
};

for (const [lang, entries] of Object.entries(KEYS)) {
  const path = `public/locales/${lang}/common.json`;
  const json = JSON.parse(readFileSync(path, "utf8"));
  for (const [dotted, value] of Object.entries(entries)) {
    const parts = dotted.split(".");
    let node = json;
    for (const p of parts.slice(0, -1)) node = node[p] ??= {};
    node[parts.at(-1)] = value;
  }
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`${lang}: ok`);
}
