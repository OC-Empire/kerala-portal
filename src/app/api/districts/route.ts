import { NextResponse } from "next/server";
import { DISTRICTS, KERALA_STATS } from "@/lib/districts";

export async function GET() {
  return NextResponse.json({ districts: DISTRICTS, stats: KERALA_STATS });
}
