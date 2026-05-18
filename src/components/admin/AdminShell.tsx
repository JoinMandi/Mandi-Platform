"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/server/supabase/browser";
import { fetchAdminContext } from "@/server/actions/admin";

type NavItem = { href: string; label: string; badgeKey?: "pendingStories" | "pendingEvents" };

const NAV: NavItem[] = [
  { href: "/admin",          label: "Dashboard" },
  { href: "/admin/stories",  label: "Stories",  badgeKey: "pendingStories" },
  { href: "/admin/events",   label: "Events",   badgeKey: "pendingEvents" },
  { href: "/admin/content",  label: "Content" },
  { href: "/admin/clinics",  label: "Clinics" },
  { href: "/admin/doctors",  label: "Doctors" },
  { href: "/admin/users",    label: "Users" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [badges, setBadges] = useState<{ pendingStories: number; pendingEvents: number }>({
    pendingStories: 0,
    pendingEvents: 0,
  });
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    void (async () => {
      const ctx = await fetchAdminContext();
      if (ctx.role === null) {
        router.replace("/auth/login?next=/admin");
        return;
      }
      setEmail(ctx.email);
      setIsAdmin(ctx.role === "admin");
      setBadges({
        pendingStories: ctx.pendingStories,
        pendingEvents: ctx.pendingEvents,
      });
    })();
  }, [router]);

  const signOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (isAdmin === null) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-brown/50 text-sm">Loading admin…</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="bg-cream-soft rounded-4xl shadow-warm-xl p-10 text-center max-w-md">
          <p className="font-display text-2xl text-brown mb-3">Admin access only.</p>
          <p className="text-brown/65 text-sm mb-6">
            This area is for Mandi team members. If that should be you, ask Hermi to flip your admin switch.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="link-warm text-terra text-sm">Back to site</Link>
            <button onClick={signOut} className="link-warm text-terra text-sm">Sign out</button>
          </div>
        </div>
      </main>
    );
  }

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
          {NAV.map((item) => {
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
        <div className="px-4 py-4 border-t border-cream/10 text-xs">
          <p className="text-cream/50 truncate">{email}</p>
          <button
            onClick={signOut}
            className="mt-2 text-golden hover:text-cream transition-colors"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-brown text-cream px-5 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/Mandi_Logo.svg" alt="Mandi" width={70} height={20} className="brightness-0 invert" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-golden font-semibold">Admin</span>
        </Link>
        <MobileNav pathname={pathname ?? ""} badges={badges} />
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
}: {
  pathname: string;
  badges: { pendingStories: number; pendingEvents: number };
}) {
  const [open, setOpen] = useState(false);
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
          {NAV.map((item) => {
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
        </div>
      )}
    </>
  );
}
