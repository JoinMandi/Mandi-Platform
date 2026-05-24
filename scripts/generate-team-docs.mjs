#!/usr/bin/env node
/**
 * Phase 22 — generate three role-specific Word documents for the
 * JoinMandi team test (Aug 2026 launch). Outputs to docs/team/.
 *
 *   - JoinMandi-Hermi-Onboarding.docx               (superadmin)
 *   - JoinMandi-Dr-Funeka-Clinical-Review-Guide.docx (clinical admin)
 *   - JoinMandi-Language-Moderator-Guide.docx       (zu/xh/af moderators)
 *
 * One-off — rerun with:
 *   node scripts/generate-team-docs.mjs
 * after updating placeholders (e.g. the live Netlify URL, Google Doc
 * links).
 *
 * Depends on the `docx` npm package — install one-off via:
 *   npm install --no-save docx
 */

import { writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "docs", "team");

const URL_PLACEHOLDER = "[URL will be sent once Netlify deploy is live]";
const FEEDBACK_DOC_PLACEHOLDER =
  "[Google Doc link — JoinMandi test feedback — Aug 2026 launch]";
const SHEET_PLACEHOLDER =
  "[Google Sheet link — JoinMandi translations — moderator review]";

// ── Shared style + helper builders ──────────────────────────────────────

/** A4 page: docx-js default; explicit so the doc is consistent across
 *  Word / Google Docs / LibreOffice. */
const PAGE = {
  size: { width: 11906, height: 16838 }, // A4 in DXA
  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch
};

const COLOR_TERRA = "C94A2B"; // matches brand
const COLOR_BROWN = "4A2C18";
const COLOR_MUTED = "777777";

/** Override built-in heading + body styles to use Arial (universal) with
 *  warm brand colours for headings. */
const STYLES = {
  default: { document: { run: { font: "Arial", size: 22, color: "1A1A1A" } } },
  paragraphStyles: [
    {
      id: "Title",
      name: "Title",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { size: 44, bold: true, font: "Arial", color: COLOR_BROWN },
      paragraph: { spacing: { before: 0, after: 320 }, outlineLevel: 0 },
    },
    {
      id: "Heading1",
      name: "Heading 1",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { size: 30, bold: true, font: "Arial", color: COLOR_TERRA },
      paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 },
    },
    {
      id: "Heading2",
      name: "Heading 2",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { size: 24, bold: true, font: "Arial", color: COLOR_BROWN },
      paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 },
    },
    {
      id: "Eyebrow",
      name: "Eyebrow",
      basedOn: "Normal",
      next: "Normal",
      run: { size: 18, bold: true, font: "Arial", color: COLOR_TERRA, characterSpacing: 40 },
      paragraph: { spacing: { before: 0, after: 60 } },
    },
    {
      id: "Lead",
      name: "Lead",
      basedOn: "Normal",
      next: "Normal",
      run: { size: 24, font: "Arial", italics: true, color: COLOR_BROWN },
      paragraph: { spacing: { before: 0, after: 240 } },
    },
    {
      id: "Footer",
      name: "Footer",
      basedOn: "Normal",
      next: "Normal",
      run: { size: 16, font: "Arial", color: COLOR_MUTED, italics: true },
      paragraph: { alignment: AlignmentType.CENTER },
    },
  ],
};

const NUMBERING = {
  config: [
    {
      reference: "bullets",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 280 } } },
        },
      ],
    },
    {
      reference: "numbers",
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 280 } } },
        },
      ],
    },
  ],
};

/** Build a Paragraph using a named paragraph style. */
function p(text, opts = {}) {
  const runs = Array.isArray(text)
    ? text
    : [new TextRun({ text, ...opts.run })];
  return new Paragraph({
    style: opts.style,
    spacing: opts.spacing,
    children: runs,
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun(text)],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun(text)],
  });
}

function eyebrow(text) {
  return p(text.toUpperCase(), { style: "Eyebrow" });
}

function lead(text) {
  return p(text, { style: "Lead" });
}

function body(text) {
  return new Paragraph({
    spacing: { after: 140 },
    children: [new TextRun(text)],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
    children: [new TextRun(text)],
  });
}

function step(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 80 },
    children: [new TextRun(text)],
  });
}

