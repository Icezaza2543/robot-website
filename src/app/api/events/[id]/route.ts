import { NextResponse } from "next/server";
import { getEvents, getEventParticipants } from "@/lib/googleSheets";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const events = await getEvents();
    const event = events.find((e) => e.id === params.id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const participants = await getEventParticipants(params.id);

    return NextResponse.json({ event, participants });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json({ error: "Failed to fetch event details" }, { status: 500 });
  }
}
