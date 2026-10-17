/** How far a rect sits from the reading start: from the left in English, from the right in Arabic */
export const fromStart = (r: DOMRect) => (document.documentElement.dir === "rtl" ? innerWidth - r.right : r.left);
