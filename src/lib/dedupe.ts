// Loose name matching so a profile entry ("Karimeen Pollichathu") isn't shown twice
// next to a researched one ("Karimeen pollichathu").
const words = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter((w) => w.length >= 5);

export function isCovered(name: string, existing: string[]): boolean {
  const n = name.toLowerCase().replace(/[^a-z]/g, "");
  const nw = words(name);
  return existing.some((e) => {
    const k = e.toLowerCase().replace(/[^a-z]/g, "");
    if (!k || !n) return false;
    if (k.includes(n) || n.includes(k)) return true;
    const ew = new Set(words(e));
    return nw.some((w) => ew.has(w));
  });
}

/** Profile names not already covered by researched entries. */
export const uncovered = (profile: string[], researched: string[]) => profile.filter((n) => !isCovered(n, researched));
