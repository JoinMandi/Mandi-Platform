"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import InviteUserModal from "@/components/admin/InviteUserModal";
import { fetchUsersOverview } from "@/server/actions/users";
import { setUserRole } from "@/server/actions/admin-roles";
import type {
  Persona,
  PopiaDeletionLogRow,
  ScoreBand,
  UserRole,
  UserRow as UserAccount,
} from "@/lib/types/database";

type UserListRow = UserAccount & {
  responseCount: number;
  persona: Persona | null;
  scoreBand: ScoreBand | null;
  lastResponseAt: string | null;
};

const PERSONA_SHORT: Record<Persona, string> = {
  sally: "Sally",
  olga: "Olga",
  vicky: "Vicky",
  nelly: "Nelly",
  nina: "Nina",
  retha: "Retha",
  colleen: "Colleen",
};
const BAND_COLOR: Record<ScoreBand, string> = {
  mild: "bg-golden/30 text-brown",
  moderate: "bg-coral/25 text-terra",
  significant: "bg-terra text-cream",
};

const ROLE_BADGE: Record<UserRole, string> = {
  superadmin: "bg-brown text-cream",
  admin: "bg-golden/30 text-brown",
  clinician: "bg-coral/25 text-terra",
  member: "bg-brown/5 text-brown/70",
};
const ROLE_LABEL: Record<UserRole, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  clinician: "Clinician",
  member: "Member",
};
const ROLE_DESCRIPTION: Record<UserRole, string> = {
  superadmin:
    "Top tier — full admin powers PLUS the ability to mint, promote, and demote admins and other superadmins.",
  admin:
    "Full admin access — moderation queues, content publish, user delete, audit log read. Cannot mint other admins.",
  clinician:
    "Clinical advisor role. No admin surface today; reserved for future clinician-only views.",
  member:
    "Standard end-user. Sees the full Mandi experience, no admin access.",
};

/** Members of the privileged role tier. Touching these roles in either
 *  direction requires a superadmin. */
const PRIVILEGED_TIER: ReadonlySet<UserRole> = new Set<UserRole>([
  "admin",
  "superadmin",
]);

