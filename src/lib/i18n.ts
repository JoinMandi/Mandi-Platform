import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../../public/locales/en/common.json";
import afCommon from "../../public/locales/af/common.json";
import zuCommon from "../../public/locales/zu/common.json";
import xhCommon from "../../public/locales/xh/common.json";

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { common: enCommon },
        af: { common: afCommon },
        zu: { common: zuCommon },
        xh: { common: xhCommon },
      },
      defaultNS: "common",
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: "mandi-lang",
        caches: ["localStorage"],
      },
    });
}

export default i18n;
