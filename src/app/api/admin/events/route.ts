import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { addEvent, updateEvent, deleteEvent, getEvents, getEventParticipants } from "@/lib/googleSheets";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_news"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const events = await getEvents();
    const sortedEvents = [...events].reverse();
    const participants = await getEventParticipants();
    return NextResponse.json({ events: sortedEvents, participants });
  } catch (error) {
    console.error("Error fetching admin events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_news"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const data = await request.json();
    const { id, title, date, location, description, imageUrl, maxParticipants, status } = data;

    if (!title || !date) {
      return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
    }

    const newEvent = {
      id: String(id || Date.now().toString()),
      title: String(title).trim(),
      date: String(date).trim(),
      location: String(location || "").trim(),
      description: String(description || "").trim(),
      imageUrl: String(imageUrl || "").trim(),
      maxParticipants: parseInt(maxParticipants || "0", 10) || 0,
      status: (String(status || "active").trim() as 'active' | 'closed'),
    };

    const success = await addEvent(newEvent);
    if (!success) {
      return NextResponse.json({ error: "Failed to add event to Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "Event added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/events:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_news"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const data = await request.json();
    const { id, ...updates } = data;

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = String(updates.title).trim();
    if (updates.date !== undefined) updateData.date = String(updates.date).trim();
    if (updates.location !== undefined) updateData.location = String(updates.location).trim();
    if (updates.description !== undefined) updateData.description = String(updates.description).trim();
    if (updates.imageUrl !== undefined) updateData.imageUrl = String(updates.imageUrl).trim();
    if (updates.maxParticipants !== undefined) updateData.maxParticipants = parseInt(updates.maxParticipants, 10) || 0;
    if (updates.status !== undefined) updateData.status = String(updates.status).trim() as 'active' | 'closed';

    const success = await updateEvent(id, updateData);
    if (!success) {
      return NextResponse.json({ error: "Failed to update event in Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "Event updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/admin/events:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(await hasPermission(session.user.role, "manage_news"))) {
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const success = await deleteEvent(id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete event in Google Sheets" }, { status: 500 });
    }

    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/admin/events:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
