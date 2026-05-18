"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { fetchUsersOverview } from "@/server/actions/users";
import type { UserRow as UserAccount, PopiaDeletionLogRow } from "@/lib/types/database";

type UserListRow = UserAccount & { responseCount: number };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserListRow[] | null>(null);
  const [log, setLog] = useState<PopiaDeletionLogRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState<UserListRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const { users: rows, responseCounts, deletionLog } = await fetchUsersOverview();
    setUsers(rows.map((u) => ({ ...u, responseCount: responseCounts[u.id] ?? 0 })));
    setLog(deletionLog);
  };

  useEffect(() => {
    void load();
  }, []);

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

  return (
    <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">POPIA</p>
        <h1 className="font-display text-4xl text-brown">Users</h1>
        <p className="text-brown/65 mt-2 max-w-xl">
          All registered Mandi users. Deletion is permanent and audited. Service-role backed.
        </p>
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
                <th className="text-left px-5 py-3 font-semibold">Language</th>
                <th className="text-left px-5 py-3 font-semibold">Created</th>
                <th className="text-left px-5 py-3 font-semibold">Questionnaires</th>
                <th className="text-left px-5 py-3 font-semibold">Role</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-cream-deep/40 hover:bg-cream">
                  <td className="px-5 py-4 font-medium text-brown">{u.email ?? "—"}</td>
                  <td className="px-5 py-4 uppercase text-brown/60">{u.language_code ?? "—"}</td>
                  <td className="px-5 py-4 text-brown/70">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-brown/70">{u.responseCount}</td>
                  <td className="px-5 py-4">
                    {u.role === "admin" ? (
                      <span className="text-[10px] bg-golden/30 text-brown px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">Admin</span>
                    ) : u.role === "clinician" ? (
                      <span className="text-[10px] bg-coral/25 text-terra px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">Clinician</span>
                    ) : (
                      <span className="text-[10px] bg-brown/5 text-brown/60 px-2.5 py-0.5 rounded-full">Member</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => setConfirming(u)}
                      className="text-xs bg-terra/10 text-terra font-semibold px-3 py-1.5 rounded-full hover:bg-terra hover:text-cream transition-colors">
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
    </div>
  );
}
