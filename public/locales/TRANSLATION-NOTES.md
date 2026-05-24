# Translation Notes

## Provenance

The isiZulu, isiXhosa, and Afrikaans translations in this folder were filled by **AI machine translation (Claude)** during development. Native-speaker QA and clinical review are **required** before launch.

## What was translated

- All UI chrome, page bodies, button labels, and the 56 questionnaire questions.
- Counts of newly added keys per language (already-existing hand-done translations were preserved):
  - **zu**: 0 keys added
  - **xh**: 0 keys added
  - **af**: 0 keys added

## What stays untranslated (intentional, across all languages)

Brand names, proper nouns, place names, work titles, drug names, and acronyms:

- Brand: `Mandi`, `JoinMandi`, `JoinMandi.com`, `MrsKing Productions`, `The Yolk!`, `Mandi Blanket`, `Mandi Café`, `Mandi Events`, `MenoScore`
- People: `Hermi King`, `Dr Funeka Bango`, `Sarah Baartman`, `Anarcha`, `Betsey`, `Lucy`, `Maya Angelou`, `Dr Louise Newson`, `Dr Mary Claire Haver`, `Dr Lisa Mosconi`
- Media: `kykNET`, `Meer as Warm Gloede`, `MIDI`
- Places: `Cape Town`, `Soweto`, `Stellenbosch`, `Durban`, `Woodstock`, `Western Cape`, `Gauteng`, `KwaZulu-Natal`, `Eastern Cape` and the other SA provinces
- Acronyms: `POPIA`, `HRT`, `WHI`, `FDA`, `NICE`, `NHS`, `SADAG`, `UTI`, `BMI`, `GP`
- Pharmacology: `Premarin`, `Provera`, `Estradiol`, `Prometrium`, `Utrogestan`, `MPA`

## Clinical review queue

See `CLINICAL-REVIEW.md` for the full list of clinical strings awaiting Dr Bango's sign-off.

## Language confidence (self-reported by the AI)

- **Afrikaans**: high.
- **isiZulu**: moderate — medical terms often borrowed from English with Bantu prefix (i-HRT, i-oestrogen, i-menopause).
- **isiXhosa**: moderate — same borrowing convention as isiZulu.

## Workflow for human edits

1. Open the relevant `{zu,xh,af}/common.json`.
2. Find the key (the structure mirrors `en/common.json`).
3. Replace the value. Keep `{{placeholders}}` intact.
4. Save and reload — the dev server hot-reloads JSON.
5. Mark the clinical-review row Approved (if applicable).