const ROLE_DROPDOWN_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "member", label: "Member" },
  { value: "clinician", label: "Clinician" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Superadmin" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserListRow[] | null>(null);
  const [log, setLog] = useState<PopiaDeletionLogRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState<UserListRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [promoting, setPromoting] = useState<{
    user: UserListRow;
    toRole: UserRole;
  } | null>(null);
  const [updating, setUpdating] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  const load = async () => {
    // Phase 13 + 20: fetchUsersOverview carries isSuperadmin so we don't
    // need a separate fetchAdminContext round-trip. Email masking is
    // applied server-side; we don't surface a visible "emails masked"
    // banner anymore (Phase 20 — too developer-speak for non-tech admins).
    const {
      users: rows,
      responseCounts,
      enrichment,
      deletionLog,
      isSuperadmin: superFlag,
    } = await fetchUsersOverview();
    setUsers(
      rows.map((u) => ({
        ...u,
        responseCount: responseCounts[u.id] ?? 0,
        persona: enrichment[u.id]?.persona ?? null,
        scoreBand: enrichment[u.id]?.scoreBand ?? null,
        lastResponseAt: enrichment[u.id]?.lastResponseAt ?? null,
      })),
    );
    setLog(deletionLog);
    setIsSuperadmin(superFlag);
  };

  useEffect(() => {
    void load();
  }, []);

  // Auto-dismiss toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    if (!users) return null;
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email?.toLowerCase().includes(q));
  }, [users, search]);

  const performDelete = async () => {
    if (!confirming) return;
    setDeleting(true);
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: confirming.id, userEmail: confirming.email }),
    });
    setDeleting(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Delete failed" }));
      alert(`Delete failed: ${error}`);
      return;
    }
    setConfirming(null);
    void load();
  };

  const performRoleChange = async () => {
    if (!promoting) return;
    setUpdating(true);
    const res = await setUserRole(promoting.user.id, promoting.toRole);
    setUpdating(false);
    if (!res.ok) {
      alert(`Role change failed: ${res.error ?? "unknown"}`);
      return;
    }
    setPromoting(null);
    void load();
  };

  return (
    <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">
            POPIA
          </p>
          <h1 className="font-display text-4xl text-brown">Users</h1>
          <p className="text-brown/65 mt-2 max-w-xl">
            Invite testers and delegate roles. Deletion is permanent and audited.
            All role changes go to the audit log.
          </p>
        </div>
        <Button
          onClick={() => setInviteOpen(true)}
          className="bg-terra"
        >
          + Invite user
        </Button>
      </header>

      <div className="mb-5">
        <input
          type="search"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 bg-cream-soft border-2 border-cream-deep focus:border-terra rounded-full px-5 py-2.5 text-sm text-brown"
        />
      </div>

      <div className="bg-cream-soft rounded-3xl shadow-warm overflow-hidden mb-12">
        {filtered === null ? (
          <p className="px-6 py-10 text-sm text-brown/50">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-10 text-sm text-brown/50">No users match.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream-deep/40 text-brown/60 text-[11px] uppercase tracking-[0.15em]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Email</th>
                <th className="text-left px-5 py-3 font-semibold">Persona</th>
                <th className="text-left px-5 py-3 font-semibold">Band</th>
                <th className="text-left px-5 py-3 font-semibold">Last activity</th>
                <th className="text-left px-5 py-3 font-semibold">Lang</th>
                <th className="text-left px-5 py-3 font-semibold">Q</th>
                <th className="text-left px-5 py-3 font-semibold">Role</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-cream-deep/40 hover:bg-cream">
                  <td className="px-5 py-4 font-medium text-brown">
                    <Link href={`/admin/users/${u.id}`} className="hover:text-terra">
                      {u.email ?? u.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-brown/70">
                    {u.persona ? PERSONA_SHORT[u.persona] : <span className="text-brown/35">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    {u.scoreBand ? (
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${BAND_COLOR[u.scoreBand]}`}
                      >
                        {u.scoreBand}
                      </span>
                    ) : (
                      <span className="text-brown/35">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-brown/70">
                    {u.lastResponseAt ? new Date(u.lastResponseAt).toLocaleDateString() : <span className="text-brown/35">never</span>}
                  </td>
                  <td className="px-5 py-4 uppercase text-brown/60">{u.language_code ?? "—"}</td>
                  <td className="px-5 py-4 text-brown/70">{u.responseCount}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${ROLE_BADGE[u.role]}`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <select
                      value={u.role}
                      onChange={(e) => {
                        const next = e.target.value as UserRole;
                        if (next !== u.role) {
                          setPromoting({ user: u, toRole: next });
                        }
                      }}
                      aria-label={`Change role for ${u.email ?? u.id}`}
                      className="text-xs bg-cream-deep/40 text-brown font-semibold px-3 py-1.5 rounded-full hover:bg-brown/10 transition-colors mr-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-terra"
                    >
                      {ROLE_DROPDOWN_OPTIONS.map((opt) => {
                        // Touching the privileged tier requires superadmin:
                        // either the target value is admin/superadmin, or
                        // the user is currently superadmin (a demotion of
                        // a superadmin is also a privileged operation).
                        const touchesPrivileged =
                          PRIVILEGED_TIER.has(opt.value) ||
                          u.role === "superadmin";
                        const disabled =
                          touchesPrivileged && !isSuperadmin && opt.value !== u.role;
                        return (
                          <option
                            key={opt.value}
                            value={opt.value}
                            disabled={disabled}
                          >
                            {opt.label}
                            {disabled ? " (superadmin only)" : ""}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      onClick={() => setConfirming(u)}
                      className="text-xs bg-terra/10 text-terra font-semibold px-3 py-1.5 rounded-full hover:bg-terra hover:text-cream transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* POPIA deletion log */}
      <div className="bg-cream-soft rounded-3xl shadow-warm p-7">
        <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">POPIA Audit Trail</p>
        <h2 className="font-display text-2xl text-brown mb-4">Deletion log</h2>
        {log === null ? (
          <p className="text-sm text-brown/50">Loading…</p>
        ) : log.length === 0 ? (
          <p className="text-sm text-brown/50">No deletions recorded yet.</p>
        ) : (
          <ul className="divide-y divide-cream-deep/50">
            {log.map((l) => (
              <li key={l.id} className="py-3 flex justify-between text-sm">
                <span className="text-brown/80">{l.user_email ?? "unknown email"}</span>
                <span className="text-brown/55">{new Date(l.deleted_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Invite user modal */}
      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        isSuperadmin={isSuperadmin}
        onInvited={({ email, role }) => {
          setInviteOpen(false);
          setToast(`Invite sent to ${email} as ${ROLE_LABEL[role].toLowerCase()}.`);
          void load();
        }}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-brown text-cream rounded-2xl shadow-warm-xl px-5 py-3 text-sm font-medium max-w-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation modal */}
      <AnimatePresence>
        {confirming && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirming(null)}
              className="fixed inset-0 z-50 bg-brown-deep/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-5"
            >
              <div className="bg-cream-soft rounded-3xl shadow-warm-xl w-full max-w-md p-7">
                <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">POPIA Delete</p>
                <h2 className="font-display text-2xl text-brown mb-3">
                  Delete {confirming.email}?
                </h2>
                <p className="text-brown/75 text-sm leading-relaxed mb-6">
                  This permanently deletes her account, her questionnaire responses, her symptom logs, and her check-ins.
                  This cannot be undone. The deletion is logged for POPIA audit purposes.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setConfirming(null)}
                    className="text-sm text-brown/70 font-semibold px-4 py-2.5"
                  >
                    Cancel
                  </button>
                  <Button onClick={performDelete} disabled={deleting} className="bg-terra">
                    {deleting ? "Deleting…" : "Yes, delete permanently"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Role change modal */}
      <AnimatePresence>
        {promoting && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPromoting(null)}
              className="fixed inset-0 z-50 bg-brown-deep/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-5"
            >
              <div className="bg-cream-soft rounded-3xl shadow-warm-xl w-full max-w-md p-7">
                <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
                  Role change
                </p>
                <h2 className="font-display text-2xl text-brown mb-3">
                  Change {promoting.user.email ?? "this user"} from {ROLE_LABEL[promoting.user.role].toLowerCase()} to {ROLE_LABEL[promoting.toRole].toLowerCase()}?
                </h2>
                <p className="text-brown/75 text-sm leading-relaxed mb-2">
                  {ROLE_DESCRIPTION[promoting.toRole]}
                </p>
                <p className="text-brown/55 text-xs leading-relaxed mb-6">
                  This action is logged in the audit trail. If MFA is enabled at the
                  Supabase project level, the user will be prompted to enrol TOTP on
                  their next sign-in for admin actions.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setPromoting(null)}
                    className="text-sm text-brown/70 font-semibold px-4 py-2.5"
                  >
                    Cancel
                  </button>
                  <Button onClick={performRoleChange} disabled={updating} className="bg-terra">
                    {updating ? "Updating…" : `Yes, set ${ROLE_LABEL[promoting.toRole].toLowerCase()}`}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