/** Italic note paragraph (warm aside). */
function note(text) {
  return new Paragraph({
    spacing: { before: 100, after: 140 },
    children: [new TextRun({ text, italics: true, color: COLOR_MUTED })],
  });
}

/** Bordered shaded callout box for short, important notes. */
function callout(text) {
  const border = { style: BorderStyle.SINGLE, size: 6, color: COLOR_TERRA };
  return new Table({
    width: { size: 9026, type: WidthType.DXA }, // A4 content width
    columnWidths: [9026],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: { top: border, bottom: border, left: border, right: border },
            width: { size: 9026, type: WidthType.DXA },
            shading: { fill: "FFF5EE", type: ShadingType.CLEAR },
            margins: { top: 200, bottom: 200, left: 240, right: 240 },
            children: [
              new Paragraph({
                children: [new TextRun({ text, color: COLOR_BROWN })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/** Two-column table for "What you should review" priority list. */
function priorityRow(num, title, detail) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "E5D8C8" };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: 900, type: WidthType.DXA },
        shading: { fill: "FAF1E6", type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 140, right: 140 },
        children: [
          new Paragraph({
            children: [new TextRun({ text: String(num), bold: true, color: COLOR_TERRA, size: 24 })],
          }),
        ],
      }),
      new TableCell({
        borders,
        width: { size: 8126, type: WidthType.DXA },
        margins: { top: 120, bottom: 120, left: 160, right: 160 },
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, bold: true })],
          }),
          new Paragraph({
            children: [new TextRun({ text: detail, color: "333333" })],
          }),
        ],
      }),
    ],
  });
}

/** Simple two-column "Role | What they can do" table. */
function roleTable(rows) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "E5D8C8" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const headerShade = { fill: "F4E6D2", type: ShadingType.CLEAR };
  const cellMargins = { top: 120, bottom: 120, left: 160, right: 160 };
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [2400, 6626],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            borders,
            width: { size: 2400, type: WidthType.DXA },
            shading: headerShade,
            margins: cellMargins,
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Role", bold: true, color: COLOR_BROWN })],
              }),
            ],
          }),
          new TableCell({
            borders,
            width: { size: 6626, type: WidthType.DXA },
            shading: headerShade,
            margins: cellMargins,
            children: [
              new Paragraph({
                children: [new TextRun({ text: "What they can do", bold: true, color: COLOR_BROWN })],
              }),
            ],
          }),
        ],
      }),
      ...rows.map(
        ([role, what]) =>
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2400, type: WidthType.DXA },
                margins: cellMargins,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: role, bold: true })],
                  }),
                ],
              }),
              new TableCell({
                borders,
                width: { size: 6626, type: WidthType.DXA },
                margins: cellMargins,
                children: [new Paragraph({ children: [new TextRun(what)] })],
              }),
            ],
          }),
      ),
    ],
  });
}

/** Standard footer shown on every page. */
function footerPara(developerName) {
  return {
    default: new Footer({
      children: [
        new Paragraph({
          style: "Footer",
          children: [
            new TextRun({
              text: `Need help? Reach ${developerName} for anything that doesn’t make sense.   ·   Page `,
            }),
            new TextRun({ children: [PageNumber.CURRENT] }),
          ],
        }),
      ],
    }),
  };
}

// ── Document 1: Hermi (Superadmin) ───────────────────────────────────────

