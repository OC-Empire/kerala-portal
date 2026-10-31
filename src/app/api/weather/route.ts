import { NextResponse } from "next/server";

const MOCK_WEATHER = [
  { district: "Thiruvananthapuram", temp: 31, condition: "Partly Cloudy", humidity: 72, icon: "⛅" },
  { district: "Kochi",              temp: 29, condition: "Light Rain",     humidity: 85, icon: "🌦️" },
  { district: "Kozhikode",          temp: 30, condition: "Mostly Clear",   humidity: 68, icon: "🌤️" },
  { district: "Munnar",             temp: 18, condition: "Misty",          humidity: 92, icon: "🌫️" },
  { district: "Alappuzha",          temp: 30, condition: "Sunny",          humidity: 78, icon: "☀️" },
  { district: "Kannur",             temp: 28, condition: "Cloudy",         humidity: 80, icon: "🌥️" },
  { district: "Wayanad",            temp: 22, condition: "Overcast",       humidity: 88, icon: "☁️" },
  { district: "Thrissur",           temp: 32, condition: "Hot & Sunny",    humidity: 65, icon: "☀️" },
];

const COORDS: Record<string, { lat: number; lon: number }> = {
  Thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
  Kochi: { lat: 9.9312, lon: 76.2673 },
  Kozhikode: { lat: 11.2588, lon: 75.7804 },
  Munnar: { lat: 10.0889, lon: 77.0595 },
  Alappuzha: { lat: 9.4981, lon: 76.3388 },
  Kannur: { lat: 11.8745, lon: 75.3704 },
  Wayanad: { lat: 11.6854, lon: 76.132 },
  Thrissur: { lat: 10.5276, lon: 76.2144 },
};

export async function GET() {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    return NextResponse.json({ weather: MOCK_WEATHER, updatedAt: new Date().toISOString(), source: "mock" });
  }
  try {
    const results = await Promise.all(
      Object.entries(COORDS).map(async ([district, { lat, lon }]) => {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`,
          { next: { revalidate: 600 } }
        );
        const j = await res.json();
        const iconMap: Record<string, string> = {
          Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️", Mist: "🌫️", Fog: "🌫️", Thunderstorm: "⛈️",
        };
        return {
          district,
          temp: Math.round(j.main?.temp ?? 0),
          condition: j.weather?.[0]?.description ?? "Unknown",
          humidity: j.main?.humidity ?? 0,
          icon: iconMap[j.weather?.[0]?.main] ?? "🌤️",
        };
      })
    );
    return NextResponse.json({ weather: results, updatedAt: new Date().toISOString(), source: "openweathermap" });
  } catch (e) {
    console.error("weather fetch error", e);
    return NextResponse.json({ weather: MOCK_WEATHER, updatedAt: new Date().toISOString(), source: "mock_fallback" });
  }
}