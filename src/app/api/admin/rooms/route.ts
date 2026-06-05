import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRooms, createRoom, updateRoom, deleteRoom } from "@/lib/googleSheets";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return false;
  const permissions = session.user.permissions || [];
  return permissions.includes("*") || permissions.includes("manage_rooms"); // Or whatever permission they use for rooms. Let's use manage_rooms or *
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rooms = await getRooms();
    return NextResponse.json(rooms); // Returns all rooms, active and inactive
  } catch (error) {
    console.error("[API] GET /api/admin/rooms error:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { roomId, roomName, floor, building, description, coverImage, galleryImages, maxHours, allowedDays, status } = body;

    if (!roomId || !roomName || !maxHours || !allowedDays) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const room = {
      roomId,
      roomName,
      floor: floor || "",
      building: building || "",
      description: description || "",
      coverImage: coverImage || "",
      galleryImages: galleryImages || "",
      maxHours: parseInt(maxHours, 10) || 3,
      allowedDays: allowedDays || "1,2,3,4,5",
      status: status || "active"
    };

    const success = await createRoom(room as any);
    if (success) {
      return NextResponse.json({ message: "Room created", data: room });
    } else {
      return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] POST /api/admin/rooms error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { roomId, roomName, floor, building, description, coverImage, galleryImages, maxHours, allowedDays, status } = body;

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    const rooms = await getRooms();
    const existing = rooms.find(r => r.roomId === roomId);
    if (!existing) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const updated = {
      ...existing,
      roomName: roomName !== undefined ? roomName : existing.roomName,
      floor: floor !== undefined ? floor : existing.floor,
      building: building !== undefined ? building : existing.building,
      description: description !== undefined ? description : existing.description,
      coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
      galleryImages: galleryImages !== undefined ? galleryImages : existing.galleryImages,
      maxHours: maxHours !== undefined ? parseInt(maxHours, 10) : existing.maxHours,
      allowedDays: allowedDays !== undefined ? allowedDays : existing.allowedDays,
      status: status !== undefined ? status : existing.status,
    };

    const success = await updateRoom(updated as any);
    if (success) {
      return NextResponse.json({ message: "Room updated", data: updated });
    } else {
      return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] PATCH /api/admin/rooms error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('id');

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    const success = await deleteRoom(roomId);
    if (success) {
      return NextResponse.json({ message: "Room deleted (set to inactive)" });
    } else {
      return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] DELETE /api/admin/rooms error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