function buildHermiDoc() {
  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections: [
      {
        properties: { page: PAGE },
        footers: footerPara("the development team"),
        children: [
          eyebrow("For Hermi · Superadmin onboarding"),
          new Paragraph({
            style: "Title",
            children: [new TextRun("Welcome to JoinMandi")],
          }),
          lead(
            "You’re the founder — you get the keys to everything. This guide walks you through your first sign-in, inviting your team, and where the safeguards live.",
          ),

          h1("What JoinMandi is"),
          body(
            "South Africa’s first multilingual women’s-health platform for menopause. English, isiZulu, isiXhosa, Afrikaans. A 56-question self-questionnaire produces a MenoScore, a personalised Mandi Blanket (a visual quilt that grows from her answers), a roadmap of next steps tailored to her, and a downloadable doctor-ready summary she can take to a clinician. Phase 1 launch: August 2026.",
          ),

          h1("Your role: Superadmin"),
          body(
            "Superadmin is the top tier. You can do everything an admin can do — moderate stories and events, publish content, review the user list — and on top of that you can invite other admins, promote and demote them, and read the admin audit log.",
          ),
          callout(
            "Only superadmins can mint other admins or another superadmin. That’s by design — it means if a regular admin account is ever compromised, the attacker can’t bootstrap themselves into your tier.",
          ),

          h1("The live test URL"),
          body(URL_PLACEHOLDER),
          note(
            "Pick a strong password when you first sign up. The test environment uses the same security as production.",
          ),

          h1("First sign-in"),
          step("Check your email for an invite from JoinMandi and click the magic link."),
          step("Set a password. You’ll land on the admin dashboard (/admin)."),
          step(
            "Look around — the dashboard shows the funnel, segments, and check-in compliance. Clicking around doesn’t break anything.",
          ),

          h1("Inviting your team"),
          step("In the sidebar, click Users."),
          step("Click the “+ Invite user” button at the top right."),
          step("Enter the person’s email address and pick their role."),
          step(
            "They get a magic-link email and skip password-setup guesswork — your invite pre-sets their role.",
          ),
          new Paragraph({ spacing: { before: 200, after: 120 }, children: [new TextRun("")] }),
          roleTable([
            ["Member", "Standard end-user. Takes the questionnaire, sees her roadmap, tracks symptoms."],
            ["Clinician", "Reserved for clinical advisors. (No special surface yet — comes post-launch.)"],
            ["Admin", "Full admin dashboard: story / event moderation, content, user list, drill-down."],
            ["Superadmin", "All of the above, plus inviting / promoting / demoting admins, reading the audit log."],
          ]),
          note(
            "When inviting Hermi (you) and Dr Funeka, use real email addresses. For the language moderators, use the mandi-test+name@… email convention — that lets us wipe test accounts cleanly before launch.",
          ),

          h1("Reading the audit log"),
          body(
            "In the sidebar, click Audit log (only superadmins see this). Every role change, user delete, story moderation, and event publish is recorded here. You can filter by action type and scroll back by day. The log also captures every time someone opens a user’s drill-down page — the POPIA paper trail for who looked at whose profile.",
          ),

          h1("Promoting and demoting users"),
          body(
            "In Users, each row has a role dropdown. Changing someone to admin or superadmin requires you (only superadmins can mint admins). The system refuses to demote the last superadmin — there’s always a way back in, even if someone makes a mistake.",
          ),
          note(
            "If you ever need to step yourself down temporarily, promote a second superadmin first. The system won’t let you orphan the workspace.",
          ),

          h1("Two-factor authentication (optional for the test phase)"),
          body(
            "Two-factor auth (also called MFA) is optional during the test phase. The admin surface degrades gracefully without it — you won’t be locked out. If you’d like to set up an authenticator app voluntarily, click Two-factor auth in the sidebar footer. You’ll be prompted for a 6-digit code from your authenticator on subsequent sign-ins.",
          ),
          note(
            "Two-factor will be turned on for everyone (mandatory for admins) before public launch.",
          ),

          h1("How to report issues"),
          body(
            "We’re using a single shared Google Doc for all test feedback. Anyone on the team can add a note. Format: page (e.g. /questionnaire/Q16), language if relevant, what you saw, what you expected, screenshot if you can grab one.",
          ),
          body(`Doc: ${FEEDBACK_DOC_PLACEHOLDER}`),
          callout(
            "Urgent clinical or safety issues: message the dev team or Dr Funeka directly. Don’t wait for the doc.",
          ),
        ],
      },
    ],
  });
}

// ── Document 2: Dr Funeka (Clinical reviewer) ────────────────────────────

