"use client";

/**
 * Admin MFA enrollment / management. Admin role + AAL2 are gated by the
 * AdminShell — but this very page is exempted from the redirect (so admins
 * can complete enrollment without being bounced).
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/server/supabase/browser";
import {
  listMyMfaFactors,
  wipeMyMfaFactors,
} from "@/server/actions/admin-mfa";
import { fetchCurrentUserRole } from "@/server/actions/me";

/**
 * Phase 16: extract the Supabase AuthError shape (code / status /
 * message). Phase 20: only superadmins see this raw formatting — for
 * regular admins we render a friendly fallback (see `friendlyError`)
 * since `code: mfa_factor_name_conflict · status: 422` reads as
 * unhelpful tech-speak to a non-developer admin.
 */
function describeAuthError(e: unknown): string {
  if (e && typeof e === "object") {
    const err = e as { code?: string; status?: number; message?: string };
    const bits = [
      err.code && `code: ${err.code}`,
      typeof err.status === "number" && `status: ${err.status}`,
      err.message,
    ].filter(Boolean);
    if (bits.length) return bits.join(" · ");
  }
  return e instanceof Error ? e.message : String(e);
}

/** Phase 20: friendly catch-all for non-superadmin error display. */
function friendlyError(): string {
  return "Something went wrong setting up two-factor authentication. Try again, or use ‘Start over’ if it keeps failing.";
}

type Stage =
  | "loading"
  | "needsFactor"
  | "needsChallenge"
  | "enrolled"
  /** Both MFA probes failed → MFA is not enabled at the Supabase project
   *  level. Phase 14: surface this explicitly instead of leaving the page
   *  blank. */
  | "mfa-unavailable";

