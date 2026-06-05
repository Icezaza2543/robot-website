"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DoorOpen, MapPin, Clock, CalendarDays, Loader2, Image as ImageIcon } from "lucide-react";

export default function RoomsDirectoryPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rooms")
      .then(res => res.json())
      .then(data => {
        setRooms(data || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 min-h-[80vh]">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">ระบบจองห้อง</h1>
        <p className="text-lg text-gray-500 font-medium">เลือกห้องที่คุณต้องการใช้งาน ตรวจสอบตารางเวลา และทำรายการจองล่วงหน้า</p>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
          <DoorOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-500">ยังไม่มีห้องที่เปิดให้จองในขณะนี้</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map(room => (
            <Link key={room.roomId} href={`/rooms/${room.roomId}`} className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 overflow-hidden flex flex-col">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {room.coverImage ? (
                  <img src={room.coverImage} alt={room.roomName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="w-12 h-12" /></div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                  {room.roomName}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-gray-900 mb-2">{room.roomName}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-4">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  {room.building} (ชั้น {room.floor})
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-1">{room.description}</p>
                
                <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <Clock className="w-4 h-4 text-blue-500" />
                    สูงสุด {room.maxHours} ชม.
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <CalendarDays className="w-4 h-4 text-purple-500" />
                    จำกัดวันใช้งาน
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
