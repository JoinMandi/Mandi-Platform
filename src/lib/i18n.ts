import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "../../public/locales/en/common.json";
import afCommon from "../../public/locales/af/common.json";
import zuCommon from "../../public/locales/zu/common.json";
import xhCommon from "../../public/locales/xh/common.json";

/**
 * i18n initialises with English as the language ALWAYS.
 *
 * We deliberately do NOT install LanguageDetector here. A detector that reads
 * localStorage runs only on the client and produces a different result from the
 * server (which has no localStorage), causing every translated string in the
 * SSR'd HTML to mismatch the client's first render — a hydration warning per
 * translated element.
 *
 * Instead, `I18nProvider` reads the saved language in a post-mount effect and
 * calls `i18n.changeLanguage(...)`. That keeps server + first-client-render
 * identical (English), then swaps to the saved language after hydration.
 */
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { common: enCommon },
      af: { common: afCommon },
      zu: { common: zuCommon },
      xh: { common: xhCommon },
    },
    lng: "en",
    defaultNS: "common",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

export default i18n;

export const LANG_STORAGE_KEY = "mandi-lang";
