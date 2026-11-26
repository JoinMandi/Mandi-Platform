/** Languages a Mandi doctor can consult in (application form). */
export const DOCTOR_LANGUAGES = [
  "English",
  "isiZulu",
  "isiXhosa",
  "Afrikaans",
  "Sepedi",
  "Setswana",
  "Sesotho",
  "Xitsonga",
  "siSwati",
  "Tshivenda",
  "isiNdebele",
  "South African Sign Language",
] as const;

export type DoctorLanguage = (typeof DOCTOR_LANGUAGES)[number];
