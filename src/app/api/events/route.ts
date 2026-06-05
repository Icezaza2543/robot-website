import { NextResponse } from "next/server";
import { getEvents, getEventParticipants } from "@/lib/googleSheets";

export async function GET() {
  try {
    const events = await getEvents();
    const sortedEvents = [...events].reverse();
    const participants = await getEventParticipants();
    
    return NextResponse.json({ events: sortedEvents, participants });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
