/**
 * Privacy / POPIA helpers — pure functions, no I/O.
 *
 * Used by the admin server-action layer to minimise PII exposure to
 * non-superadmin admins. Phase 13: emails in the admin user list +
 * drill-down are masked unless the caller is a superadmin.
 */

/**
 * Mask an email address for non-superadmin admin display.
 *
 *   thandi@example.com   →  t****@example.com
 *   t@example.com        →  t****@example.com   (single-char local part keeps the char)
 *   ab@example.com       →  a****@example.com
 *   not-an-email         →  not-an-email        (pass-through — no @ to anchor)
 *   null / undefined / "" → null                (caller renders an em-dash)
 *
 * Deterministic, pure, safe to memoise. The fixed 4-asterisk run is the
 * point — variable-length masks would leak length information.
 */
export function maskEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.indexOf("@");
  if (at <= 0) return email; // not a recognisable email — return as-is
  const local = email.slice(0, at);
  const domain = email.slice(at); // includes the @
  const first = local.charAt(0);
  return `${first}****${domain}`;
}
