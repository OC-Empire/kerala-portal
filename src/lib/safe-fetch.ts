import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// SSRF-safe fetch: https only, public IPs only (re-checked on every redirect),
// bounded redirects, bounded body size.

function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    if (v === "::1" || v === "::") return true;
    if (v.startsWith("fe80") || v.startsWith("fc") || v.startsWith("fd")) return true;
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);
    // URL parsing normalises IPv4-mapped addresses to hex: ::ffff:7f00:1
    const hex = v.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hex) {
      const hi = parseInt(hex[1], 16), lo = parseInt(hex[2], 16);
      return isPrivateIp(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
    }
    return false;
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) || // link-local + cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    a >= 224
  );
}

async function assertPublicHttps(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("invalid url");
  }
  if (url.protocol !== "https:") throw new Error("https only");
  if (url.username || url.password) throw new Error("credentials not allowed");
  if (url.port && url.port !== "443") throw new Error("port not allowed");

  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("host not allowed");
  }

  const addrs = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) {
    throw new Error("host not allowed");
  }
  return url;
}

export async function safeFetchText(
  rawUrl: string,
  opts: { timeoutMs?: number; maxBytes?: number; maxRedirects?: number; headers?: Record<string, string> } = {}
): Promise<{ text: string; finalUrl: string; contentType: string }> {
  const { timeoutMs = 8000, maxBytes = 1_000_000, maxRedirects = 3, headers } = opts;
  const signal = AbortSignal.timeout(timeoutMs);
  let current = rawUrl;

  for (let i = 0; i <= maxRedirects; i++) {
    const url = await assertPublicHttps(current);
    const res = await fetch(url, { redirect: "manual", signal, headers });

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error("bad redirect");
      current = new URL(loc, url).toString();
      continue;
    }
    if (!res.ok) throw new Error(`upstream ${res.status}`);

    const contentType = res.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
      throw new Error("unsupported content type");
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("no body");
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > maxBytes) {
        await reader.cancel();
        break; // truncate rather than fail; meta tags are near the top
      }
      chunks.push(value);
    }
    const text = new TextDecoder().decode(Buffer.concat(chunks));
    return { text, finalUrl: url.toString(), contentType };
  }
  throw new Error("too many redirects");
}
