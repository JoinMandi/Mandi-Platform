"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { inviteAdminUser } from "@/server/actions/admin-invite";
import type { UserRole } from "@/lib/types/database";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called on a successful invite — caller refreshes the users list. */
  onInvited: (info: { email: string; role: UserRole; userId: string }) => void;
  /** True if the current admin is also a superadmin — only superadmins can
   *  invite at admin or superadmin level. Defaults to false to fail safe. */
  isSuperadmin?: boolean;
}

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  /** When true, this option is only available to superadmins. */
  privileged: boolean;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "member",
    label: "Member",
    description: "Standard tester. Full end-user experience, no admin access.",
    privileged: false,
  },
  {
    value: "clinician",
    label: "Clinician",
    description: "Reserved for clinical advisors. No admin surface today.",
    privileged: false,
  },
  {
    value: "admin",
    label: "Admin",
    description: "Full admin access — moderation, content, users, audit. Cannot mint other admins.",
    privileged: true,
  },
  {
    value: "superadmin",
    label: "Superadmin",
    description: "Top tier — can mint and demote admins and other superadmins.",
    privileged: true,
  },
];

export default function InviteUserModal({
  open,
  onClose,
  onInvited,
  isSuperadmin = false,
}: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("member");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setRole("member");
    setError(null);
    setSubmitting(false);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const res = await inviteAdminUser(email, role);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const sent = { email: email.trim().toLowerCase(), role, userId: res.userId };
    reset();
    onInvited(sent);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-brown-deep/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5"
          >
            <form
              onSubmit={submit}
              className="bg-cream-soft rounded-3xl shadow-warm-xl w-full max-w-md p-7"
            >
              <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
                Invite user
              </p>
              <h2 className="font-display text-2xl text-brown mb-2">
                Send a magic-link invite
              </h2>
              <p className="text-brown/65 text-sm leading-relaxed mb-5">
                Supabase emails the invitee a sign-in link. Their role is pre-set,
                so they land on the right surface on first sign-in.
              </p>

              <label className="block mb-4">
                <span className="block text-[11px] uppercase tracking-[0.2em] text-brown/65 font-semibold mb-1.5">
                  Email
                </span>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  placeholder="tester@example.com"
                  className="w-full bg-cream border-2 border-cream-deep focus:border-terra focus:outline-none rounded-2xl px-4 py-2.5 text-sm text-brown disabled:opacity-50"
                />
              </label>

              <fieldset className="mb-5" disabled={submitting}>
                <legend className="block text-[11px] uppercase tracking-[0.2em] text-brown/65 font-semibold mb-2">
                  Role
                </legend>
                <div className="space-y-2">
                  {ROLE_OPTIONS.filter(
                    (opt) => isSuperadmin || !opt.privileged,
                  ).map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 px-4 py-3 rounded-2xl cursor-pointer border-2 transition-colors ${
                        role === opt.value
                          ? "border-terra bg-cream"
                          : "border-cream-deep bg-cream/40 hover:border-terra/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={opt.value}
                        checked={role === opt.value}
                        onChange={() => setRole(opt.value)}
                        className="mt-1 accent-terra"
                      />
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-brown">
                          {opt.label}
                        </span>
                        <span className="block text-xs text-brown/65 leading-snug mt-0.5">
                          {opt.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {!isSuperadmin && (
                  <p className="text-[11px] text-brown/55 mt-2 leading-snug">
                    Admin and Superadmin invites are restricted to superadmins.
                  </p>
                )}
              </fieldset>

              {error && (
                <p className="text-terra text-sm mb-4 bg-terra/10 rounded-2xl px-4 py-3">
                  {error}
                </p>
              )}

              <div className="flex gap-3 justify-end items-center">
                <button
                  type="button"
                  onClick={close}
                  disabled={submitting}
                  className="text-sm text-brown/70 font-semibold px-4 py-2.5 disabled:opacity-40"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={submitting} className="bg-terra">
                  {submitting ? "Sending…" : "Send invite"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
