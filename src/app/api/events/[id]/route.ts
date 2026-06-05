import { NextResponse } from "next/server";
import { getEvents, getEventParticipants } from "@/lib/googleSheets";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = await getEvents();
    const event = events.find((e) => e.id === id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const participants = await getEventParticipants(id);

    return NextResponse.json({ event, participants });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json({ error: "Failed to fetch event details" }, { status: 500 });
  }
}
