---
version: alpha
name: Mandi Blanket
description: The design system for JoinMandi — a multilingual South African women's health platform for menopause, used by women in their 40s–60s across four languages, often on a mid-range phone and often about something they have never said out loud.

colors:
  primary: "#C94A2B"
  primary-action: "#A83A20"
  secondary: "#E66C84"
  tertiary: "#F2C14E"
  accent-sun: "#F5A623"
  accent-coral: "#EE8954"
  surface: "#F4ECE4"
  on-surface: "#673C33"
  on-surface-muted: "#7C564E"
  border: "#DBCCC4"
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
  input-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-caps}"
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
  tooltip:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
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

## Overview

JoinMandi is a menopause platform for South African women, in English, isiZulu, isiXhosa and Afrikaans. The design has one job before any other: make a woman who has been dismissed by a clinic, or has never had language for what is happening to her body, feel that this place was made for her and will not flinch.

The system takes its name and its whole logic from a **blanket** — the object a South African woman is given at a wedding, wrapped in after birth, and covered with when she is unwell. The interface is built as a quilt of different cloths: shweshwe, lace, floral, printed cotton, each panel from a different woman, stitched into one covering. That is not decoration. It is the argument that a menopause journey is assembled from many separate small admissions, and that the whole is warm.

So the register is **warm, domestic and slow** — not clinical, not corporate, not cheerful. There is no white in this system and no grey; nothing is neutral. Surfaces are cream cloth, ink is a warm brown, and everything that moves does so at the speed of cloth settling. Typography is generous, tap targets are large, and screens ask one thing at a time. A woman on a mid-range Android in a taxi with the questionnaire half-finished is the design target, not a laptop at a desk.

**What this gives up, deliberately:** density and speed. This is the wrong system for a data-heavy console — the admin surfaces borrow it and run slightly tighter, but they do not get their own colder language. It gives up dark mode, because the palette is built from a cloth-and-ink metaphor that inverts into something reading as a different product. It gives up cool colour entirely: there is no blue anywhere, including in the shweshwe patterns, which are traditionally indigo and are reinterpreted warm here on purpose. And it gives up the extra contrast headroom a near-black ink would buy, because the published ink is a warm brown and that warmth is the brand.

### Provenance

The palette below is the brand book — `brief/MANDI Brand Kit/Mandi Brand Guideline/Mandi brand guidelines.idml`, InDesign, 16 March 2026, MrsKing Productions. Its seven swatches are reproduced here **verbatim**, and they are the only colours anyone may add to a Mandi surface.

An earlier HTML export, `brief/Mandi_Colour_Palette-1.pdf` (10 March 2026), circulated a different set including a Hot Pink `#E8196A` named as the CTA colour. **That document is superseded and Hot Pink is not part of this system.** If it resurfaces, this is the note that retires it.

Five values here are *not* in the book. Each exists because the book is a print palette and this is a screen, and each is derived from a published swatch rather than invented:

| Token | Value | Why it exists |
|---|---|---|
| `primary-action` | `#A83A20` | Terracotta reaches only 3.99:1 on the cream — it cannot legally carry button text. This is Terracotta darkened to 5.46:1. |
| `on-surface-muted` | `#7C564E` | The book's ink at 85% over the book's cream. Secondary text needs a step down that still clears AA (5.45:1). |
| `border` | `#DBCCC4` | The book publishes no border colour. This is the ink at 18% over the cream, so rules stay in the family. |
| `error` | `#8A2036` | No semantic colours in the book. Pulled toward the Pink side of the family, deliberately away from Terracotta, so the action colour and the failure colour cannot be confused. 7.68:1. |
| `success` | `#4A6B3C` | The one green admitted, kept warm and low-chroma so it belongs to the cloth rather than to a validation library. 5.19:1. |

### Codebase mapping

`tailwind.config.ts` and `globals.css` currently carry the pre-book palette. Bringing them into line means:

- `cream` → `#F4ECE4` (was `#FDF6EC`), `coral` → `#EE8954` (was `#F07B54`), `brown` → `#673C33` (was `#2C1810`)
- `terra-dark` `#A83A20` keeps its value and becomes `primary-action`
- **Retire** `cream-soft`, `cream-deep`, `brown-deep`, `flame`, `pink-mandi`'s duplicate role — the system has one ground, one ink, one rule colour
- `src/lib/domain/quilt.ts` holds its own fabric palette; its grounds and inks must be re-pointed at book swatches, and `#FBE7CF` / `#F4E3C4` / `#A89274` / `#FFD66B` have no book origin

## Colors

The palette is the cloth itself: sun-faded printed cotton, unbleached calico, the oxide red of the printed motifs, the warm brown of the thread. Every value is warm-shifted; there is not a single desaturated or cool colour, and adding one breaks the metaphor before it breaks the aesthetic. The neutrals are tinted — `surface` is a cream warm enough to read as *cloth* rather than as an off-white default. If a grey appears in this UI, it arrived from a component library and should be removed.

- **Surface (#F4ECE4):** *Cream* — the published ground, and the **only** ground. There is no second, lighter cream for cards; see Elevation.
- **On-surface (#673C33):** *Deep brown* — the thread. All body text, all headings, and the ground for anchor panels. At 7.91:1 it clears AAA, so nothing in this system needs a near-black.
- **Primary (#C94A2B):** *Terracotta* — the book's signature red and the colour the brand is recognised by. It reaches only **3.99:1** on the cream, so its job is gradients, quilt grounds, and full-bleed panels carrying display-sized type. It is never body text and never a button that has text on it.
- **Primary-action (#A83A20):** the same dye soaked longer, and the colour of **every interactive thing in the product** — primary buttons, links, secondary button borders, selected chips, focus rings. If something can be pressed, it is this.
- **Secondary (#E66C84):** *Pink* — the floral print. Gradients and quilt patches. At 3.01:1 against the ink and 2.63:1 against the cream, it carries no text in either direction.
- **Tertiary (#F2C14E):** *Golden* — the celebratory note, and the only accent that clears AA with the ink (5.51:1). Reserved for progress, completion and milestones. It is the one colour allowed to feel like applause, so spending it on ordinary chrome makes the applause meaningless.
- **Accent-sun (#F5A623) and accent-coral (#EE8954):** the warm gradient stops and quilt grounds. Fills only, never text, never interactive.
- **On-surface-muted (#7C564E):** captions, helper text, field labels.
- **Border (#DBCCC4):** every rule, hairline and track in the product.
- **Error (#8A2036)** and **success (#4A6B3C):** state, always accompanied by an icon and words.

**The trap.** Terracotta is the brand colour and it does not pass AA on the brand ground. Everything interactive is `primary-action`, not `primary`. That single substitution is what keeps the book usable on a screen, and it is the rule most likely to be broken by someone reaching for the recognisable red.

## Typography

Two faces doing genuinely different jobs, not the same job at two weights.

**Carmos** carries every heading. In the brand book Carmos appears in exactly one place — setting the `MaNDi` wordmark at 46pt — and the Fonts page nominates Montserrat SemiBold for headings. **Promoting Carmos from wordmark to heading face is a deliberate extension of the book**, taken because it gives the product a display voice Montserrat cannot, and because the face is licensed and ships in the kit's own `Font/` directory. It is a single weight, so **no heading may ever be bolded**; weight is 400 everywhere and emphasis at display sizes comes from size and space. Fallback is Montserrat, then a serif stack. If this extension is ever revoked, `headline-sm`'s treatment — Montserrat SemiBold — is what the rest of the scale reverts to.

**Montserrat** carries everything else — body, labels, controls, data — exactly as the book specifies. It is loaded as a variable font (100–900) but the system uses exactly **two weights: 400 and 600**, spaced far enough apart that 600 reads as a decision. There is no 500 and no 700.

The scale runs at roughly a 1.25 ratio through the UI range and is hand-opened at the display end, because a geometric progression is timid exactly where this product needs to be warm and large. Display sizes clamp fluidly — `display-xl` runs `clamp(2.75rem, 6vw, 4.5rem)`, `display` runs `clamp(2rem, 4vw, 3rem)`; token values are the desktop maxima. Tracking is set against size in both directions: negative on display, and `label-caps` opens to 0.18em because uppercase at 11px is unreadable without air. Line height moves inversely — 1.05 at display, 1.65 at body.

Body text is **400**. The most common failure in this codebase is setting body copy at 600 because it looks confident in isolation; at paragraph length it reads as shouting, and this product spends its life delivering sensitive text at paragraph length.

**Four languages, one scale.** isiZulu and isiXhosa run considerably longer than English for the same content — often 30–40% — and Afrikaans compounds words. Never size a component to its English string. Headings must wrap to three lines without breaking layout, and buttons must grow rather than truncate.

## Layout

Fluid single-column on mobile; `max-w-5xl` centred with a 32px page margin on desktop. The composition is **symmetric and centred**, a deliberate choice against the editorial asymmetry that would read as art-directed and therefore as something being sold to her.

Spacing runs on a 4px base with 8px as the working step. Cards take 32px of internal padding; sections are separated by 48–64px. The space is load-bearing — it is what keeps a questionnaire about incontinence and night sweats from feeling like an intake form.

Body measure stays at 60–70 characters. The questionnaire is **one question per screen** with the progress bar pinned at the top: never a scrolling list of fifty-six questions, because seeing all of them at once is what makes a woman close the tab.

Touch targets are minimum 44px, and primary actions on mobile are full-width and sit within thumb reach at the bottom of the viewport.

## Elevation & Depth

**There is one ground.** The book publishes a single cream, so this system does not lift cards onto a paler surface — that would require inventing an eighth swatch. Depth comes from **a hairline and a shadow instead**: a card is the same cream as the page, bounded by a 1px `border` rule and raised on a warm shadow.

Shadows are **tinted from the palette and never neutral black**, falling from a light above and slightly forward:

- `shadow-warm` — `0 4px 24px rgba(201, 74, 43, 0.08)` — resting cards *(Terracotta)*
- `shadow-warm-lg` — `0 12px 40px rgba(201, 74, 43, 0.14)` — hovered or lifted cards
- `shadow-warm-xl` — `0 24px 60px rgba(103, 60, 51, 0.24)` — modals and overlays only, shifted to the ink because at that depth a red cast reads as a glow

Dark sections use `on-surface` as their ground, not Terracotta — deep brown carries cream text at 7.91:1 where Terracotta manages only 3.99:1. A Terracotta panel is legitimate but may carry **display-sized type only**, and never body copy. Apply the `bg-grain` overlay — a 3px radial dot at 4% ink, `mix-blend-mode: overlay` — to every full-bleed dark section, so it reads as dyed cloth rather than a brown rectangle.

**Motion.** Everything eases; nothing snaps. `rise-in` (0.5s, `cubic-bezier(0.22, 1, 0.36, 1)`) is the standard entrance. `stitch-in` (0.5s with overshoot) is reserved for a quilt patch landing, the one moment in the product allowed to be joyful. `drift` (8s) and `pulse-warm` (2s) run on ambient background elements only. What does **not** animate: text content, error messages, and anything the user is currently reading or typing. `prefers-reduced-motion` is honoured globally in `globals.css`, and any new animation must survive that being on.

## Shapes

Radius is **hierarchical, and the hierarchy carries meaning** — the softer the shape, the more human the element:

- `full` — anything a person acts on: buttons, chips, pills, avatars, progress tracks. Every button in this product is a pill; there are no rectangular buttons.
- `xl` (32px) — full-bleed feature panels and hero surfaces
- `lg` (24px) — the standard card; the default when in doubt
- `md` (16px) — panels nested inside a card, image crops
- `sm` (12px) — text inputs, selects, textareas. Inputs are the one place the shape tightens, because a field should read as something to be filled rather than something to be pressed.
- `none` — full-bleed sections meeting the viewport edge

Borders are 1px `border` at rest and **2px `primary-action` on focus**. Inputs carry a visible 2px `border` at rest rather than relying on a fill difference — an input that is the same cream as the page disappears on a cheap screen in daylight, and with one ground that risk is higher here than in most systems. Focus is never removed: `focus-visible` shows a 2px `primary-action` ring with a 2px offset on every interactive element.

## Components

**Buttons.** Four variants: `primary` (action fill, cream text), `secondary` (cream fill, 2px action border, action text), `ghost` (action text, underline on hover), `inverse` (on anchor or gradient panels; cream fill with ink text, going Golden on hover). Three sizes — sm `16px/8px`, md `24px/12px`, lg `32px/16px`. Hover on a primary settles the fill into `on-surface`. One primary button per screen. Disabled is 40% opacity with `cursor: not-allowed`.

**Inputs.** Always paired with a `label-caps` label above; placeholder text is never a substitute for a label. The error state shows the berry text *and* an icon *and* a written message — colour alone never carries the failure. Helper text is `caption` in `on-surface-muted`.

**Chips.** Pill, `label-md`. Unselected is transparent with a `border` rule; selected fills with `primary-action` and cream text; `chip-highlight` in Golden marks something achieved, not something selectable.

**Cards.** Page cream, `lg` radius, 32px padding, a 1px `border` rule and `shadow-warm`. A card is the default container for any single coherent thought.

**Quilt patches.** Generated fabric swatches at ~38px, one per answered question, from the family table in `src/lib/domain/quilt.ts`. Patches never carry text, so they are exempt from contrast pairing — but every ground and ink pairing inside a patch fixes one contrast polarity so the print stays legible at that size. The two sensitive questions (self-image and self-harm) stitch in as a plain woven calico with no celebratory print; that restraint is a product requirement, not a style choice.

**Progress.** A `border` track with a Golden → Sun → Coral → Terracotta gradient fill, 6px, pill. Above it, a `label-caps` count. The bar animates its width over 0.4s and never resets backwards.

## Do's and Don'ts

- **Do** use `primary-action` for everything interactive. **Don't** use Terracotta for text or for a button — it is 3.99:1 on the cream and it fails.
- **Don't** add a colour that is not one of the seven published swatches or one of the five derived values documented above. The palette is closed.
- **Don't** reintroduce Hot Pink `#E8196A`. It belongs to a superseded document.
- **Don't** invent a second cream to lift a card. There is one ground; use the hairline and the shadow.
- **Don't** introduce grey. If something must recede, use `on-surface-muted` — never `#888`, never a Tailwind `slate`, `zinc` or `gray` class.
- **Don't** introduce a cool colour, including blue shweshwe. The palette is warm-only and that constraint is the identity.
- **Do** set body copy at weight 400. Reserve 600 for labels, buttons and deliberate emphasis; the codebase currently over-uses 600 and it should trend down, not up.
- **Don't** bold a Carmos heading. The face ships one weight, so a synthetic bold renders as a smeared fake.
- **Do** spend Golden only on achievement and completion. If it appears on an ordinary card, delete it.
- **Don't** use more than one primary button per screen. If two things look equally important, one of them is secondary.
- **Do** pick a radius from the six-step hierarchy by what the element *is* — pill for pressable, `lg` for cards, `sm` for inputs. Don't reach for a one-off `rounded-[20px]`.
- **Don't** use a neutral black shadow. Every shadow in this system is tinted Terracotta or ink.
- **Do** convey state with icon plus text plus colour. A woman with a red-green deficiency on a cheap screen in sunlight must still know her form failed.
- **Don't** size any component to its English string — isiZulu and isiXhosa run 30–40% longer, and truncation in a health context loses meaning, not just characters.
- **Do** honour `prefers-reduced-motion` in every new animation, and never animate text a user is reading.
- **Don't** animate anything on an error or on a sensitive question. Delight is for progress, not for disclosure.
