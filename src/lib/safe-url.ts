/** Only ever render http(s) links from data we didn't author (CSV imports etc.). */
export function safeHref(u?: string | null): string | null {
  if (!u) return null;
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