function buildFunekaDoc() {
  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections: [
      {
        properties: { page: PAGE },
        footers: footerPara("the development team"),
        children: [
          eyebrow("For Dr Funeka Bango · Clinical review"),
          new Paragraph({
            style: "Title",
            children: [new TextRun("Reviewing the Mandi platform")],
          }),
          lead(
            "Thank you for your time. We need your clinical eye on the questionnaire wording, the roadmap copy, and especially the safety messaging before this reaches real women.",
          ),

          h1("What JoinMandi is"),
          body(
            "South Africa’s first multilingual women’s-health platform for menopause. The user goes through a 56-question self-questionnaire that produces a MenoScore, a personalised quilt-style visual (the Mandi Blanket), and a roadmap of next steps — including a downloadable summary she can bring to her doctor.",
          ),

          h1("Your role: Admin / Clinical advisor"),
          body(
            "You sign in as an Admin. You can see everything a member sees plus the admin moderation surfaces — stories, events, content, the user list. Most of your review will happen on the user-facing pages; the admin pages are where you’ll moderate the stories women submit.",
          ),

          h1("The live test URL"),
          body(URL_PLACEHOLDER),

          h1("First sign-in"),
          step("Check your email for an invite from JoinMandi and click the magic link."),
          step("Set a password. You’ll land on the admin dashboard."),
          step(
            "To review user-facing content, sign out (or use a private browser tab) and walk through the platform as a new visitor would.",
          ),

          h1("What to review, in priority order"),
          new Paragraph({ spacing: { before: 120 }, children: [new TextRun("")] }),
          new Table({
            width: { size: 9026, type: WidthType.DXA },
            columnWidths: [900, 8126],
            rows: [
              priorityRow(
                1,
                "The 56-question questionnaire",
                "Visit /questionnaire from the public site. Focus on the wording of each question, whether the answer options realistically cover what women experience, and whether the persona-shaping questions (Q49–Q55) read as intended. Q16 (‘not feeling like herself’) and Q17 (self-harm) are the highest-stakes — they need your sign-off most.",
              ),
              priorityRow(
                2,
                "The roadmap and band copy",
                "Complete the questionnaire to see her personalised roadmap. Review the score-band lines (mild / moderate / significant), the persona body text, and the 6 ‘next step’ cards.",
              ),
              priorityRow(
                3,
                "Safety messaging (Q17 + SADAG)",
                "When the self-harm flag fires, the roadmap shows a dedicated safety panel with the SADAG contact. Please confirm the wording and the SADAG number are correct and culturally appropriate.",
              ),
              priorityRow(
                4,
                "The doctor-ready PDF",
                "Sign in as a member tester who has completed the questionnaire, visit My Journey, then click Download for doctor. Review the printable summary — header, MenoScore, top areas, full 56-question answer list, symptom log.",
              ),
              priorityRow(
                5,
                "Story moderation",
                "Visit Admin → Stories to approve or reject the stories women submit. You can also author your own with “+ New story” — they go through the same pending queue.",
              ),
            ],
          }),

          h1("How to flag concerns"),
          body(
            "For non-urgent feedback, write directly in the shared Google Doc under the question or page in question. We re-read it weekly and act on every entry.",
          ),
          body(`Doc: ${FEEDBACK_DOC_PLACEHOLDER}`),
          callout(
            "Urgent clinical safety issues — wrong safety wording, an incorrect medication name, a missing contraindication — message Hermi directly. Don’t wait for the doc.",
          ),

          h1("Known limits during the test phase"),
          bullet(
            "Two-factor authentication is optional during testing. It will be required for admins before public launch.",
          ),
          bullet(
            "Invite emails are rate-limited to about 3 per hour while we’re on Supabase’s default email service.",
          ),
          bullet(
            "Some pages may still appear in English when you switch to isiZulu / isiXhosa / Afrikaans — the language moderators are filling those in this week.",
          ),
          bullet(
            "All test data will be wiped before real launch — anything you create now is throwaway.",
          ),
        ],
      },
    ],
  });
}

// ── Document 3: Language moderators ──────────────────────────────────────

