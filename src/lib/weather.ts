import "server-only";

// Real current conditions from Open-Meteo (free, no API key). Cached 10 minutes.
export interface WeatherReport {
  district: string;
  temp: number;
  humidity: number;
  condition: string;
  icon: string;
}

const PLACES = [
  { district: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
  { district: "Kochi", lat: 9.9312, lon: 76.2673 },
  { district: "Kozhikode", lat: 11.2588, lon: 75.7804 },
  { district: "Munnar", lat: 10.0889, lon: 77.0595 },
  { district: "Alappuzha", lat: 9.4981, lon: 76.3388 },
];

// WMO weather codes -> label + icon
function describe(code: number, isDay: boolean): { condition: string; icon: string } {
  if (code === 0) return { condition: isDay ? "Sunny" : "Clear", icon: isDay ? "☀️" : "🌙" };
  if (code === 1) return { condition: "Mostly clear", icon: isDay ? "🌤️" : "🌙" };
  if (code === 2) return { condition: "Partly cloudy", icon: isDay ? "⛅" : "☁️" };
  if (code === 3) return { condition: "Overcast", icon: "☁️" };
  if (code === 45 || code === 48) return { condition: "Fog", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { condition: "Drizzle", icon: "🌦️" };
  if (code >= 61 && code <= 67) return { condition: "Rain", icon: "🌧️" };
  if (code >= 80 && code <= 82) return { condition: "Rain showers", icon: "🌧️" };
  if (code >= 95) return { condition: "Thunderstorm", icon: "⛈️" };
  return { condition: "Cloudy", icon: "☁️" };
}

/** Returns [] if the weather service is unavailable (callers must handle that). */
export async function getWeather(): Promise<WeatherReport[]> {
  try {
    const qs = new URLSearchParams({
      latitude: PLACES.map((p) => p.lat).join(","),
      longitude: PLACES.map((p) => p.lon).join(","),
      current: "temperature_2m,relative_humidity_2m,weather_code,is_day",
      timezone: "Asia/Kolkata",
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${qs}`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`open-meteo ${res.status}`);
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [data];
    return PLACES.flatMap((p, i) => {
      const c = arr[i]?.current;
      if (!c) return [];
      const d = describe(c.weather_code, c.is_day === 1);
      return [{ district: p.district, temp: Math.round(c.temperature_2m), humidity: Math.round(c.relative_humidity_2m), ...d }];
    });
  } catch (e) {
    console.error("weather fetch error", e);
    return [];
  }
}
