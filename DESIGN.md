---
version: alpha
name: Mandi Blanket
description: The design system for JoinMandi — a multilingual South African women's health platform for menopause, used by women in their 40s–60s across four languages, often on a mid-range phone and often about something they have never said out loud.

colors:
  # ─── BRAND TOKENS — the seven published swatches, verbatim ───
  primary: "#C94A2B"
  secondary: "#E66C84"
  tertiary: "#F2C14E"
  accent-sun: "#F5A623"
  accent-coral: "#EE8954"
  surface: "#F4ECE4"
  on-surface: "#673C33"
  # ─── DERIVED UI TOKENS — screen-only, each traced to a swatch ───
  primary-action: "#A83A20"
  on-surface-muted: "#7C564E"
  border: "#DBCCC4"
  border-control: "#9F827A"
  error: "#8A2036"
  success: "#4A6B3C"

typography:
  display-xl:
    fontFamily: Carmos
    fontSize: 72px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  display:
    fontFamily: Carmos
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  headline-lg:
    fontFamily: Carmos
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline-md:
    fontFamily: Carmos
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.005em"
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  label-lg:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.2
  label-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.2
  label-caps:
    fontFamily: Montserrat
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.18em"
  caption:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5

rounded:
  none: 0px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  "2xl": 48px
  "3xl": 64px
  gutter: 24px
  margin: 32px

components:
  page:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  panel-anchor:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  panel-terracotta:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  caption-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.caption}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  nav-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    height: 64px
    padding: "{spacing.md}"
  nav-link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-md}"
  button-primary:
    backgroundColor: "{colors.primary-action}"
    textColor: "{colors.surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
  button-primary-hover:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-action}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
  link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-action}"
    typography: "{typography.body-md}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
  chip-selected:
    backgroundColor: "{colors.primary-action}"
    textColor: "{colors.surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
  chip-highlight:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  input-rule:
    backgroundColor: "{colors.border-control}"
    height: 2px
  input-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-caps}"
  input-disabled:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
  input-error:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  input-success:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.success}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
  textarea:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  checkbox:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    size: 24px
  radio:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    size: 24px
  tooltip:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  skeleton:
    backgroundColor: "{colors.border}"
    height: 12px
    rounded: "{rounded.full}"
  progress-track:
    backgroundColor: "{colors.border}"
    height: 6px
    rounded: "{rounded.full}"
  progress-fill:
    backgroundColor: "{colors.accent-coral}"
    height: 6px
    rounded: "{rounded.full}"
  quilt-patch-sun:
    backgroundColor: "{colors.accent-sun}"
    size: 38px
  quilt-patch-bloom:
    backgroundColor: "{colors.secondary}"
    size: 38px
---

# Mandi Blanket

## Changelog

Added in this revision, on top of the brand-layer document:

- **Rule Tiers** — MUST / SHOULD / MAY, applied to every rule in the file
- **Colors** restructured into BRAND (7) and DERIVED (6) groups, each token carrying its hex, CSS custom property and Tailwind key
- **`border-control`** — a sixth derived token, because the existing `border` fails WCAG 1.4.11 as a form control's only boundary
- **Responsive** — four breakpoints, and what actually changes at each
- **Navigation & App Shell** — the shell the document previously never established
- **Forms** — the full state matrix across six controls, plus questionnaire specifics
- **Loading & Connectivity** — written from the mid-range-Android-in-a-taxi premise
- **Accessibility** — everything previously scattered, consolidated, with measured ratios
- **Screen Compositions** — three annotated builds of the system assembled
- **Do's and Don'ts** — retiered, and the absolute prohibitions given a platform escape hatch

