import Link from "next/link";
import { getSessionUser } from "@/server/auth";

export const metadata = { title: "Two-factor authentication — Mandi Admin" };

/** MFA is managed by the Cognito hosted UI, not by this app. */
export default async function AdminSecurityPage() {
  const user = await getSessionUser();

  return (
    <div className="px-6 sm:px-10 py-10 max-w-3xl mx-auto">
      <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
        Account security
      </p>
      <h1 className="font-display text-3xl text-brown mb-4">Two-factor authentication</h1>

      <div className="bg-cream-soft rounded-3xl shadow-warm p-7 space-y-4">
        <p className="text-brown/75 text-sm leading-relaxed">
          Mandi staff accounts require a time-based one-time password (TOTP).
          Enrolment and recovery are handled by the Mandi sign-in service
          (Amazon Cognito), not by this page.
        </p>

        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-brown/50 uppercase tracking-[0.15em] text-[11px] font-semibold">
              Signed in as
            </dt>
            <dd className="text-brown">{user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-brown/50 uppercase tracking-[0.15em] text-[11px] font-semibold">
              Role
            </dt>
            <dd className="text-brown font-mono">{user?.role ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-brown/50 uppercase tracking-[0.15em] text-[11px] font-semibold">
              This session
            </dt>
            <dd className={user?.mfa ? "text-green-700" : "text-terra"}>
              {user?.mfa ? "MFA completed (AAL2)" : "Password only (AAL1)"}
            </dd>
          </div>
        </dl>

        <p className="text-brown/60 text-sm">
          To enrol a new authenticator, sign out and sign in again; Cognito
          offers TOTP setup on first sign-in. If you have lost your device, ask a
          superadmin to reset your factors.
        </p>

        <Link href="/admin" className="link-warm text-terra text-sm inline-block">
          ← Back to the dashboard
        </Link>
      </div>
    </div>
  );
}
