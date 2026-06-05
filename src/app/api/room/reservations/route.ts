import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getRoomReservations, createRoomReservation, getRooms } from "@/lib/googleSheets";

// Helper: check if two time ranges overlap (exclusive boundary)
function isOverlapping(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allReservations = await getRoomReservations();

    const userEmail = session?.user?.email || "";

    // Public calendar: approved only. Authenticated users also see their own.
    const visibleReservations = allReservations.filter(
      (r) => r.status === "approved" || (userEmail && r.email === userEmail)
    );

    return NextResponse.json(visibleReservations);
  } catch (error) {
    console.error("[API] GET /api/room/reservations error:", error);
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, roomId, title, startDate, endDate, specialReason } = body;

    if (!id || !roomId || !title || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // ── Validation 1: end must be after start ───────────────────────────────
    if (end <= start) {
      return NextResponse.json(
        { error: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น" },
        { status: 400 }
      );
    }

    // ── Validation 2: same-day booking only ─────────────────────────────────
    const startDay = start.toISOString().split("T")[0];
    const endDay = end.toISOString().split("T")[0];
    if (startDay !== endDay) {
      return NextResponse.json(
        { error: "ไม่อนุญาตให้จองข้ามวัน กรุณาระบุการจองภายในวันเดียวกัน" },
        { status: 400 }
      );
    }

    // ── Fetch room to validate rules ─────────────────────────────────────────
    const rooms = await getRooms();
    const room = rooms.find((r) => r.roomId === roomId);
    if (!room || room.status !== "active") {
      return NextResponse.json(
        { error: "ไม่พบห้องนี้หรือห้องไม่พร้อมใช้งาน" },
        { status: 404 }
      );
    }

    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    // JS getDay(): 0=Sun, 1=Mon … 6=Sat. Admin may use 1-7 (7=Sun) or 0-6.
    const jsDay = start.getDay();
    const userDay = jsDay === 0 ? 7 : jsDay;
    const allowed = room.allowedDays
      .split(",")
      .map((d: string) => parseInt(d.trim(), 10));
    const dayAllowed = allowed.includes(jsDay) || allowed.includes(userDay);

    // ── Validation 3: enforce room rules (server-authoritative) ───────────────
    let serverIsSpecialRequest = false;
    const violations: string[] = [];

    if (diffHours > room.maxHours) {
      serverIsSpecialRequest = true;
      violations.push(
        `ระยะเวลาจอง (${diffHours.toFixed(1)} ชม.) เกินขีดจำกัดของห้องนี้ (${room.maxHours} ชม.)`
      );
    }
    if (!dayAllowed) {
      serverIsSpecialRequest = true;
      violations.push("ไม่อนุญาตให้จองในวันนี้ตามการตั้งค่าของห้อง");
    }

    if (serverIsSpecialRequest && !specialReason?.trim()) {
      return NextResponse.json(
        {
          error: `การจองนี้ต้องขออนุมัติพิเศษ: ${violations.join(", ")} — กรุณาระบุเหตุผล`,
          requiresSpecialReason: true,
          violations,
        },
        { status: 400 }
      );
    }

    // ── Validation 4: Overlap check against APPROVED reservations ────────────
    const allReservations = await getRoomReservations();
    const approvedForRoom = allReservations.filter(
      (r) => r.roomId === roomId && r.status === "approved"
    );

    const conflicting = approvedForRoom.find((r) =>
      isOverlapping(start, end, new Date(r.startDate), new Date(r.endDate))
    );

    if (conflicting) {
      return NextResponse.json(
        {
          error: `ช่วงเวลา ${start.toLocaleTimeString("th-TH")} – ${end.toLocaleTimeString("th-TH")} ซ้อนทับกับคิวที่อนุมัติแล้ว (${conflicting.name}: ${conflicting.title}) กรุณาเลือกเวลาอื่น`,
          conflictId: conflicting.id,
        },
        { status: 409 }
      );
    }

    // ── Create reservation ────────────────────────────────────────────────────
    const reservation = {
      id,
      roomId,
      email: session.user.email,
      name: session.user.name || "",
      title,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      status: "pending" as const,
      isSpecialRequest: serverIsSpecialRequest ? "TRUE" : "FALSE",
      specialReason: specialReason || "",
      createdAt: new Date().toISOString(),
      rejectReason: "",
    };

    const success = await createRoomReservation(reservation);

    if (success) {
      return NextResponse.json({ message: "Reservation created successfully", data: reservation });
    } else {
      return NextResponse.json(
        { error: "Failed to create reservation in Google Sheets" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API] POST /api/room/reservations error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing reservation ID" }, { status: 400 });
    }

    const { getRoomReservations: fetchAll, deleteRoomReservation } = await import(
      "@/lib/googleSheets"
    );
    const reservations = await fetchAll();
    const reservation = reservations.find((r) => r.id === id);

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }
    if (reservation.email !== session.user.email) {
      return NextResponse.json(
        { error: "You can only cancel your own reservations" },
        { status: 403 }
      );
    }
    if (reservation.status === "approved") {
      return NextResponse.json(
        { error: "ไม่สามารถยกเลิกคำขอที่อนุมัติแล้วได้ กรุณาติดต่อผู้ดูแล" },
        { status: 403 }
      );
    }

    const success = await deleteRoomReservation(id);

    if (success) {
      return NextResponse.json({ message: "Reservation cancelled successfully" });
    } else {
      return NextResponse.json({ error: "Failed to cancel reservation" }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] DELETE /api/room/reservations error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, roomId, title, startDate, endDate, isSpecialRequest, specialReason } = body;

    if (!id || !roomId || !title || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { getRoomReservations: fetchAll, updateRoomReservation } = await import(
      "@/lib/googleSheets"
    );
    const reservations = await fetchAll();
    const existing = reservations.find((r) => r.id === id);

    if (!existing) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }
    if (existing.email !== session.user.email) {
      return NextResponse.json(
        { error: "You can only edit your own reservations" },
        { status: 403 }
      );
    }
    if (existing.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending reservations can be edited" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return NextResponse.json(
        { error: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น" },
        { status: 400 }
      );
    }

    const startDay = start.toISOString().split("T")[0];
    const endDay = end.toISOString().split("T")[0];
    if (startDay !== endDay) {
      return NextResponse.json(
        { error: "ไม่อนุญาตให้จองข้ามวัน" },
        { status: 400 }
      );
    }

    // Overlap check excluding self
    const approvedForRoom = reservations.filter(
      (r) => r.roomId === roomId && r.status === "approved" && r.id !== id
    );
    const conflicting = approvedForRoom.find((r) =>
      isOverlapping(start, end, new Date(r.startDate), new Date(r.endDate))
    );
    if (conflicting) {
      return NextResponse.json(
        { error: "ช่วงเวลาใหม่ซ้อนทับกับคิวที่อนุมัติแล้ว กรุณาเลือกเวลาอื่น" },
        { status: 409 }
      );
    }

    const updated = {
      ...existing,
      roomId,
      title,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      isSpecialRequest: isSpecialRequest ? "TRUE" : "FALSE",
      specialReason: specialReason || "",
    };

    const success = await updateRoomReservation(updated);

    if (success) {
      return NextResponse.json({ message: "Reservation updated successfully", data: updated });
    } else {
      return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] PATCH /api/room/reservations error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
