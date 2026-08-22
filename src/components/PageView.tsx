"use client";

/**
 * First-party page-impression logging into `engagement_events`. No cookies,
 * no third-party script, no CSP change. `session_id` is the POPIA session id
 * set at consent (`mandi-session`).
 * ponytail: pre-consent returners are uncounted; add a random visitor id if that gap matters.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logEngagement } from "@/server/actions/engagement";

export default function PageView() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    // window.location, not useSearchParams(): the latter forces a Suspense
    // boundary / CSR bailout for every statically rendered page.
    const source = new URLSearchParams(window.location.search).get("source");
    void logEngagement({
      eventType: "page_view",
      targetId: pathname,
      sessionId: localStorage.getItem("mandi-session"),
      meta: {
        lang: localStorage.getItem("mandi-lang") ?? "en",
        ...(source ? { source } : {}),
      },
    });
  }, [pathname]);
  return null;
}
