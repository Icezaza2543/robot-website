import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { joinEvent, leaveEvent } from "@/lib/googleSheets";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { eventId, action } = data; // action: 'join' | 'leave'

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    if (action === 'leave') {
      const success = await leaveEvent(eventId, session.user.email);
      if (!success) {
        return NextResponse.json({ error: "Failed to leave event" }, { status: 500 });
      }
      return NextResponse.json({ message: "Left event successfully" });
    } else {
      // Default action is 'join'
      const result = await joinEvent(eventId, session.user.email);
      if (!result.success) {
        return NextResponse.json({ error: result.message || "Failed to join event" }, { status: 400 });
      }
      return NextResponse.json({ message: "Joined event successfully" });
    }
  } catch (error) {
    console.error("Error in POST /api/events/join:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