function buildModeratorDoc() {
  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections: [
      {
        properties: { page: PAGE },
        footers: footerPara("the development team"),
        children: [
          eyebrow("For language moderators · isiZulu · isiXhosa · Afrikaans"),
          new Paragraph({
            style: "Title",
            children: [new TextRun("Helping Mandi sound like home")],
          }),
          lead(
            "You’re checking that the South African languages on JoinMandi sound right to a native speaker. The current text was a first machine pass — your edits make it human.",
          ),

          h1("What JoinMandi is"),
          body(
            "South Africa’s first multilingual women’s-health platform for menopause. A woman goes through a self-questionnaire about how she has been feeling, sees a personalised roadmap of what to do next, and can download a summary for her doctor. The whole thing exists in English, isiZulu, isiXhosa, and Afrikaans — and that last bit is where you come in.",
          ),

          h1("Your role"),
          body(
            "You’re signed up as a Member — the same role any real user has. You experience Mandi as she would, in your language, and flag anything that sounds wrong or off-tone.",
          ),

          h1("The live test URL"),
          body(URL_PLACEHOLDER),

          h1("First sign-in"),
          step(
            "Check your email for an invite from JoinMandi (the address will look something like mandi-test+zu-mod@…) and click the magic link.",
          ),
          step("Set a password. You’ll land on the My Journey page."),
          step("Use the language picker at the top right to switch into your language."),

          h1("Switching language inside the app"),
          body(
            "Look at the very top right of any page. You’ll see a small pill that says EN, ZU, XH, or AF. Click it — a small menu drops down with all four language options. Pick yours. The whole site switches immediately. Your choice is remembered the next time you visit.",
          ),

          h1("What pages to walk through, in your language"),
          body(
            "Go through these pages and read everything like a real user would. Anything that sounds odd, off-tone, or just plain wrong — flag it in the Google Sheet (next section).",
          ),
          bullet("Landing page"),
          bullet("About"),
          bullet("Honour the Mothers"),
          bullet("The questionnaire (at least the first 10 questions; ideally all 56)"),
          bullet("The roadmap (after completing the questionnaire)"),
          bullet("My Journey, including the Download for doctor button"),
          bullet("Find a doctor"),
          bullet("Resources"),

          h1("The Google Sheet — where you make your edits"),
          body(
            "You’ll get an invite to a Google Sheet titled “JoinMandi translations — moderator review”. Each row is one piece of text in the app, with columns for English, isiZulu, isiXhosa, Afrikaans, and a notes column.",
          ),
          body(`Sheet: ${SHEET_PLACEHOLDER}`),
          bullet("Edit only your language column. Don’t touch English — that’s the source."),
          bullet(
            "If a cell is blank or shows English, that means the text is currently falling back to English in the app. Fill it in with your translation.",
          ),
          bullet(
            "If something doesn’t translate cleanly (a brand name, a cultural concept that doesn’t map), write a short note in the notes column.",
          ),
          bullet(
            "When you finish a batch of edits, let the developer know. We re-import your edits into the live site within 24 hours. Refresh the site to see them.",
          ),

          h1("Brand names that should NEVER be translated"),
          body(
            "Leave these exactly as they are in English in your column — don’t translate them:",
          ),
          bullet("Mandi · JoinMandi"),
          bullet("kykNET · MrsKing Productions"),
          bullet("Hermi King · Dr Funeka Bango"),
          bullet("Sarah Baartman · Anarcha · Betsey · Lucy"),
          bullet("POPIA · HRT · MenoScore"),
          bullet("Meer as Warm Gloede (the documentary title)"),

          h1("How to report issues that aren’t translations"),
          body(
            "If something is broken (the button doesn’t work, the page doesn’t load, the layout looks wrong), that’s a different feedback channel — the shared Google Doc.",
          ),
          body(`Doc: ${FEEDBACK_DOC_PLACEHOLDER}`),
          callout(
            "If anything you read makes you genuinely worried about a woman’s wellbeing — for example a safety message that says the wrong thing — please flag it directly to the team. Don’t wait.",
          ),
        ],
      },
    ],
  });
}

// ── Run ───────────────────────────────────────────────────────────────────

async function write(doc, filename) {
  const path = resolve(OUT_DIR, filename);
  const buffer = await Packer.toBuffer(doc);
  await writeFile(path, buffer);
  return path;
}

async function main() {
  const written = [];
  written.push(await write(buildHermiDoc(), "JoinMandi-Hermi-Onboarding.docx"));
  written.push(
    await write(buildFunekaDoc(), "JoinMandi-Dr-Funeka-Clinical-Review-Guide.docx"),
  );
  written.push(
    await write(buildModeratorDoc(), "JoinMandi-Language-Moderator-Guide.docx"),
  );
  // eslint-disable-next-line no-console
  console.log("[team-docs] Wrote:");
  for (const p of written) {
    // eslint-disable-next-line no-console
    console.log(`  ${p}`);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[team-docs] failed:", err);
  process.exit(1);
});
