"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle2 } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  maxParticipants: number;
  status: 'active' | 'closed';
}

interface EventParticipant {
  eventId: string;
  userEmail: string;
  joinedAt: string;
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data.event);
          setParticipants(data.participants || []);
        } else {
          setEvent(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  const handleJoin = async () => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/events/${id}`);
      return;
    }

    if (!session?.user?.email) return;

    try {
      setIsJoining(true);
      const res = await fetch("/api/events/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id, action: 'join' }),
      });

      if (res.ok) {
        toast.success("เข้าร่วมกิจกรรมสำเร็จ!");
        // Refresh participants
        const res2 = await fetch(`/api/events/${id}`);
        if (res2.ok) {
          const data2 = await res2.json();
          setParticipants(data2.participants || []);
        }
      } else {
        const data = await res.json();
        toast.error(`ไม่สามารถเข้าร่วมได้: ${data.error}`);
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-black text-gray-900">ไม่พบกิจกรรม</h1>
        <p className="mt-2 text-gray-500">กิจกรรมที่คุณกำลังค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <Link href="/" className="mt-6 rounded-2xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  const hasJoined = status === "authenticated" && session?.user?.email && participants.some(p => p.userEmail?.toLowerCase() === session.user.email?.toLowerCase());
  const isFull = event.maxParticipants > 0 && participants.length >= event.maxParticipants;
  const isClosed = event.status === 'closed';

  let buttonText = "เข้าร่วมกิจกรรม";
  let buttonDisabled = false;
  let buttonClasses = "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30";

  if (hasJoined) {
    buttonText = "เข้าร่วมแล้ว";
    buttonDisabled = true;
    buttonClasses = "bg-green-500 text-white cursor-default opacity-100 shadow-green-500/30";
  } else if (isClosed) {
    buttonText = "ปิดรับสมัครแล้ว";
    buttonDisabled = true;
    buttonClasses = "bg-gray-300 text-gray-500 cursor-not-allowed";
  } else if (isFull) {
    buttonText = "ที่นั่งเต็มแล้ว";
    buttonDisabled = true;
    buttonClasses = "bg-gray-300 text-gray-500 cursor-not-allowed";
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {event.imageUrl ? (
            <div className="w-full h-[400px] md:h-[500px] bg-gray-100 relative">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center">
              <Calendar className="w-16 h-16 text-white/50" />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-4">
                  กิจกรรมชมรม (Event)
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">{event.title}</h1>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={handleJoin}
                  disabled={buttonDisabled || isJoining}
                  className={`w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 ${buttonClasses} ${isJoining ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {hasJoined && <CheckCircle2 className="w-5 h-5" />}
                  {isJoining ? "กำลังดำเนินการ..." : buttonText}
                </button>
                {status === "unauthenticated" && !isClosed && !isFull && (
                  <p className="text-center text-xs text-gray-400 mt-3 font-medium">ต้องเข้าสู่ระบบก่อน</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase">วันที่จัดกิจกรรม</div>
                  <div className="font-bold text-gray-800">{event.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase">สถานที่</div>
                  <div className="font-bold text-gray-800 line-clamp-1">{event.location || 'ไม่ระบุ'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-end mb-1.5">
                    <div className="text-xs font-bold text-gray-400 uppercase">ผู้เข้าร่วม</div>
                    <div className="text-sm font-bold text-gray-800">
                      {participants.length} {event.maxParticipants > 0 ? `/ ${event.maxParticipants} คน` : 'คน'}
                    </div>
                  </div>
                  {event.maxParticipants > 0 && (
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500 rounded-full bg-orange-500"
                        style={{ width: `${Math.min((participants.length / event.maxParticipants) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="prose prose-orange max-w-none">
              <h3 className="text-xl font-black text-gray-900 mb-4 border-b border-gray-100 pb-2">รายละเอียดโครงการ</h3>
              <div className="whitespace-pre-wrap text-gray-600 leading-relaxed font-medium">
                {event.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
