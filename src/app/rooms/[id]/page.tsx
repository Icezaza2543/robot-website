"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Clock, Calendar as CalendarIcon, Info, Image as ImageIcon, Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function RoomDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [room, setRoom] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [specialReason, setSpecialReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enforce Login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/rooms/${id}`);
    }
  }, [status, router, id]);

  useEffect(() => {
    Promise.all([
      fetch("/api/rooms").then(res => res.json()),
      fetch("/api/room/reservations").then(res => res.json())
    ]).then(([roomsData, resData]) => {
      const foundRoom = roomsData.find((r: any) => r.roomId === id);
      setRoom(foundRoom || null);

      // Filter reservations for this room only
      if (resData && !resData.error) {
        setReservations(resData.filter((r: any) => r.roomId === id));
      }
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
  }

  if (!room) {
    return <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบห้องนี้</h1>
      <Link href="/rooms" className="text-orange-500 hover:underline">กลับไปหน้ารวมห้อง</Link>
    </div>;
  }

  // Validate limits
  let isSpecialRequest = false;
  let limitWarning = "";

  if (date && startTime && endTime) {
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (diffHours <= 0) {
      limitWarning = "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น";
    } else {
      if (diffHours > room.maxHours) {
        isSpecialRequest = true;
        limitWarning = `ระยะเวลาจอง (${diffHours} ชม.) เกินขีดจำกัดของห้องนี้ (${room.maxHours} ชม.)`;
      }

      // JS getDay() returns 0 for Sun, 1 for Mon. room.allowedDays is string like "1,2,3,4,5"
      // Assuming allowedDays string format: 1=Mon, 7=Sun or 0=Sun. Let's assume standard JS format (0=Sun) but users usually enter 1-7.
      // Let's just check if the JS getDay() string matches the allowed days.
      // We'll normalize it: if getDay() is 0 (Sunday), user might mean 7.
      const jsDay = start.getDay();
      const userDay = jsDay === 0 ? 7 : jsDay;
      // check if userDay is in allowedDays
      const allowed = room.allowedDays.split(",").map((d: string) => parseInt(d.trim()));
      if (!allowed.includes(jsDay) && !allowed.includes(userDay)) {
        isSpecialRequest = true;
        limitWarning = limitWarning ? limitWarning + " และไม่อนุญาตให้จองในวันนี้" : "ไม่อนุญาตให้จองในวันนี้ (ตามตั้งค่าของห้อง)";
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "authenticated") {
      // alert("กรุณาเข้าสู่ระบบก่อนทำการจอง");
      router.push("/login");
      return;
    }

    if (isSpecialRequest && !specialReason) {
      alert("กรุณาระบุเหตุผลการขออนุมัติพิเศษ");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: `res-${Date.now()}`,
        roomId: room.roomId,
        title,
        startDate: new Date(`${date}T${startTime}`).toISOString(),
        endDate: new Date(`${date}T${endTime}`).toISOString(),
        isSpecialRequest,
        specialReason
      };

      const res = await fetch("/api/room/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("ส่งคำขอจองห้องสำเร็จ! กรุณารอการอนุมัติจากผู้ดูแล");
        router.push("/rooms");
      } else {
        const data = await res.json();
        alert(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get reservations for the selected date
  const selectedDateReservations = reservations.filter(res => {
    if (!date) return false;
    const resDate = new Date(res.startDate).toISOString().split('T')[0];
    return resDate === date;
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
      <Link href="/rooms" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition mb-6">
        <ChevronLeft className="w-4 h-4" /> กลับหน้ารวมห้อง
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Room Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-64 bg-gray-100 relative">
              {room.coverImage ? (
                <img src={room.coverImage} alt={room.roomName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="w-12 h-12" /></div>
              )}
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-black text-gray-900 mb-2">{room.roomName}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-6">
                <MapPin className="w-4 h-4 text-orange-500" />
                {room.building} (ชั้น {room.floor})
              </div>

              <div className="bg-orange-50 rounded-2xl p-4 mb-6">
                <h3 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3">เงื่อนไขการจอง</h3>
                <div className="space-y-2 text-sm font-medium text-orange-900/80">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> จำกัดเวลาสูงสุด</span>
                    <span className="font-bold text-orange-600">{room.maxHours} ชม./ครั้ง</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> วันที่อนุญาต</span>
                    <span className="font-bold text-orange-600">{room.allowedDays}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-gray-400" /> รายละเอียดห้อง</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{room.description || "ไม่มีรายละเอียด"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Form & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">จองห้องนี้</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">หัวข้อ/วัตถุประสงค์การจอง *</label>
                <input
                  required type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium"
                  placeholder="เช่น ประชุมโปรเจกต์รายวิชา..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">วันที่ต้องการจอง *</label>
                  <input
                    required type="date" value={date} onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">เวลาเริ่มต้น *</label>
                  <input
                    required type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">เวลาสิ้นสุด *</label>
                  <input
                    required type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium"
                  />
                </div>
              </div>

              {isSpecialRequest && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-red-800 mb-1">จำเป็นต้องขออนุมัติพิเศษ (Special Request)</h4>
                      <p className="text-xs text-red-600 mb-4">{limitWarning}</p>

                      <label className="block text-sm font-bold text-red-800 mb-2">โปรดระบุเหตุผลความจำเป็น *</label>
                      <textarea
                        required value={specialReason} onChange={e => setSpecialReason(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition font-medium text-sm min-h-[80px]"
                        placeholder="อธิบายเหตุผลที่คุณต้องการใช้ห้องเกินขีดจำกัด หรือใช้นอกเวลาทำการ..."
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit" disabled={isSubmitting || !date || !startTime || !endTime}
                className="w-full py-4 bg-gray-900 hover:bg-orange-500 text-white rounded-xl font-bold transition disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "ส่งคำขอจองห้อง"}
              </button>
            </form>
          </div>

          {/* Daily Schedule Preview */}
          {date && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-orange-500" /> ตารางการใช้งานวันที่ {new Date(date).toLocaleDateString('th-TH')}
              </h3>

              {selectedDateReservations.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-medium text-sm bg-gray-50 rounded-2xl">
                  ยังไม่มีคิวการใช้งานในวันนี้
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateReservations.map(res => (
                    <div key={res.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                      <div className="font-bold text-orange-600 bg-orange-100 px-3 py-1.5 rounded-lg text-sm shrink-0">
                        {new Date(res.startDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} -
                        {new Date(res.endDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{res.title}</div>
                        <div className="text-xs text-gray-500">{res.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
