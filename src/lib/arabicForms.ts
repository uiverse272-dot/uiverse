/**
 * Arabic letters in their joined shapes (Unicode presentation forms), for the share-card renderer:
 * it draws Arabic but measures each letter in its standalone shape, so lines came out with gaps
 * and overflowed. Given the shapes up front, it draws and measures what it's given. Vowel marks
 * are dropped (they're optional, and the card font has no forms for them). The result is in logical
 * order; the caller writes it out right to left.
 */

/* letter → [final, initial, medial] presentation forms; standalone is the letter itself */
const FORMS: Record<string, [number, number?, number?]> = {
  "آ": [0xfe82], "أ": [0xfe84], "ؤ": [0xfe86], "إ": [0xfe88], "ئ": [0xfe8a, 0xfe8b, 0xfe8c],
  "ا": [0xfe8e], "ب": [0xfe90, 0xfe91, 0xfe92], "ة": [0xfe94], "ت": [0xfe96, 0xfe97, 0xfe98],
  "ث": [0xfe9a, 0xfe9b, 0xfe9c], "ج": [0xfe9e, 0xfe9f, 0xfea0], "ح": [0xfea2, 0xfea3, 0xfea4],
  "خ": [0xfea6, 0xfea7, 0xfea8], "د": [0xfeaa], "ذ": [0xfeac], "ر": [0xfeae], "ز": [0xfeb0],
  "س": [0xfeb2, 0xfeb3, 0xfeb4], "ش": [0xfeb6, 0xfeb7, 0xfeb8], "ص": [0xfeba, 0xfebb, 0xfebc],
  "ض": [0xfebe, 0xfebf, 0xfec0], "ط": [0xfec2, 0xfec3, 0xfec4], "ظ": [0xfec6, 0xfec7, 0xfec8],
  "ع": [0xfeca, 0xfecb, 0xfecc], "غ": [0xfece, 0xfecf, 0xfed0], "ف": [0xfed2, 0xfed3, 0xfed4],
  "ق": [0xfed6, 0xfed7, 0xfed8], "ك": [0xfeda, 0xfedb, 0xfedc], "ل": [0xfede, 0xfedf, 0xfee0],
  "م": [0xfee2, 0xfee3, 0xfee4], "ن": [0xfee6, 0xfee7, 0xfee8], "ه": [0xfeea, 0xfeeb, 0xfeec],
  "و": [0xfeee], "ى": [0xfef0], "ي": [0xfef2, 0xfef3, 0xfef4],
};
/* lam + alef is one ligature: [standalone, final] */
const LAM_ALEF: Record<string, [number, number]> = {
  "آ": [0xfef5, 0xfef6], "أ": [0xfef7, 0xfef8], "إ": [0xfef9, 0xfefa], "ا": [0xfefb, 0xfefc],
};
const MARKS = /[ً-ٰٟـ]/g; // vowel marks and tatweel

/* dual-joining letters connect on both sides; the rest (alef, dal, reh, waw…) only to the letter before */
const joinsNext = (c: string | undefined) => !!c && FORMS[c]?.[1] !== undefined;
const joinsPrev = (c: string | undefined) => !!c && c in FORMS;

export function arabicForms(text: string): string {
  const s = [...text.replace(MARKS, "")];
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const f = FORMS[c];
    if (!f) {
      out += c;
      continue;
    }
    const fromPrev = joinsNext(s[i - 1]);
    if (c === "ل" && s[i + 1] in LAM_ALEF) {
      out += String.fromCodePoint(LAM_ALEF[s[i + 1]][fromPrev ? 1 : 0]);
      i++;
      continue;
    }
    const toNext = f[1] !== undefined && joinsPrev(s[i + 1]);
    const code = fromPrev && toNext ? f[2] : fromPrev ? f[0] : toNext ? f[1] : undefined;
    out += code ? String.fromCodePoint(code) : c;
  }
  return out;
}
