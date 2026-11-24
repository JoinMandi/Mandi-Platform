"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchAdminContext } from "@/server/actions/admin";

type NavItem = {
  href: string;
  label: string;
  badgeKey?: "pendingStories" | "pendingEvents";
  /** Phase 13: superadmin-only nav items (audit log) are hidden from
   *  regular admins. */
  requiresSuperadmin?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin",          label: "Dashboard" },
  { href: "/admin/stories",  label: "Stories",  badgeKey: "pendingStories" },
  { href: "/admin/events",   label: "Events",   badgeKey: "pendingEvents" },
  { href: "/admin/content",  label: "Content" },
  { href: "/admin/clinics",  label: "Clinics" },
  { href: "/admin/doctors",  label: "Doctors" },
  { href: "/admin/users",    label: "Users" },
  { href: "/admin/audit",    label: "Audit log", requiresSuperadmin: true },
  // Phase 13: Security tab moved to the sidebar footer (MFA self-management
  // is personal, not a workspace surface). AdminShell still auto-redirects
  // to /admin/security when MFA enforcement requires enrollment.
];

type Status =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "no-role"; email: string | null }
  | { kind: "denied"; email: string | null; role: string }
  | {
      kind: "ok";
      email: string | null;
      mfaGap: boolean;
      isSuperadmin: boolean;
    };

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [badges, setBadges] = useState<{ pendingStories: number; pendingEvents: number }>({
    pendingStories: 0,
    pendingEvents: 0,
  });
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  // Phase 14: fetch admin context ONCE per mount. Previously the deps
  // included `pathname`, which re-ran every server action (and the
  // accompanying MFA probes + badge counts) on every sidebar click.
  // The MFA-gap redirect lives in a separate effect below so it can
  // still react to pathname without re-fetching context.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const ctx = await fetchAdminContext();
        if (cancelled) return;
        setBadges({
          pendingStories: ctx.pendingStories,
          pendingEvents: ctx.pendingEvents,
        });

        // Not signed in → kick to login. Middleware preserves ?next= and will
        // bounce us back here once we're authenticated.
        if (!ctx.signedIn) {
          router.replace(`/auth/login?next=${encodeURIComponent("/admin")}`);
          return;
        }

        // Signed in but no public.users row found. Don't bounce — surface it.
        if (ctx.role === null) {
          setStatus({ kind: "no-role", email: ctx.email });
          return;
        }

        // Signed in as non-admin → deny page (lets them sign out + retry).
        // Superadmin is a strict superset of admin so both flow through.
        if (ctx.role !== "admin" && ctx.role !== "superadmin") {
          setStatus({ kind: "denied", email: ctx.email, role: ctx.role });
          return;
        }

        // Admin. Gate only when MFA is actually available at the project level.
        const mfaGap = ctx.mfaAvailable
          ? !ctx.hasFactor || ctx.currentLevel !== "aal2"
          : false;
        setStatus({
          kind: "ok",
          email: ctx.email,
          mfaGap,
          isSuperadmin: ctx.isSuperadmin,
        });
      } catch (e) {
        if (cancelled) return;
        setStatus({
          kind: "error",
          message: e instanceof Error ? e.message : String(e),
        });
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentional empty deps — context is fetched once. router is stable
    // in app router; the cancelled flag handles unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 14: separate redirect effect — fires on every pathname change
  // OR when status transitions to "ok", but does NOT re-fetch context.
  useEffect(() => {
    if (status.kind !== "ok") return;
    if (status.mfaGap && pathname !== "/admin/security") {
      router.replace("/admin/security");
    }
  }, [status, pathname, router]);

  const signOut = () => {
    window.location.href = "/auth/logout";
  };

  if (status.kind === "loading") {
    // Phase 14: paint the shell immediately so navigation never feels
    // "stuck." Sidebar shows the NAV (minus superadmin-only items, which
    // we can't determine yet — those reveal after context loads) with
    // links disabled; the right pane is a generic skeleton.
    return <LoadingShell pathname={pathname ?? ""} />;
  }

  if (status.kind === "error") {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="bg-cream-soft rounded-4xl shadow-warm-xl p-10 max-w-lg">
          <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
            Admin failed to load
          </p>
          <p className="font-display text-2xl text-brown mb-3">Something went wrong.</p>
          <p className="text-brown/65 text-sm mb-6 font-mono break-words">
            {status.message}
          </p>
          <div className="flex gap-3">
            <button onClick={() => window.location.reload()} className="link-warm text-terra text-sm">
              Retry
            </button>
            <Link href="/" className="link-warm text-terra text-sm">Back to site</Link>
          </div>
        </div>
      </main>
    );
  }

  if (status.kind === "no-role") {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="bg-cream-soft rounded-4xl shadow-warm-xl p-10 max-w-lg">
          <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
            Account row missing
          </p>
          <p className="font-display text-2xl text-brown mb-3">
            Signed in as {status.email ?? "your account"}, but no Mandi profile row.
          </p>
          <p className="text-brown/75 text-sm mb-6 leading-relaxed">
            Ask a superadmin to create your <code>web.users</code> row with the right
            role. Staff accounts are provisioned, never self-created.
          </p>
          <div className="flex gap-3">
            <button onClick={() => window.location.reload()} className="link-warm text-terra text-sm">
              Retry
            </button>
            <button onClick={signOut} className="link-warm text-terra text-sm">Sign out</button>
          </div>
        </div>
      </main>
    );
  }

  if (status.kind === "denied") {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="bg-cream-soft rounded-4xl shadow-warm-xl p-10 text-center max-w-md">
          <p className="font-display text-2xl text-brown mb-3">Admin access only.</p>
          <p className="text-brown/65 text-sm mb-2">
            Signed in as <span className="font-medium">{status.email}</span> (role: <span className="font-mono">{status.role}</span>).
          </p>
          <p className="text-brown/65 text-sm mb-6">
            This area is for Mandi team members. If that should be you, ask another admin to promote you, or run the bootstrap SQL.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="link-warm text-terra text-sm">Back to site</Link>
            <button onClick={signOut} className="link-warm text-terra text-sm">Sign out</button>
          </div>
        </div>
      </main>
    );
  }

  // status.kind === "ok"
  const email = status.email;
  const isSuperadmin = status.isSuperadmin;
  // Phase 13: hide superadmin-only nav items from regular admins.
  const visibleNav = NAV.filter((item) => isSuperadmin || !item.requiresSuperadmin);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col bg-brown text-cream w-56 lg:w-64 flex-shrink-0 sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-cream/10">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/Mandi_Logo.svg"
              alt="Mandi"
              width={92}
              height={28}
              className="brightness-0 invert opacity-95"
            />
          </Link>
          <p className="text-[10px] uppercase tracking-[0.25em] text-golden font-semibold mt-2">
            Admin
          </p>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {visibleNav.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);
            const badge = item.badgeKey ? badges[item.badgeKey] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-colors
                  ${active
                    ? "bg-brown-deep/60 text-golden border-l-2 border-golden"
                    : "text-cream/75 hover:text-cream hover:bg-brown-deep/40"}`}
              >
                <span>{item.label}</span>
                {badge > 0 && (
                  <span className="text-[10px] bg-terra text-cream rounded-full px-2 py-0.5 font-semibold">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-cream/10 text-xs space-y-2">
          <p className="text-cream/50 truncate" title={email ?? ""}>{email}</p>
          {isSuperadmin && (
            <p className="text-[10px] uppercase tracking-[0.18em] text-golden font-semibold">
              Superadmin
            </p>
          )}
          <div className="flex flex-col gap-1.5 pt-1">
            <Link
              href="/admin/security"
              className={`text-cream/60 hover:text-cream transition-colors text-xs ${
                pathname?.startsWith("/admin/security") ? "text-golden" : ""
              }`}
            >
              Two-factor auth →
            </Link>
            <button
              onClick={signOut}
              className="text-golden hover:text-cream transition-colors text-left"
            >
              Sign out →
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-brown text-cream px-5 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/Mandi_Logo.svg" alt="Mandi" width={70} height={20} className="brightness-0 invert" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-golden font-semibold">Admin</span>
        </Link>
        <MobileNav
          pathname={pathname ?? ""}
          badges={badges}
          isSuperadmin={isSuperadmin}
          onSignOut={signOut}
        />
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}

function MobileNav({
  pathname,
  badges,
  isSuperadmin,
  onSignOut,
}: {
  pathname: string;
  badges: { pendingStories: number; pendingEvents: number };
  isSuperadmin: boolean;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const visibleNav = NAV.filter((item) => isSuperadmin || !item.requiresSuperadmin);
  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 text-cream"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 bg-brown-deep border-t border-cream/10 px-4 py-3 space-y-1">
          {visibleNav.map((item) => {
            const active = pathname.startsWith(item.href) && (item.href !== "/admin" || pathname === "/admin");
            const badge = item.badgeKey ? badges[item.badgeKey] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm
                  ${active ? "bg-brown/60 text-golden" : "text-cream/80"}`}
              >
                <span>{item.label}</span>
                {badge > 0 && (
                  <span className="text-[10px] bg-terra text-cream rounded-full px-2 py-0.5 font-semibold">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="mt-2 pt-3 border-t border-cream/10 flex items-center justify-between text-xs">
            <Link
              href="/admin/security"
              onClick={() => setOpen(false)}
              className="text-cream/65 hover:text-cream"
            >
              Two-factor auth →
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="text-golden hover:text-cream"
            >
              Sign out →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Phase 14: paint the admin layout immediately during the initial context
 * fetch, instead of a centred "Loading admin…" line. The sidebar shows
 * the (non-superadmin) NAV with links visibly disabled so the user can
 * see where they are; the right pane is a generic skeleton.
 *
 * Superadmin-only items (Audit log) stay hidden during loading — we
 * don't know yet whether to show them, and revealing-then-hiding would
 * be jarring.
 */
function LoadingShell({ pathname }: { pathname: string }) {
  const visibleNav = NAV.filter((item) => !item.requiresSuperadmin);
  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="hidden md:flex flex-col bg-brown text-cream w-56 lg:w-64 flex-shrink-0 sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-cream/10">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/Mandi_Logo.svg"
              alt="Mandi"
              width={92}
              height={28}
              className="brightness-0 invert opacity-95"
            />
          </Link>
          <p className="text-[10px] uppercase tracking-[0.25em] text-golden font-semibold mt-2">
            Admin
          </p>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1" aria-busy="true">
          {visibleNav.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);
            return (
              <div
                key={item.href}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium
                  ${active
                    ? "bg-brown-deep/60 text-golden/70 border-l-2 border-golden/60"
                    : "text-cream/40"}`}
              >
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-cream/10 text-xs">
          <p className="text-cream/35">Loading admin…</p>
        </div>
      </aside>
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
          {/* Phase 18: explicit loading header so the skeleton state can
              never be mistaken for "styling broken." Was previously just
              the bare animate-pulse grid below, which is visually quiet
              enough that a user landing here from a hard nav read it as
              an unstyled page. */}
          <header className="mb-8 flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block h-4 w-4 rounded-full border-2 border-terra border-t-transparent animate-spin"
            />
            <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold">
              Loading admin…
            </p>
          </header>
          <div className="animate-pulse">
            <div className="h-9 w-44 bg-cream-deep/70 rounded mb-2" />
            <div className="h-4 w-72 bg-cream-deep/40 rounded mb-10" />
            <div className="grid sm:grid-cols-3 gap-5 mb-12">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-cream-soft rounded-3xl shadow-warm p-6 border-l-4 border-cream-deep h-32"
                >
                  <div className="h-3 w-24 bg-cream-deep/60 rounded mb-4" />
                  <div className="h-10 w-20 bg-cream-deep/70 rounded mb-3" />
                  <div className="h-3 w-28 bg-cream-deep/40 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
