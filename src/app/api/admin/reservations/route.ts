import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getRoomReservations,
  updateRoomReservationStatus,
  deleteRoomReservation,
} from "@/lib/googleSheets";

// Helper: check if two time ranges overlap (exclusive boundary)
function isOverlapping(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  const permissions = (session.user.permissions as string[]) || [];
  return permissions.includes("*") || permissions.includes("manage_rooms");
}

export async function GET() {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const reservations = await getRoomReservations();
    return NextResponse.json(reservations);
  } catch (error) {
    console.error("[API] GET /api/admin/reservations error:", error);
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, status, rejectReason } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Overlap check when admin tries to APPROVE ─────────────────────────────
    if (status === "approved") {
      const allReservations = await getRoomReservations();
      const target = allReservations.find((r) => r.id === id);

      if (!target) {
        return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
      }

      const targetStart = new Date(target.startDate);
      const targetEnd = new Date(target.endDate);

      // Check against all OTHER approved reservations in the same room
      const conflicts = allReservations.filter(
        (r) =>
          r.roomId === target.roomId &&
          r.status === "approved" &&
          r.id !== id &&
          isOverlapping(targetStart, targetEnd, new Date(r.startDate), new Date(r.endDate))
      );

      if (conflicts.length > 0) {
        const c = conflicts[0];
        const fmt = (d: string) =>
          new Date(d).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit" });
        return NextResponse.json(
          {
            error: `ไม่สามารถอนุมัติได้ — ช่วงเวลานี้ชนกับคิวที่อนุมัติแล้ว: "${c.title}" (${fmt(c.startDate)} – ${fmt(c.endDate)}) ของ ${c.name} กรุณาปฏิเสธหรือยกเลิกคิวที่ขัดแย้งก่อน`,
            conflictId: c.id,
          },
          { status: 409 }
        );
      }
    }

    const success = await updateRoomReservationStatus(id, status, rejectReason);
    if (success) {
      return NextResponse.json({ message: "Reservation status updated" });
    } else {
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] PATCH /api/admin/reservations error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await checkAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing reservation ID" }, { status: 400 });
    }

    const success = await deleteRoomReservation(id);
    if (success) {
      return NextResponse.json({ message: "Reservation deleted (cancelled)" });
    } else {
      return NextResponse.json({ error: "Failed to delete reservation" }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] DELETE /api/admin/reservations error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
