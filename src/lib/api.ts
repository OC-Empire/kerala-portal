const BASE = "";

export async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export interface NewsResponse {
  news: import("@/lib/news").NewsItem[];
  total: number;
}

export interface DistrictsResponse {
  districts: import("@/lib/districts").District[];
  total: number;
}

export async function getNews(params?: {
  category?: string;
  district?: string;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.district) qs.set("district", params.district);
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return fetchJSON<NewsResponse>(`/api/news${q ? "?" + q : ""}`);
}

export async function getDistricts() {
  return fetchJSON<DistrictsResponse>("/api/districts");
}

export async function getWeather(district: string) {
  return fetchJSON<{ weather: unknown }>(`/api/weather?district=${encodeURIComponent(district)}`);
}