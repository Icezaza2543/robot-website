"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, CalendarDays } from "lucide-react";
import RoomCalendar from "@/components/ui/RoomCalendar";

export default function RoomsCalendarPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/rooms").then(res => res.json()),
      fetch("/api/room/reservations").then(res => res.json())
    ])
    .then(([roomsData, resData]) => {
      setRooms(roomsData || []);
      if (!resData.error) {
        setReservations(resData || []);
      }
    })
    .catch(console.error)
    .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
      <Link href="/rooms" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition mb-6">
        <ChevronLeft className="w-4 h-4" /> กลับหน้ารวมห้อง
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">ตารางการจองใช้ห้อง</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">ภาพรวมการใช้งานห้องทั้งหมด รองรับมุมมองรายเดือนและรายสัปดาห์</p>
          </div>
        </div>

        <RoomCalendar rooms={rooms} reservations={reservations} />
      </div>
    </div>
  );
}