export default function AdminSecurityPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [stage, setStage] = useState<Stage>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Phase 20: gate developer affordances (Diagnose button, raw error
  // codes, Supabase-dashboard instructions) to superadmin only. Regular
  // admins see a friendlier surface.
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const { role } = await fetchCurrentUserRole();
        setIsSuperadmin(role === "superadmin");
      } catch {
        /* default false — fail safe */
      }
    })();
  }, []);

  /** Show the technical error formatting to superadmin, friendly fallback
   *  to everyone else. Console always has the raw object. */
  const errorFor = (e: unknown): string =>
    isSuperadmin ? describeAuthError(e) : friendlyError();

  /** Inspect the user's current MFA posture and route to the right stage.
   *
   *  Phase 14: every Supabase MFA call is wrapped in its own try/catch so
   *  the page never stalls on a thrown promise. If BOTH probes fail, we
   *  treat the project as not having MFA enabled and render an explicit
   *  "MFA isn't available on this project" panel — better than a silent
   *  blank screen. The previous code left `stage = "loading"` forever in
   *  this case (the "Checking your MFA posture…" line) which read as a
   *  blank pane inside the AdminShell loading state.
   */
  const reload = async () => {
    setError(null);
    setStage("loading");
    let factorsOk = true;
    let aalOk = true;
    let factors: { totp?: { id: string; status: string }[] } | null = null;
    let aal: { currentLevel?: string | null } | null = null;
    try {
      const r = await supabase.auth.mfa.listFactors();
      if (r.error) factorsOk = false;
      else factors = r.data ?? null;
    } catch {
      factorsOk = false;
    }
    try {
      const r = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (r.error) aalOk = false;
      else aal = r.data ?? null;
    } catch {
      aalOk = false;
    }
    if (!factorsOk && !aalOk) {
      setStage("mfa-unavailable");
      return;
    }
    const verified = (factors?.totp ?? []).find((f) => f.status === "verified");
    if (!verified) {
      setStage("needsFactor");
      return;
    }
    if (aal?.currentLevel === "aal2") {
      setStage("enrolled");
      return;
    }
    // Has a verified factor but session is still AAL1 — need a challenge to step up.
    setFactorId(verified.id);
    setStage("needsChallenge");
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEnrollment = async () => {
    setError(null);
    setPending(true);
    try {
      // Phase 13 swept unverified TOTP factors before enrolling, but that
      // wasn't enough: Supabase's `auth.mfa_factors` table has a unique
      // constraint on (user_id, friendly_name, factor_type) and `enroll`
      // defaults `friendly_name` to "". Any prior factor with the empty
      // default — verified OR unverified — collides:
      //   "A factor with the friendly name '' for this user already exists"
      //
      // Phase 15 fixes the root cause two ways:
      //   (a) Pass a unique, timestamped `friendlyName` to `enroll()` so
      //       the unique constraint can never collide with stale rows.
      //   (b) Capture per-call errors in the unenroll cleanup so silent
      //       failures stop hiding the real problem.
      // The "Reset MFA — start over" button (below) is the escape hatch
      // for the case where a verified factor from a previous partial flow
      // is wedging the user out.
      const { data: existing, error: listErr } = await supabase.auth.mfa.listFactors();
      if (listErr) throw listErr;
      const unenrollErrors: string[] = [];
      for (const f of existing?.totp ?? []) {
        if (f.status !== "verified") {
          const { error: uErr } = await supabase.auth.mfa.unenroll({
            factorId: f.id,
          });
          if (uErr) {
            unenrollErrors.push(`${f.id.slice(0, 8)}: ${uErr.message}`);
          }
        }
      }
      if (unenrollErrors.length > 0) {
        // Don't throw — try the enroll anyway. With the unique
        // friendlyName below, the leftover unverified factor shouldn't
        // matter. The console.warn gives us a paper trail if it does.
        // eslint-disable-next-line no-console
        console.warn("[mfa] stale-factor cleanup partial:", unenrollErrors);
      }
      // Phase 16: random suffix on top of the ISO timestamp guarantees
      // uniqueness even if the user clicks twice within the same second.
      const rand = Math.random().toString(36).slice(2, 8);
      const friendlyName = `Mandi Admin (${new Date().toISOString()} ${rand})`;
      const { data, error: err } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName,
      });
      if (err || !data) {
        throw err ?? new Error("Enrollment returned no data");
      }
      setFactorId(data.id);
      setQrSvg(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStage("needsChallenge");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[mfa] enroll failed:", e);
      setError(errorFor(e));
    } finally {
      setPending(false);
    }
  };

  /**
   * Phase 16 escape hatch — server-side wipe via service-role admin API.
   * The Supabase MFA docs require AAL2 for client-side `unenroll`, which
   * deadlocks any user with a stale unverified factor blocking new
   * enrollment. Service-role `auth.admin.mfa.deleteFactor` bypasses
   * that AAL gate.
   *
   * Self-targeted on the server (no user-supplied userId — the server
   * action resolves it from the session). Returns the deleted count so
   * we can surface a friendly summary.
   *
   * After wiping, call `refreshSession()` so the JWT reflects the new
   * factor-free state immediately (per the docs note about AAL refresh
   * intervals).
   */
  const wipeAllFactors = async () => {
    setError(null);
    setPending(true);
    try {
      const { deleted, errors } = await wipeMyMfaFactors();
      if (errors.length > 0) {
        // eslint-disable-next-line no-console
        console.warn("[mfa] server wipe partial:", errors);
      }
      // Drop the JWT's stale AAL claim so AdminShell + reload() see the
      // new zero-factor state without waiting for the refresh interval.
      await supabase.auth.refreshSession();
      setFactorId(null);
      setQrSvg(null);
      setSecret(null);
      await reload();
      setError(
        deleted === 0
          ? "No factors to remove."
          : `Removed ${deleted} factor${deleted === 1 ? "" : "s"}. Try Start enrollment now.`,
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[mfa] server wipe failed:", e);
      setError(errorFor(e));
    } finally {
      setPending(false);
    }
  };

  /**
   * Phase 16 diagnose — calls the service-role listFactors so we see
   * EVERY factor on the user (verified, unverified, abandoned). Useful
   * when enrollment keeps failing with cryptic 422s — gives us a
   * console.table dump + an on-page summary count.
   */
  const diagnose = async () => {
    setError(null);
    setPending(true);
    try {
      const { factors } = await listMyMfaFactors();
      // eslint-disable-next-line no-console
      console.table(factors);
      const totpCount = factors.filter((f) => f.factor_type === "totp").length;
      setError(
        factors.length === 0
          ? "No MFA factors on your account."
          : `Found ${factors.length} factor${factors.length === 1 ? "" : "s"} (${totpCount} TOTP). Console has the full list.`,
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[mfa] diagnose failed:", e);
      setError(errorFor(e));
    } finally {
      setPending(false);
    }
  };

  const verifyCode = async () => {
    if (!factorId || !code) return;
    setError(null);
    setPending(true);
    const { data: chall, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr || !chall) {
      setPending(false);
      setError(cErr?.message ?? "Challenge failed");
      return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: chall.id,
      code,
    });
    setPending(false);
    if (vErr) {
      setError(vErr.message);
      return;
    }
    setCode("");
    // Phase 16: per Supabase docs, the JWT's AAL claim only updates
    // after a session refresh. Force it now so AdminShell sees AAL2
    // immediately and doesn't bounce us back to /admin/security.
    await supabase.auth.refreshSession();
    await reload();
    // Phase 18: full-page navigation instead of `router.replace + refresh`.
    // The combo invalidates Next's server cache mid-render and flashed
    // a brief unstyled tree on the way to /admin (FOUC). A hard browser
    // navigation guarantees the new AAL2 cookie is read fresh, CSS is
    // already in cache, and AdminShell mounts once with the correct
    // status. Slower by a frame, but no FOUC.
    window.location.assign("/admin");
  };

  const unenroll = async () => {
    if (!factorId) return;
    setPending(true);
    const { data: factors } = await supabase.auth.mfa.listFactors();
    for (const f of factors?.totp ?? []) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    setPending(false);
    setFactorId(null);
    setQrSvg(null);
    setSecret(null);
    void reload();
  };

  return (
    <div className="px-6 sm:px-10 py-10 max-w-2xl mx-auto">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">
          Security
        </p>
        <h1 className="font-display text-4xl text-brown">Two-factor authentication</h1>
        <p className="text-brown/65 mt-2 max-w-xl">
          Add a second login step using an authenticator app on your phone.
          Once set up, you&rsquo;ll enter a 6-digit code along with your email
          and password to reach the most sensitive admin areas.
        </p>
      </header>

      {error && (
        <div className="mb-5 bg-terra/10 border border-terra/30 text-terra rounded-2xl px-5 py-3 text-sm flex items-center justify-between gap-4 flex-wrap">
          <span className="flex-1 min-w-0">{error}</span>
          <div className="flex items-center gap-4 flex-shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => void reload()}
              disabled={pending}
              className="text-xs font-semibold underline whitespace-nowrap disabled:opacity-50"
            >
              Retry
            </button>
            {isSuperadmin && (
              <button
                type="button"
                onClick={() => void diagnose()}
                disabled={pending}
                className="text-xs font-semibold underline whitespace-nowrap disabled:opacity-50"
              >
                Diagnose
              </button>
            )}
            <button
              type="button"
              onClick={() => void wipeAllFactors()}
              disabled={pending}
              className="text-xs font-semibold underline whitespace-nowrap disabled:opacity-50"
            >
              Start over
            </button>
          </div>
        </div>
      )}

      {stage === "loading" && (
        <p className="text-brown/55 text-sm">Checking your security settings…</p>
      )}

      {stage === "mfa-unavailable" && (
        <section className="bg-cream-soft rounded-3xl shadow-warm p-7 space-y-4">
          <h2 className="font-display text-2xl text-brown">
            Two-factor auth isn&rsquo;t set up on this workspace yet.
          </h2>
          {isSuperadmin ? (
            <>
              <p className="text-brown/75 text-sm leading-relaxed">
                TOTP authentication needs to be turned on at the Supabase
                project level before admins can enrol. Until it is, the
                admin area stays accessible (no one&rsquo;s locked out),
                but the step-up gate on sensitive actions is off.
              </p>
              <p className="text-brown/75 text-sm leading-relaxed">
                To turn it on:{" "}
                <span className="font-mono text-xs bg-cream-deep/40 px-2 py-0.5 rounded">
                  Supabase Dashboard → Authentication → Providers → enable TOTP
                </span>
                . Then come back here and click Retry.
              </p>
            </>
          ) : (
            <p className="text-brown/75 text-sm leading-relaxed">
              Ask a superadmin to enable two-factor authentication for the
              workspace. Once they do, this page will let you set up your
              authenticator app.
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => void reload()}
              disabled={pending}
              className="bg-terra text-cream font-semibold rounded-full px-5 py-2.5 hover:bg-terra-dark transition-colors disabled:opacity-50"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="text-brown/65 hover:text-terra text-sm font-semibold px-3 py-2.5"
            >
              Back to admin
            </button>
          </div>
        </section>
      )}

      {stage === "needsFactor" && (
        // Phase 17: this panel ONLY shows the Start enrollment button +
        // diagnostic affordances. The QR display lives in the
        // `needsChallenge && qrSvg` branch below — `startEnrollment`
        // advances stage to needsChallenge as it sets qrSvg, so keeping
        // the QR markup inside this panel would unmount it the instant
        // it became renderable (the Phase-16 ghost-Start-button bug).
        <section className="bg-cream-soft rounded-3xl shadow-warm p-7 space-y-5">
          <h2 className="font-display text-2xl text-brown">Set up your authenticator app</h2>
          <p className="text-brown/75 text-sm leading-relaxed">
            Use Google Authenticator, 1Password, Authy, or any similar app.
            You&rsquo;ll scan a QR code with it, then enter the 6-digit code
            it shows you.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={startEnrollment}
              disabled={pending}
              className="bg-terra text-cream font-semibold rounded-full px-6 py-3 hover:bg-terra-dark transition-colors disabled:opacity-50"
            >
              {pending ? "Starting…" : "Start setup"}
            </button>
            <button
              onClick={() => void wipeAllFactors()}
              disabled={pending}
              className="text-xs text-brown/60 hover:text-terra underline disabled:opacity-50"
              title="Remove any existing authenticator setup and start fresh. Useful if you ran into a problem partway through earlier."
            >
              Stuck? Start over
            </button>
            {isSuperadmin && (
              <button
                onClick={() => void diagnose()}
                disabled={pending}
                className="text-xs text-brown/40 hover:text-terra underline disabled:opacity-50"
                title="List every MFA factor on your account (open browser console to see the table)."
              >
                Diagnose
              </button>
            )}
          </div>
        </section>
      )}

      {stage === "needsChallenge" && qrSvg && (
        // Phase 17: fresh enrollment just succeeded — render the QR +
        // secret + 6-digit code form. Verifying advances stage to
        // `enrolled`. The "Start over" link is the escape hatch if the
        // user scanned a different QR earlier or hit a snag with their
        // authenticator app.
        <section className="bg-cream-soft rounded-3xl shadow-warm p-7 space-y-5">
          <h2 className="font-display text-2xl text-brown">
            Scan the QR with your authenticator
          </h2>
          <p className="text-brown/75 text-sm leading-relaxed">
            Open Google Authenticator / 1Password / Authy and scan this code.
            Then enter the 6-digit code it shows.
          </p>
          <div className="space-y-4">
            <div
              aria-label="MFA QR code"
              className="inline-block bg-white p-3 rounded-2xl shadow-warm"
              // The QR comes back as an inline <svg> data URI from Supabase.
              dangerouslySetInnerHTML={{ __html: dataUriToSvg(qrSvg) }}
            />
            {secret && (
              <p className="text-xs text-brown/55 font-mono break-all">
                Or enter this secret manually: <span className="text-brown">{secret}</span>
              </p>
            )}
            <CodeForm
              code={code}
              setCode={setCode}
              onSubmit={verifyCode}
              pending={pending}
              label="Enter the 6-digit code"
            />
          </div>
          <button
            onClick={() => void wipeAllFactors()}
            disabled={pending}
            className="text-xs text-brown/55 hover:text-terra underline disabled:opacity-50"
          >
            Start over with a fresh QR
          </button>
        </section>
      )}

      {stage === "needsChallenge" && !qrSvg && (
        // Returning user: verified factor on the account but session is
        // still AAL1. No QR — just the step-up challenge form.
        <section className="bg-cream-soft rounded-3xl shadow-warm p-7 space-y-5">
          <h2 className="font-display text-2xl text-brown">Verify with your authenticator</h2>
          <p className="text-brown/75 text-sm leading-relaxed">
            Open your authenticator app and enter the current 6-digit code to
            finish signing in.
          </p>
          <CodeForm
            code={code}
            setCode={setCode}
            onSubmit={verifyCode}
            pending={pending}
            label="6-digit code"
          />
          <button
            onClick={unenroll}
            disabled={pending}
            className="text-xs text-brown/55 hover:text-terra"
          >
            Lost access to your authenticator? Set up a new one.
          </button>
        </section>
      )}

      {stage === "enrolled" && (
        <section className="bg-cream-soft rounded-3xl shadow-warm p-7">
          <h2 className="font-display text-2xl text-brown mb-3">You&rsquo;re set.</h2>
          <p className="text-brown/75 text-sm leading-relaxed mb-5">
            Two-factor authentication is on. From now on you&rsquo;ll be asked
            for a 6-digit code from your authenticator app to reach the most
            sensitive admin areas.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => router.push("/admin")}
              className="bg-terra text-cream font-semibold rounded-full px-6 py-3 hover:bg-terra-dark transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={unenroll}
              disabled={pending}
              className="text-sm text-brown/65 underline hover:text-terra"
            >
              Remove this authenticator
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function CodeForm({
  code,
  setCode,
  onSubmit,
  pending,
  label,
}: {
  code: string;
  setCode: (v: string) => void;
  onSubmit: () => void;
  pending: boolean;
  label: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
      className="flex flex-col sm:flex-row gap-3"
    >
      <label className="flex-1 flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brown/60">
          {label}
        </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="bg-cream border-2 border-coral/30 focus:border-terra rounded-xl px-4 py-3 text-brown text-center font-mono text-lg tracking-[0.4em] focus:shadow-warm transition-all"
        />
      </label>
      <button
        type="submit"
        disabled={pending || code.length !== 6}
        className="bg-terra text-cream font-semibold rounded-xl px-6 py-3 hover:bg-terra-dark transition-colors disabled:opacity-50"
      >
        {pending ? "Verifying…" : "Verify"}
      </button>
    </form>
  );
}

/** Supabase returns the QR as a data URI; render it directly if it's an svg. */
function dataUriToSvg(dataUri: string): string {
  if (dataUri.startsWith("data:image/svg+xml")) {
    const m = /;base64,([^"]+)/.exec(dataUri);
    if (m) {
      try {
        return atob(m[1]);
      } catch {
        /* fall through */
      }
    }
    // Fall back to img tag for non-base64 data URIs.
  }
  // Use an Image element rendered via dangerouslySetInnerHTML so QR also works
  // when the SDK returns a PNG data URI.
  const escaped = dataUri.replace(/"/g, "&quot;");
  return `<img alt="" src="${escaped}" style="display:block;width:192px;height:192px" />`;
}

