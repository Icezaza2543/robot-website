import { NextResponse } from "next/server";
import { getRooms } from "@/lib/googleSheets";

export async function GET() {
  try {
    const rooms = await getRooms();
    // Return only active rooms to the public
    const activeRooms = rooms.filter(r => r.status === "active");
    return NextResponse.json(activeRooms);
  } catch (error) {
    console.error("[API] GET /api/rooms error:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}
