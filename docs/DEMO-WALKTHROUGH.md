# Mandi demo walkthrough

Run this on the laptop at `http://localhost:3000`. The dev server is already
running; **do not run `npm run build` while it is running** (it clobbers `.next`).

## The live flow

1. **Arrive** — open `/`. The six-second welcome plays (four rotating words,
   tagline, progress bar), then the landing page appears. The subhead now names
   menopause explicitly. Use the language pills to switch language.
2. **Consent (C1)** — “Let's start”, then tick **both** boxes on `/consent`.
   Continue writes a durable consent session and opens the questionnaire.
3. **Questions** — the cup-of-tea intro, then one question per screen. Show the
   blanket growing, the back button, and a section break with “Did you know?”.
   Q17 (self-harm) scoring 2–3 triggers the SADAG panel before results.
4. **Results** — the blanket, MenoScore and band, the three hardest areas with
   percentages, “More about …” links, the doctor summary and guidance, and the
   two ways forward (join or email). The PDF language selector is preset to her
   language.
5. **PDF** — “Download it here too” opens `/summary`: blanket, doctor summary,
   guidance and all 56 answers. Use the browser’s **Print → Save as PDF**.
6. **Save and come back** — while answering, the “Save & come back” chip copies
   `?resume=<token>`. Open it in another browser/device (or after clearing
   storage) and her answers resume at the first unanswered question. The
   on-device “Welcome back” screen is the fallback.
7. **Booking** — the NavBar “Book a consult” and the find-a-doctor page open
   `/book`. Submit a request; it is stored with `source='booking'`. The success
   screen says Mandi will WhatsApp within one working day. When the Mandi
   number exists, set `NEXT_PUBLIC_WHATSAPP_NUMBER` at build time to show the
   `wa.me` button.
8. **Golden blanket** — complete a second questionnaire. Patches that improved
   turn golden; Q16 and Q17 stay plain.

## Do not claim yet

- Cross-device resume is on PR #9 (local only until merged/deployed).
- WhatsApp handoff needs the Mandi number; the form only stores the lead.
- Email sending is not wired (Resend is unset); the “email me my results” form
  stores the consent and contact, but no email leaves.
- The PDF is browser print-to-PDF, not a server-generated four-language file.
- Payments, member-area rebuild, booking/Calendly/Teams, check-ins, clinician
  portal, WhatsApp reminders and SES are Phase 2–4.
- Admin needs a Cognito staff account with TOTP; none is seeded on staging yet.

## Staging

- `https://staging.joinmandi.co.za` is not live yet. The deploy failed because
  the Docker build could not fetch Montserrat; the fix is in PR #9.
- Merge PR #9 (it includes the font fix, resume, booking, golden blanket and
  copy). PR #10 is the same font fix and becomes redundant. PR #8 adds the
  deploy role's ECR read permission.
- After merge, the deploy builds arm64 images, runs migrations, starts
  Compose/Caddy and health-checks the domain. The GoDaddy/Netlify DNS record is
  already `staging.joinmandi.co.za → 13.244.81.150`.