Decisions made here that the original document did not cover are collected under
[Flagged decisions](#flagged-decisions) rather than buried in the prose.

## Overview

JoinMandi is a menopause platform for South African women, in English, isiZulu, isiXhosa and Afrikaans. The design has one job before any other: make a woman who has been dismissed by a clinic, or has never had language for what is happening to her body, feel that this place was made for her and will not flinch.

The system takes its name and its whole logic from a **blanket** — the object a South African woman is given at a wedding, wrapped in after birth, and covered with when she is unwell. The interface is built as a quilt of different cloths: shweshwe, lace, floral, printed cotton, each panel from a different woman, stitched into one covering. That is not decoration. It is the argument that a menopause journey is assembled from many separate small admissions, and that the whole is warm.

So the register is **warm, domestic and slow** — not clinical, not corporate, not cheerful. There is no white in this system and no grey; nothing is neutral. Surfaces are cream cloth, ink is a warm brown, and everything that moves does so at the speed of cloth settling. Typography is generous, tap targets are large, and screens ask one thing at a time. A woman on a mid-range Android in a taxi with the questionnaire half-finished is the design target, not a laptop at a desk.

**What this gives up, deliberately:** density and speed. This is the wrong system for a data-heavy console — the admin surfaces borrow it and run slightly tighter, but they do not get their own colder language. It gives up dark mode, because the palette is built from a cloth-and-ink metaphor that inverts into something reading as a different product. It gives up cool colour entirely: there is no blue anywhere, including in the shweshwe patterns, which are traditionally indigo and are reinterpreted warm here on purpose. And it gives up the extra contrast headroom a near-black ink would buy, because the published ink is a warm brown and that warmth is the brand.

### Provenance

The palette below is the brand book — `brief/MANDI Brand Kit/Mandi Brand Guideline/Mandi brand guidelines.idml`, InDesign, 16 March 2026, MrsKing Productions. Its seven swatches are reproduced here **verbatim**, and they are the only brand colours anyone may add to a Mandi surface.

An earlier HTML export, `brief/Mandi_Colour_Palette-1.pdf` (10 March 2026), circulated a different set including a Hot Pink `#E8196A` named as the CTA colour. **That document is superseded and Hot Pink is not part of this system.** If it resurfaces, this is the note that retires it.

### Codebase mapping

`tailwind.config.ts` and `globals.css` currently carry the pre-book palette. Bringing them into line means:

- `cream` → `#F4ECE4` (was `#FDF6EC`), `coral` → `#EE8954` (was `#F07B54`), `brown` → `#673C33` (was `#2C1810`)
- `terra-dark` `#A83A20` keeps its value and becomes `primary-action`
- **Retire** `cream-soft`, `cream-deep`, `brown-deep`, `flame` — the system has one ground, one ink, and two rule weights
- `src/lib/domain/quilt.ts` holds its own fabric palette; its grounds and inks must be re-pointed at book swatches, and `#FBE7CF` / `#F4E3C4` / `#A89274` / `#FFD66B` have no book origin

## Rule Tiers

A design system read under delivery pressure gets skimmed, and a developer skimming needs to know instantly which lines are load-bearing. Every rule in this document carries a tier.

- **[MUST]** — Non-negotiable. Accessibility requirements, the closed palette, the type scale, touch target minimums, and multilingual sizing behaviour. Breaking one of these produces a product that excludes someone or misrepresents the brand. A MUST is not a taste question and is not traded away for a deadline.
- **[SHOULD]** — The right answer in the overwhelming majority of cases, and the default a developer reaches for without asking. One primary CTA per screen, card radius, pill buttons, the animation conventions. A real product flow occasionally has a reason to differ.
- **[MAY]** — Available, encouraged where it fits, never required. Decorative quilt treatments, ambient motion, the optional panel treatments.

**Resolving a conflict.** The higher tier wins, always, and the conflict is a signal that the lower-tier rule needs an exception recorded rather than a judgement call made silently. If a SHOULD rule cannot be met by a real flow — a screen that genuinely needs two equally weighted actions, say — **write the exception down** next to the code, naming the rule and why the flow defeats it, and raise it at the next design review. What is forbidden is the silent break: a screen that quietly has two primary buttons reads to the next developer as permission, and the rule erodes without anyone deciding it should.

A MUST never gets an exception. If a MUST cannot be met, the flow is wrong, not the rule.

## Colors

The palette is the cloth itself: sun-faded printed cotton, unbleached calico, the oxide red of the printed motifs, the warm brown of the thread. Every value is warm-shifted; there is not a single desaturated or cool colour, and adding one breaks the metaphor before it breaks the aesthetic. The neutrals are tinted — `surface` is a cream warm enough to read as *cloth* rather than as an off-white default.

**[MUST]** The palette is closed. Thirteen tokens: seven from the brand book and six derived for the screen. Nothing else may be introduced.

### Brand tokens

The seven published swatches, reproduced exactly. These are the brand and they are not adjustable.

| Token | Hex | CSS custom property | Tailwind key | Role |
|---|---|---|---|---|
| `primary` | `#C94A2B` | `--primary` | `primary` | *Terracotta* — the signature red. Gradients, quilt grounds, full-bleed panels. |
| `secondary` | `#E66C84` | `--secondary` | `secondary` | *Pink* — the floral print. Gradients and quilt patches. |
| `tertiary` | `#F2C14E` | `--tertiary` | `tertiary` | *Golden* — achievement and completion. |
| `accent-sun` | `#F5A623` | `--accent-sun` | `accent-sun` | *Sun* — gradient stop, quilt ground. |
| `accent-coral` | `#EE8954` | `--accent-coral` | `accent-coral` | *Coral* — gradient stop, progress fill. |
| `surface` | `#F4ECE4` | `--surface` | `surface` | *Cream* — the ground, and the only ground. |
| `on-surface` | `#673C33` | `--on-surface` | `on-surface` | *Deep brown* — the thread. All text; the ground for anchor panels. |

### Derived UI tokens

These are not in the book. Each exists because the book is a print palette and this is a screen, and **each is derived from a published swatch rather than invented**.

| Token | Hex | CSS custom property | Tailwind key | Derived from | Why it exists |
|---|---|---|---|---|---|
| `primary-action` | `#A83A20` | `--primary-action` | `primary-action` | `primary`, darkened | Terracotta is 3.99:1 on the cream and cannot carry button text. This is the contrast-safe darkening, at 5.46:1. |
| `on-surface-muted` | `#7C564E` | `--on-surface-muted` | `on-surface-muted` | `on-surface` at 85% over `surface` | Secondary text needs a step down that still clears AA. 5.45:1. |
| `border` | `#DBCCC4` | `--border` | `border` | `on-surface` at 18% over `surface` | The book publishes no border colour. Decorative rules, dividers, card edges, skeletons. |
| `border-control` | `#9F827A` | `--border-control` | `border-control` | `on-surface` at 60% over `surface` | A form control's boundary is subject to the 3:1 non-text minimum, which `border` fails at 1.34:1. This reaches 3.02:1. |
| `error` | `#8A2036` | `--error` | `error` | the `secondary` side of the family, darkened | No semantics in the book. Pulled deliberately away from Terracotta so the action colour and the failure colour cannot be confused. 7.68:1. |
| `success` | `#4A6B3C` | `--success` | `success` | new hue, chroma-matched to the family | The one green admitted, kept warm and low-chroma so it belongs to the cloth rather than to a validation library. 5.19:1. |

### How they are used

- **[MUST]** `primary` (Terracotta) reaches only **3.99:1** on the cream. It is never body text and never a button carrying text. Its job is gradients, quilt grounds, and full-bleed panels holding display-sized type.
- **[MUST]** `primary-action` is **every interactive thing in the product** — primary buttons, links, secondary button borders, selected chips, focus rings. If it can be pressed, it is this colour.
- **[MUST]** `secondary`, `tertiary`, `accent-sun` and `accent-coral` are decorative fills only. All four sit below 3:1 against the cream, so none may ever be a control's only boundary or carry text on the page ground.
- **[SHOULD]** `tertiary` (Golden) is spent only on achievement and completion. It is the one colour allowed to feel like applause, so spending it on ordinary chrome makes the applause meaningless. It is also the only accent that clears AA against the ink, at 5.51:1, so Golden-on-brown is a legitimate text pairing.
- **[MUST]** `border` for decorative rules; `border-control` for anything that bounds an interactive control. These are not interchangeable.

**The trap.** Terracotta is the brand colour and it does not pass AA on the brand ground. That single substitution — `primary-action` everywhere interactive — is what keeps the book usable on a screen, and it is the rule most likely to be broken by someone reaching for the recognisable red.

## Typography

Two faces doing genuinely different jobs, not the same job at two weights.

**Carmos** carries every heading. In the brand book Carmos appears in exactly one place — setting the `MaNDi` wordmark at 46pt — and the Fonts page nominates Montserrat SemiBold for headings. **Promoting Carmos from wordmark to heading face is a deliberate extension of the book**, taken because it gives the product a display voice Montserrat cannot, and because the face is licensed and ships in the kit's own `Font/` directory. **[MUST]** It is a single weight, so no heading may ever be bolded; weight is 400 everywhere and emphasis at display sizes comes from size and space. Fallback is Montserrat, then a serif stack. If this extension is ever revoked, `headline-sm`'s treatment — Montserrat SemiBold — is what the rest of the scale reverts to.

**Montserrat** carries everything else — body, labels, controls, data — exactly as the book specifies. It is loaded as a variable font (100–900) but **[MUST]** the system uses exactly **two weights: 400 and 600**, spaced far enough apart that 600 reads as a decision. There is no 500 and no 700.

**[MUST]** The scale is closed: the twelve levels in the frontmatter are the whole ramp. It runs at roughly a 1.25 ratio through the UI range and is hand-opened at the display end, because a geometric progression is timid exactly where this product needs to be warm and large. Display sizes clamp fluidly — `display-xl` runs `clamp(2.75rem, 6vw, 4.5rem)`, `display` runs `clamp(2rem, 4vw, 3rem)`; token values are the desktop maxima. Tracking is set against size in both directions: negative on display, and `label-caps` opens to 0.18em because uppercase at 11px is unreadable without air. Line height moves inversely — 1.05 at display, 1.65 at body.

**[MUST]** Body text is weight 400. The most common failure in this codebase is setting body copy at 600 because it looks confident in isolation; at paragraph length it reads as shouting, and this product spends its life delivering sensitive text at paragraph length.

**Four languages, one scale.** A woman reading in isiZulu is reading the same screen through 30–40% more characters, and Afrikaans compounds words into single unbreakable strings. If a component was sized to its English label, hers is the version that breaks. **[MUST]** Never size a component to its English string. Headings must wrap to three lines without breaking layout, and buttons must grow rather than truncate — in a health context truncation loses meaning, not just characters.

## Layout

Fluid single-column on mobile; `max-w-5xl` centred with a 32px page margin on desktop. **[SHOULD]** The composition is symmetric and centred, a deliberate choice against the editorial asymmetry that would read as art-directed and therefore as something being sold to her.

**[MUST]** Spacing runs on a 4px base with 8px as the working step; the nine tokens in the frontmatter are the whole scale. Cards take 32px of internal padding; sections are separated by 48–64px. The space is load-bearing — it is what keeps a questionnaire about incontinence and night sweats from feeling like an intake form.

**[SHOULD]** Body measure stays at 60–70 characters. **[MUST]** The questionnaire is one question per screen with the progress bar pinned at the top: never a scrolling list of fifty-six questions, because seeing all of them at once is what makes a woman close the tab.

**[MUST]** Touch targets are minimum 44px. **[SHOULD]** Primary actions on mobile are full-width and sit within thumb reach at the bottom of the viewport.

## Responsive

Mobile is the base case and everything else scales up from it. That is not a methodology preference — the design target is a phone, and the desktop layout is the variant.

| | `mobile` | `tablet` | `desktop` | `wide` |
|---|---|---|---|---|
| **Width** | `< 640px` | `640–1023px` | `≥ 1024px` | `≥ 1280px` |
| **Tailwind** | base | `sm:` | `lg:` | `xl:` |
| **Container** | fluid, 20px gutter | fluid, 24px gutter | centred, 32px gutter | centred, 32px gutter |
| **Max-width** | none | none | `max-w-5xl` content, `max-w-7xl` shell | as desktop |
| **Columns** | 1 | 2 for card grids and the scale input | 3 for card grids | 3, wider gutters |
| **Spacing** | base scale | base scale | `lg`→`xl` on section gaps | as desktop |
| **Type** | base scale | base scale | display levels reach their clamp maxima | as desktop |
| **Navigation** | hamburger drawer | hamburger drawer | hamburger drawer | full horizontal nav |
| **Buttons** | full-width primary | intrinsic width | intrinsic width | intrinsic width |

**[MUST]** The navigation flips at `wide` (1280px), not at `desktop`. This looks wrong against every other system and it is correct here: the nav carries six content destinations plus a language menu plus an auth control, and the isiZulu and isiXhosa labels overflow a 1024px bar. `NavBar.tsx` uses `xl:` throughout for exactly this reason. Changing it to `lg:` breaks the nav in two of the four supported languages while looking fine in the one it was tested in.

**Honest note on the stops.** The codebase currently uses `sm:` 147 times, `md:` 8, `lg:` 6 and `xl:` 4 — in practice it has two breakpoints, mobile and `sm`, plus the nav flip at `xl`. The four-stop table above is forward guidance for new work, not a description of what is built. **[SHOULD]** New components should reach for `sm:` and `xl:` first and introduce `lg:` only where a three-column layout genuinely needs it.

## Elevation & Depth

**There is one ground.** The book publishes a single cream, so this system does not lift cards onto a paler surface — that would require inventing an eighth brand swatch. **[SHOULD]** Depth comes from a hairline and a shadow instead: a card is the same cream as the page, bounded by a 1px `border` rule and raised on a warm shadow.

**[MUST]** Shadows are tinted from the palette and never neutral black, falling from a light above and slightly forward:

- `shadow-warm` — `0 4px 24px rgba(201, 74, 43, 0.08)` — resting cards *(Terracotta)*
- `shadow-warm-lg` — `0 12px 40px rgba(201, 74, 43, 0.14)` — hovered or lifted cards
- `shadow-warm-xl` — `0 24px 60px rgba(103, 60, 51, 0.24)` — modals and overlays only, shifted to the ink because at that depth a red cast reads as a glow

**[MUST]** Dark sections use `on-surface` as their ground, not Terracotta — deep brown carries cream text at 7.91:1 where Terracotta manages only 3.99:1. **[MAY]** A Terracotta panel is legitimate but carries display-sized type only, never body copy. **[MAY]** Apply the `bg-grain` overlay — a 3px radial dot at 4% ink, `mix-blend-mode: overlay` — to full-bleed dark sections so they read as dyed cloth rather than a brown rectangle.

**Motion.** **[SHOULD]** Everything eases; nothing snaps. `rise-in` (0.5s, `cubic-bezier(0.22, 1, 0.36, 1)`) is the standard entrance. `stitch-in` (0.5s with overshoot) is reserved for a quilt patch landing, the one moment in the product allowed to be joyful. **[MAY]** `drift` (8s) and `pulse-warm` (2s) run on ambient background elements only.

**[MUST]** What does not animate: text content, error messages, and anything the user is currently reading or typing. **[MUST]** Every animation honours `prefers-reduced-motion` — see [Accessibility](#accessibility), which records a live gap in how this is currently enforced.

## Shapes

**[SHOULD]** Radius is hierarchical, and the hierarchy carries meaning — the softer the shape, the more human the element:

- `full` — anything a person acts on: buttons, chips, pills, avatars, progress tracks. Every button in this product is a pill; there are no rectangular buttons.
- `xl` (32px) — full-bleed feature panels and hero surfaces
- `lg` (24px) — the standard card; the default when in doubt
- `md` (16px) — panels nested inside a card, image crops
- `sm` (12px) — text inputs, selects, textareas. Inputs are the one place the shape tightens, because a field should read as something to be filled rather than something to be pressed.
- `none` — full-bleed sections meeting the viewport edge

**[MUST]** Decorative rules are 1px `border`. Control boundaries are 2px `border-control`. **[MUST]** Focus is 2px `primary-action` with a 2px offset, and is never removed.

An input carrying only a 1px hairline disappears on a cheap screen in daylight, and with a single ground that risk is higher here than in most systems — which is precisely why control boundaries get their own heavier, contrast-checked token.

## Components

**Buttons.** **[SHOULD]** Four variants: `primary` (action fill, cream text), `secondary` (cream fill, 2px action border, action text), `ghost` (action text, underline on hover), `inverse` (on anchor or gradient panels; cream fill with ink text, going Golden on hover). Three sizes — sm `16px/8px`, md `24px/12px`, lg `32px/16px`. Hover on a primary settles the fill into `on-surface`. **[SHOULD]** One primary button per screen; if two things look equally important, one of them is secondary. **[MUST]** Disabled is 40% opacity with `cursor: not-allowed`, and disabled state is never conveyed by colour alone — the button must also be `aria-disabled` or genuinely `disabled`.

**Chips.** **[SHOULD]** Pill, `label-md`. Unselected is transparent with a 2px `border-control` rule; selected fills with `primary-action` and cream text; `chip-highlight` in Golden marks something achieved, not something selectable. **[MUST]** A Golden chip's fill is 1.44:1 against the page, so its boundary must be drawn with `border-control` — the fill alone does not identify it.

**Cards.** **[SHOULD]** Page cream, `lg` radius, 32px padding, a 1px `border` rule and `shadow-warm`. A card is the default container for any single coherent thought.

**Quilt patches.** **[MAY]** Generated fabric swatches at ~38px, one per answered question, from the family table in `src/lib/domain/quilt.ts`. Patches never carry text, so they are exempt from contrast pairing — but every ground and ink pairing inside a patch fixes one contrast polarity so the print stays legible at that size. **[MUST]** The two sensitive questions (self-image and self-harm) stitch in as a plain woven calico with no celebratory print; that restraint is a product requirement, not a style choice.

**Progress.** **[SHOULD]** A `border` track with a Golden → Sun → Coral → Terracotta gradient fill, pill. The pinned questionnaire bar is 4px; an inline bar is 6px. Above an inline bar, a `label-caps` count. **[MUST]** The bar animates its width over 0.4s and never resets backwards, and it is `role="progressbar"` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax`, because a woman using a screen reader needs to hear how much is left as much as anyone.

## Navigation & App Shell

The shell is where a woman finds out whether she is lost. Mandi's audience includes people who do not use apps daily, so the shell's job is to be boring, present, and identical on every screen.

### The top bar

**[MUST]** One persistent sticky bar, at every breakpoint, on every marketing and account surface.

| Property | Value |
|---|---|
| Position | `sticky top-0`, `z-50` |
| Height | 64px (`nav-bar`) |
| Ground | `surface` at 95% with a backdrop blur |
| Bottom edge | 1px `border` |
| Container | `max-w-7xl`, 16px gutter rising to 24px at `sm` |
| Shadow | none at rest; `shadow-warm` once the page scrolls past 60px |

**[SHOULD]** The shadow appearing on scroll is the only thing that changes about the bar. It tells a woman the page moved under a fixed thing, which is the whole reason the bar is there.

**Logo.** **[MUST]** `Mandi_Logo.svg` at 92×28, top-left, always a link to `/`. Minimum rendered width 80px — below that the wordmark's counters close up. It is tinted to `primary-action` rather than shipped in colour, so it sits in the palette on every ground.

**Navigation pattern.** **[MUST]** Full horizontal nav at `wide` (≥1280px); hamburger drawer below it. The drawer opens in-flow beneath the bar — not as an overlay — on `surface`, with each destination on its own row separated by a 1px `border`, 44px minimum height, and a hover that shifts the row 4px right. The hamburger is three 2px bars that morph into a cross; **[MUST]** it carries `aria-expanded` and an accessible label.

**Bottom navigation is not used.** Two reasons, and they are worth recording because the mobile-first target makes bottom nav look like the obvious answer. First, the primary navigation carries six content destinations plus language and auth — a bottom bar holds four comfortably, so two-thirds of the IA would end up behind a "more" tab, which is worse than a drawer that shows everything at once. Second, the signed-in product is not a tab-switching app; it is a linear questionnaire followed by a roadmap, and both are focused flows with their own navigation. A persistent bottom bar during the questionnaire would offer a woman an exit on every question, which is precisely the wrong invitation.

**Language selector.** **[MUST]** Present in both the desktop bar and the mobile drawer — never hidden behind a menu a woman has to know exists. It is the first thing a non-English speaker looks for, and if she does not find it she leaves. **[MUST]** Changing language mid-questionnaire preserves every answer and returns her to the same question; it never restarts the flow and never warns her that it might.

**Auth.** **[MUST]** Login and sign-out appear in both the desktop bar and the mobile drawer. `/my-journey` appears only with a session; `/admin` only for the admin tier.

### Questionnaire navigation

The questionnaire replaces the shell entirely. **[MUST]** The top bar is not rendered inside the flow — the only navigation is the flow's own, because every additional exit is an invitation to abandon.

**[MUST]** Pinned to the top of the viewport: a 4px progress bar, `border` track with the gradient fill, `z-30`, animating width over 0.4s.

**[SHOULD]** Below it, in order: the growing quilt as a tappable preview (`lg` radius, 1px `border`, 12px padding, with a `label-caps` count of patches stitched); a header row carrying the back control on the left and a `label-caps` "Question *n* of *m*" on the right; then a centred `label-caps` domain label in `primary-action` naming which of the nine areas she is in; then the question itself, vertically centred in the remaining space.

**[MUST]** The back control appears only when there is somewhere to go back to. It never appears on the first question, where an empty back arrow reads as a dead end.

**[MUST]** Save-and-exit is visible on every question, not buried. A woman filling this in on a taxi ride needs to know she can stop. Next to it, plain reassurance that her answers are already saved — **[MUST]** stated in words, not implied by an icon.

**Resuming.** **[MUST]** A returning woman with saved answers never lands straight back in the flow. She gets a dedicated resume screen naming how far she got — "*n* of *m* patches" — and offering two clearly distinct choices: continue where she left off, or start fresh. **[MUST]** Starting fresh requires a deliberate second action; a woman who has answered forty questions must not be able to destroy them with one mis-tap.

## Forms

Questionnaires are Mandi's primary interaction, so form state is not a detail here — it is most of the product.

### State matrix

Every control below sits on `surface` with `sm` radius, `body-md` text in `on-surface`, and 16px padding, unless the state says otherwise. The boundary is always 2px.

| State | Boundary | Text | Notes |
|---|---|---|---|
| **Default** | `border-control` | `on-surface` | — |
| **Focused** | `primary-action`, plus a 2px ring at 2px offset | `on-surface` | **[MUST]** never suppressed |
| **Filled** | `border-control` | `on-surface` | identical to default; the value is the signal |
| **Disabled** | `border` | `on-surface-muted` | 40% opacity, `cursor: not-allowed`, `disabled` attribute set |
| **Read-only** | `border` | `on-surface` | no opacity change — the value still matters |
| **Loading** | `border-control` | `on-surface-muted` | a 16px spinner inset right; input stays focusable |
| **Error** | `error` | `on-surface` | message in `error`, `body-sm`, below the field |
| **Success** | `success` | `on-surface` | **[SHOULD]** only where confirmation is genuinely useful |
| **Required** | `border-control` | `on-surface` | marked in the label, in words, never with a bare asterisk |
| **Optional** | `border-control` | `on-surface` | marked "optional" in the label when most siblings are required |

**[MUST]** Error text is never the only indicator. Every error state carries the colour, an icon, and a written message. A woman with a red-green deficiency, on a cheap screen, in sunlight, must still know her form failed.

### Per control

| Control | Shape | Specifics |
|---|---|---|
| **Text input** | `sm` radius, 48px min height | full width; label above, never a placeholder-as-label |
| **Textarea** | `sm` radius, 120px min height | vertical resize only |
| **Select** | `sm` radius, 48px min height | native `<select>` on mobile — the OS picker beats any custom menu on a low-end device; see the platform escape hatch |
| **Radio group** | `full` radius, 24px control, 44px row | **[MUST]** a real `role="radiogroup"` with arrow-key navigation |
| **Checkbox** | `sm` radius, 24px control, 44px row | check mark in `surface` on a `primary-action` fill when checked |
| **Password** | `sm` radius, 48px min height | visibility toggle inside the field, 44px target, `aria-pressed`, label changes between "Show" and "Hide" |

### Stack order

**[MUST]** Label, then control, then helper text, then error message — always in that order, and the error appends below the helper rather than replacing it. A woman who has just failed validation still needs the guidance that was there before she failed.

- Label: `label-caps`, `on-surface-muted`, 6px above the control
- Helper: `caption`, `on-surface-muted`, 6px below
- Error: `body-sm`, `error`, 6px below the helper, with icon

### Validation timing

**[MUST]** Validate on blur, not on keystroke. Validating while a woman is still typing tells her she is wrong before she has finished being right, and in a health context that lands harder than it does in a checkout. **[MUST]** Re-validate everything on submit, and move focus to the first field in error. **[SHOULD]** Once a field has errored, re-validate it on change so she sees the fix land immediately.

### The questionnaire specifically

**[MUST]** One question per screen, vertically centred, with the question in `headline-md` and the answer controls below it.

**[SHOULD]** The four-point scale renders as a 2×2 grid on mobile and a single row of four at `sm` and above, each option a 2px-bounded tile carrying the numeral in Carmos and the label beneath it. Selecting one lifts it and fades its siblings to 55% — **[MUST]** and the fade is decorative only; selection is also carried by fill, by boundary, and by `aria-checked`.

**[SHOULD]** A long option list — anything beyond eight — scrolls within the content area rather than pushing the navigation off-screen, and keeps the first and last options visible against the container edge so it is obvious the list scrolls.

## Loading & Connectivity

Written from the premise, because the premise is the whole point: a mid-range Android, a slow connection, a taxi, and a questionnaire half-finished. Every rule here assumes the connection will fail, not that it might.

**Page load.** **[SHOULD]** Skeletons on content surfaces — cards, lists, the roadmap — using `skeleton` blocks at `full` radius on the `border` tone, animated with a 3s shimmer. **[MUST]** Skeletons mirror the real layout's shape and count so the page does not jump when content arrives.

**Buttons.** **[MUST]** A pressed button that is waiting keeps its label and adds a 16px spinner to the left of it. It does not swap the label for "Loading…" — a woman who looks away and back needs to know what she pressed. **[MUST]** The button is `aria-busy` and disabled for the duration, so it cannot be double-submitted.

**Skeletons versus spinners.** **[SHOULD]** Skeletons where the shape of what is coming is known: content, lists, cards. Spinners where it is not: an action's result, a submit, a save. Never both on one surface.

**Questionnaire submission.** **[MUST]** The submit is optimistic against local state. Answers are written to local storage as she goes, so the network round-trip at the end confirms rather than creates. If it fails, her answers are still there and the retry is offered against the same local copy.

**Slow connection.** **[SHOULD]** No spinner appears before 300ms — a fast response that flashes a spinner feels slower than one that does not. After 3 seconds, add a line of reassurance in `caption` explaining that the connection is slow and her answers are safe. **[MUST]** Never replace a slow screen with an error; slow is not failed.

**Offline.** **[MUST]** Detect the drop and say so, in a persistent `caption` strip on `border`, worded as reassurance rather than alarm: her answers are saved on this phone and will sync when she is back. **[MUST]** The questionnaire remains fully usable offline — every question, every answer, back and forward navigation. The only thing that blocks is final submission.

**A half-finished questionnaire when the connection drops.** **[MUST]** Nothing is lost, because nothing depended on the network. Answers, the current question index, and the derived score live in local storage under `mandi-session`, `mandi-answers` and `mandi-score`, written on every answer. On her next visit she meets the resume screen, whether or not she ever got back online.

**Retry.** **[MUST]** Every failure state offers a retry as a real button, not a link, and states what will happen when she presses it. **[MUST]** A failed submit never discards the local copy, and never returns her to the first question.

## Accessibility

**[MUST]** The target is **WCAG 2.1 Level AA**, across all four languages, on the whole product including admin.

This section is where the scattered accessibility rules elsewhere in this document are gathered and checked. Where a rule appears in both places, this one governs.

### Measured contrast

Every token against `surface` `#F4ECE4`, measured rather than assumed. AA thresholds: **4.5:1** normal text, **3:1** large text (≥24px, or ≥18.66px bold), **3:1** non-text UI and graphical objects.

| Token | Hex | Ratio | Text 4.5:1 | Large 3:1 | Non-text 3:1 |
|---|---|---|---|---|---|
| `primary` | `#C94A2B` | 3.99 | ✗ | ✓ | ✓ |
| `primary-action` | `#A83A20` | 5.46 | ✓ | ✓ | ✓ |
| `secondary` | `#E66C84` | 2.63 | ✗ | ✗ | ✗ |
| `tertiary` | `#F2C14E` | 1.44 | ✗ | ✗ | ✗ |
| `accent-sun` | `#F5A623` | 1.73 | ✗ | ✗ | ✗ |
| `accent-coral` | `#EE8954` | 2.15 | ✗ | ✗ | ✗ |
| `on-surface` | `#673C33` | 7.91 | ✓ | ✓ | ✓ |
| `on-surface-muted` | `#7C564E` | 5.45 | ✓ | ✓ | ✓ |
| `border` | `#DBCCC4` | 1.34 | ✗ | ✗ | ✗ |
| `border-control` | `#9F827A` | 3.02 | ✗ | ✓ | ✓ |
| `error` | `#8A2036` | 7.68 | ✓ | ✓ | ✓ |
| `success` | `#4A6B3C` | 5.19 | ✓ | ✓ | ✓ |

Two consequences worth stating plainly. **[MUST]** `border` at 1.34:1 is for decorative rules only — WCAG exempts purely decorative boundaries, but the moment a rule is the only thing identifying a control it is not decorative, and `border-control` is required instead. **[MUST]** The four decorative accents all sit below 3:1, so a coloured fill from that group can never be the sole indicator of anything.

On the ink, for reference: `tertiary` on `on-surface` is 5.51:1 and `accent-sun` on `on-surface` is 4.56:1 — both legitimate text pairings on a dark panel, where they fail entirely on the cream.

### Focus and keyboard

- **[MUST]** Focus ring: 2px `primary-action` at 2px offset, on every interactive element. At 5.46:1 against the ground it clears the 3:1 non-text minimum with room to spare, and it stays inside the palette.
- **[MUST]** `focus-visible`, never `:focus` alone, so a mouse user is not given a ring she did not ask for — but the ring is never suppressed outright.
- **[MUST]** Tab order follows visual order. Nothing is reachable by tab that is not visible, and nothing visible and interactive is unreachable.
- **[MUST]** The mobile drawer traps focus while open, returns it to the hamburger on close, and closes on `Escape`.
- **[MUST]** The scale input is a radio group: arrow keys move between options, `Space` selects, and the group is one tab stop. Four separate buttons is not an acceptable implementation — a woman navigating by keyboard would tab four times per question, 224 times across the questionnaire.

### Screen readers

- **[MUST]** Every input has a programmatically associated `<label>`. A placeholder is never a label and `aria-label` is a fallback, not a default.
- **[MUST]** Landmarks on every page: one `<header>`, one `<nav>`, one `<main>`, one `<footer>`. The questionnaire's `<main>` contains the question.
- **[MUST]** One `<h1>` per page, and heading levels never skip. The questionnaire's question is the `<h1>` of its screen.
- **[MUST]** The progress bar is `role="progressbar"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`.
- **[MUST]** Errors are announced. The error region is `role="alert"` (or `aria-live="assertive"`) so a woman hears the failure without hunting for it; the field itself carries `aria-invalid` and `aria-describedby` pointing at the message.
- **[MUST]** Status changes that are not failures — "saved", "syncing", "back online" — use `aria-live="polite"` so they do not interrupt.
- **[MUST]** Decorative elements — the quilt, gradient washes, the grain overlay — are `aria-hidden`. The quilt's *meaning* is conveyed by the adjacent patches-stitched count, which is real text.
- **[MUST]** Every page sets `lang` to the active language, and it updates when she switches. Without it, a screen reader pronounces isiZulu with English phonetics.

### Sizing and targets

- **[MUST]** Minimum font size is 12px (`caption`), and `caption` is for supporting text only — never for anything a woman must read to complete a task.
- **[MUST]** Minimum touch target is 44×44px, including the hamburger, the language selector, the password visibility toggle, and every scale option.
- **[MUST]** Text reflows without horizontal scrolling at 320px wide, and remains usable at 200% zoom.

### Motion

**[MUST]** Every animation this system defines honours `prefers-reduced-motion`. Under reduced motion: `rise-in`, `fade-in` and `stitch-in` resolve instantly to their end state; `drift`, `pulse-warm`, `shimmer`, `bloom` and `patch-shimmer` do not run at all; the progress bar jumps to its new width rather than easing; and the scale input's lift-and-fade becomes an instant state change.

**Recorded gap.** The global override in `globals.css` sets `animation-duration` and `transition-duration` to `0.01ms` under `prefers-reduced-motion`. **That only reaches CSS animation.** Framer-motion drives inline styles from JavaScript and is entirely unaffected by it, and no `useReducedMotion` or `MotionConfig` exists anywhere in `src`. `ScaleInput.tsx`, `QuestionScreen.tsx` and `ProgressBar.tsx` therefore animate regardless of the user's setting. This is a live AA failure against SC 2.3.3, documented here and not yet fixed.

## Do's and Don'ts

- **[MUST] Do** use `primary-action` for everything interactive. **Don't** use Terracotta for text or for a button — it is 3.99:1 on the cream and it fails.
- **[MUST] Don't** add a colour outside the seven brand swatches and six derived values. The palette is closed.
- **[MUST] Don't** reintroduce Hot Pink `#E8196A`. It belongs to a superseded document.
- **[MUST] Do** use `border-control` for anything bounding a control, and `border` only for decorative rules.
- **[MUST] Do** set body copy at weight 400. Reserve 600 for labels, buttons and deliberate emphasis.
- **[MUST] Don't** bold a Carmos heading. The face ships one weight, so a synthetic bold renders as a smeared fake.
- **[MUST] Do** convey state with icon plus text plus colour, never colour alone.
- **[MUST] Don't** size any component to its English string — isiZulu and isiXhosa run 30–40% longer.
- **[MUST] Do** honour `prefers-reduced-motion` in every new animation, including JavaScript-driven ones.
- **[SHOULD] Don't** invent a second cream to lift a card. There is one ground; use the hairline and the shadow.
- **[SHOULD] Do** spend Golden only on achievement and completion. If it appears on an ordinary card, delete it.
- **[SHOULD] Don't** use more than one primary button per screen.
- **[SHOULD] Do** pick a radius from the six-step hierarchy by what the element *is* — pill for pressable, `lg` for cards, `sm` for inputs. Don't reach for a one-off `rounded-[20px]`.
- **[SHOULD] Don't** use a neutral black shadow. Every shadow in this system is tinted Terracotta or ink.
- **[SHOULD] Don't** animate anything on an error or on a sensitive question. Delight is for progress, not for disclosure.
- **[MAY]** Ambient motion, quilt treatments and the grain overlay are available where they fit and required nowhere.

### The colour prohibition, and where the platform wins

The brand position is unchanged: this system has no white, no grey, no cool colour and no dark mode, because the palette is cloth and ink and those additions break the metaphor before they break the aesthetic.

At implementation level that absolute needs one qualification:

> **[MUST]** No intentional UI surface uses neutral white, grey or cool colours. System and browser-controlled colours may appear where the platform owns them.

Where this applies, and what to do:

| Surface | Guidance |
|---|---|
| **Native focus rings** | **Override.** Replace with the 2px `primary-action` ring. Never remove without replacing. |
| **OS form controls** | **Accept.** Native `<select>` pickers, date pickers and the keyboard render in system chrome on mobile, and that is the correct trade — the OS picker beats a custom menu on a low-end device. Style the closed control; let the open one be the platform's. |
| **Image transparency** | **Accept.** Photographs and the logo may contain neutral or cool pixels. Composite them onto `surface`; do not tint the content. |
| **System status bar** | **Override where possible.** Set `theme-color` to `surface` so the browser chrome matches. Accept whatever the OS does beyond that. |
| **Scroll bars** | **Override where possible.** `border` track, `on-surface-muted` thumb via `::-webkit-scrollbar` and `scrollbar-color`. Accept the platform default where neither is supported. |
| **Autofill** | **Override.** Browsers paint a pale blue or yellow field background. Neutralise it with `-webkit-autofill` box-shadow inset in `surface` and `-webkit-text-fill-color` in `on-surface`. Accept residual differences in browsers that ignore it. |
| **Print** | **Accept.** Print styles may fall back to white paper and black ink. |

## Screen Compositions

Three builds of the system assembled, rather than described in parts.

### 1. Questionnaire question

```
┌──────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  progress-track 4px, gradient fill
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │  ▪▪▪▪▪▪▪▪  quilt preview           │  │  card · rounded lg · border 1px
│  │  14 PATCHES STITCHED               │  │  label-caps · on-surface-muted
│  └────────────────────────────────────┘  │
│                                          │  ← 20px gap
│  ← Back              QUESTION 14 OF 56   │  label-md · label-caps
│                                          │
│           3 OF 9 · HOW YOU FEEL INSIDE   │  label-caps · primary-action
│                                          │
│                                          │
│     In the past month, how often         │  headline-md · Carmos 24px
│     have you felt unlike yourself?       │  on-surface
│                                          │
│   ┌──────────┐  ┌──────────┐             │  2×2 mobile, 1×4 at sm
│   │    0     │  │    1     │             │  Carmos 32px numeral
│   │ Not at   │  │ A little │             │  caption label
│   │   all    │  │          │             │  border-control 2px
│   └──────────┘  └──────────┘             │  selected → primary-action fill
│   ┌──────────┐  ┌──────────┐             │
│   │    2     │  │    3     │             │
│   │Quite a   │  │Extremely │             │
│   │   bit    │  │          │             │
│   └──────────┘  └──────────┘             │
│                                          │
│   Save and exit · Your answers are saved │  caption · on-surface-muted
└──────────────────────────────────────────┘
```

- Ground `surface`; no top bar — the flow owns the screen
- Container `max-w-2xl`, 20px horizontal gutter, 24px top / 40px bottom
- Content block vertically centred in remaining space, 32px internal gaps
- Scale group is `role="radiogroup"`; each tile ≥44px; `aria-checked` carries selection
- Question is the `<h1>`

### 2. Roadmap summary

```
┌──────────────────────────────────────────┐
│  ≡  MaNDi              [EN ▾]  Sign out  │  nav-bar 64px · surface/95 · blur
├──────────────────────────────────────────┤
│                                          │
│   Your blanket is finished.              │  display 48px · Carmos
│   Fifty-six patches, one covering.       │  body-lg · on-surface
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪  full quilt      │  │  card · rounded lg
│  │  ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪                  │  │  aria-hidden; count below is real text
│  └────────────────────────────────────┘  │
│                                          │  ← 48px section gap
│   WHAT WE HEARD                          │  label-caps · on-surface-muted
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ │  1 col mobile / 2 sm / 3 lg
│   │ Sleep    │ │ Mood     │ │ Body     │ │  card · 32px padding
│   │ ●●●○     │ │ ●●○○     │ │ ●●●●     │ │  shadow-warm
│   └──────────┘ └──────────┘ └──────────┘ │
│                                          │
│   ┌─ Golden chip: MILESTONE REACHED ─┐   │  chip-highlight + border-control
│                                          │
│   [ Find a doctor who speaks isiZulu ]   │  button-primary · full-width mobile
│     Read what this means                 │  link · primary-action
└──────────────────────────────────────────┘
```

- Section gaps 48px; card grid gutter 24px
- One primary button on the screen; the secondary path is a link
- Golden chip marks achievement and carries a `border-control` boundary, because its fill is 1.44:1

### 3. Offline, with unsaved answers

```
┌──────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├──────────────────────────────────────────┤
│  ⚠  You are offline. Your answers are    │  strip · border ground
│     saved on this phone and will sync    │  caption · on-surface
│     when you are back.                   │  role="status" aria-live="polite"
├──────────────────────────────────────────┤
│                                          │
│     [ question continues normally ]      │  flow is fully usable offline
│                                          │
│   ┌──────────────────────────────────┐   │
│   │  ⟳  Try again                    │   │  button-primary · aria-busy while
│   └──────────────────────────────────┘   │  retrying · label never swapped
│                                          │
│   Nothing has been lost.                 │  caption · on-surface-muted
└──────────────────────────────────────────┘
```

- The strip is reassurance, not alarm: `border` ground, ink text, an icon, no `error` colour
- `error` is reserved for something the woman must act on; a dropped connection is not her failure
- The questionnaire stays fully interactive; only final submission is blocked
- Retry is a real button, states what it will do, and never discards the local copy

## Flagged decisions

Choices made here that the original document did not cover, listed for review rather than silently inherited:

1. **`border-control` `#9F827A` added** as a sixth derived token. The alternative — darkening `border` itself — would have made every hairline in the product visibly heavier.
2. **Validation fires on blur**, re-validates on submit, and re-validates on change once a field has errored. The original specified no timing.
3. **Bottom navigation explicitly rejected**, with reasoning recorded. The mobile-first target makes it look like the obvious choice, so the rejection needed to be argued rather than assumed.
4. **Skeletons on content, spinners on actions**, never both on one surface.
5. **Four breakpoints documented while the code uses two.** `md:` and `lg:` are near-unused today; the table is forward guidance and says so.
6. **Focus ring specified as `primary-action`** rather than a new token, since it already clears the non-text minimum at 5.46:1.
7. **Three live accessibility gaps recorded, not fixed** — framer-motion ignoring `prefers-reduced-motion`, `ScaleInput` lacking radio-group semantics, and the shipped `bg-terra` / `text-cream` button pairing. All three are in code, and this revision changed no source files.
8. **Native `<select>` accepted on mobile** rather than replaced with a custom menu, on performance grounds for low-end devices.
