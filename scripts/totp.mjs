#!/usr/bin/env node
/**
 * Prints a TOTP code for a base32 secret. Staging acceptance only.
 *
 *   node scripts/totp.mjs <base32-secret>
 */
import crypto from "node:crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const secret = (process.argv[2] ?? "").toUpperCase().replace(/[^A-Z2-7]/g, "");
if (!secret) {
  console.error("usage: node scripts/totp.mjs <base32-secret>");
  process.exit(1);
}

let bits = "";
for (const char of secret) {
  const value = alphabet.indexOf(char);
  if (value >= 0) bits += value.toString(2).padStart(5, "0");
}
const key = Buffer.from(
  Array.from({ length: Math.floor(bits.length / 8) }, (_, i) =>
    parseInt(bits.slice(i * 8, i * 8 + 8), 2),
  ),
);

const counter = Math.floor(Date.now() / 1000 / 30);
const message = Buffer.alloc(8);
message.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
message.writeUInt32BE(counter >>> 0, 4);
const digest = crypto.createHmac("sha1", key).update(message).digest();
const offset = digest[digest.length - 1] & 0x0f;
const code = ((digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000)
  .toString()
  .padStart(6, "0");

const secondsLeft = 30 - (Math.floor(Date.now() / 1000) % 30);
console.log(`${code} (${secondsLeft}s left)`);
