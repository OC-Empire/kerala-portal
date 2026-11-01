import { NextResponse } from "next/server";
import { getWeather } from "@/lib/weather";

export async function GET() {
  const weather = await getWeather();
  if (!weather.length) {
    return NextResponse.json({ error: "Weather is temporarily unavailable" }, { status: 502 });
  }
  return NextResponse.json({ weather, updatedAt: new Date().toISOString(), source: "open-meteo" });
}
