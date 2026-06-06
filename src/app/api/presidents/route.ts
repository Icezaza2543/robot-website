import { NextResponse } from "next/server";
import { getSheetPresidents } from "@/lib/googleSheets";

export async function GET() {
  try {
    const items = await getSheetPresidents();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching presidents:", error);
    return NextResponse.json({ error: "Failed to fetch presidents" }, { status: 500 });
  }
}
