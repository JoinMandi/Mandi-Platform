"use client";

import { useTranslation } from "react-i18next";

export const CONTACT_EMAIL = "info@joinmandi.com";

/** Site footer: one contact line. The address is visible text, so it still
 *  works where `mailto:` is inert (kiosks, browsers with no mail client). */
export default function Footer() {
  const { t } = useTranslation("common");
  return (
    <footer className="text-center py-8 px-4 space-y-2">
      <p className="text-brown/65 text-sm">
        {t("footer.getInvolved")}{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="link-warm text-terra font-semibold">
          {CONTACT_EMAIL}
        </a>
      </p>
      <p className="text-brown/50 text-xs">{t("landing.footerLine")}</p>
    </footer>
  );
}
