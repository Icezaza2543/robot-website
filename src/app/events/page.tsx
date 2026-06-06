"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";

export default function AllEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (data?.events) {
          setEvents(data.events);
          setParticipants(data.participants || []);
        } else if (Array.isArray(data)) {
          setEvents(data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch events", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Calendar className="w-10 h-10 text-blue-500" />
            โครงการและกิจกรรมทั้งหมด
          </h1>
          <p className="text-gray-500 mt-3 font-medium text-lg">
            เลือกดูกิจกรรมที่น่าสนใจและลงทะเบียนเข้าร่วมได้เลย
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-24 text-center flex flex-col items-center shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700">ขณะนี้ยังไม่มีโครงการ/กิจกรรม</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => {
              const eventParticipants = participants.filter(p => p.eventId === event.id);
              return (
                <Link
                  href={`/events/${event.id}`}
                  key={event.id}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                >
                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                        <Calendar className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md ${event.status === 'active' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                        {event.status === 'active' ? 'เปิดรับสมัคร' : 'ปิดแล้ว'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 line-clamp-2 transition-colors">{event.title}</h3>
                    <div className="mt-4 flex flex-col gap-2 text-sm font-medium text-gray-500 mt-auto">
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> {event.date}</div>
                      
                      <div className="mt-3 w-full">
                        <div className="flex justify-between text-[11px] text-gray-400 mb-1.5 font-bold">
                          <span>สมัครแล้ว {eventParticipants.length} คน</span>
                          {event.maxParticipants > 0 ? (
                            <span>รับ {event.maxParticipants} คน</span>
                          ) : (
                            <span>ไม่จำกัดจำนวน</span>
                          )}
                        </div>
                        {event.maxParticipants > 0 && (
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((eventParticipants.length / event.maxParticipants) * 100, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-gray-100 w-full">
                      <div className="w-full py-2.5 bg-orange-50 text-orange-600 text-sm font-bold rounded-xl text-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        เข้าร่วม
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
