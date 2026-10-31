import { NextResponse } from "next/server";

export async function GET() {
  // In production: integrate with OpenWeatherMap API
  const weatherData = [
    { district: "Thiruvananthapuram", temp: 31, condition: "Partly Cloudy", humidity: 72, icon: "⛅" },
    { district: "Kochi",              temp: 29, condition: "Light Rain",     humidity: 85, icon: "🌦️" },
    { district: "Kozhikode",          temp: 30, condition: "Mostly Clear",   humidity: 68, icon: "🌤️" },
    { district: "Munnar",             temp: 18, condition: "Misty",          humidity: 92, icon: "🌫️" },
    { district: "Alappuzha",          temp: 30, condition: "Sunny",          humidity: 78, icon: "☀️" },
    { district: "Kannur",             temp: 28, condition: "Cloudy",         humidity: 80, icon: "🌥️" },
    { district: "Wayanad",            temp: 22, condition: "Overcast",       humidity: 88, icon: "☁️" },
    { district: "Thrissur",           temp: 32, condition: "Hot & Sunny",    humidity: 65, icon: "☀️" },
  ];
  return NextResponse.json({ weather: weatherData, updatedAt: new Date().toISOString() });
}
