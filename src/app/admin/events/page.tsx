"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings, X, Plus, Save, Search, Trash2, Edit2, UploadCloud, Calendar, Settings2, ShieldCheck, List, Users } from "lucide-react";
import toast from "react-hot-toast";
import ImageCropperModal from "@/components/ui/ImageCropperModal";
import Pagination from "@/components/ui/Pagination";

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

export default function AdminEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<EventItem[]>([]);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [isLoading, setIsLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formMaxParticipants, setFormMaxParticipants] = useState("0");
  const [formStatus, setFormStatus] = useState<'active' | 'closed'>('active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [editingItem, setEditingItem] = useState<EventItem | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");

  const thMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const parseThaiDate = (dateStr: string) => {
    try {
      const match = dateStr.match(/(\d{1,2})\s+(.+?)\s+(\d{2,4})\s+\((\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})\)/);
      if (!match) return null;
      const day = match[1].padStart(2, '0');
      const monthStr = match[2].trim();
      let monthIdx = thMonths.findIndex(m => m === monthStr) + 1;
      if (monthIdx === 0) return null;
      const month = monthIdx.toString().padStart(2, '0');
      let year = parseInt(match[3]);
      if (year < 100) year += 2500;
      const gregYear = year - 543;
      return {
        date: `${gregYear}-${month}-${day}`,
        startTime: match[4],
        endTime: match[5]
      };
    } catch(e) { return null; }
  };

  const formatThaiDate = (date: string, start: string, end: string) => {
    if (!date || !start || !end) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const year = (d.getFullYear() + 543).toString().slice(-2);
    return `${d.getDate()} ${thMonths[d.getMonth()]} ${year} (${start} - ${end})`;
  };

  const [cropperFileSrc, setCropperFileSrc] = useState<string | null>(null);
  const [cropperCallback, setCropperCallback] = useState<((url: string) => void) | null>(null);
  const [cropperAspect, setCropperAspect] = useState<number>(16 / 9);

  // New state to view participants
  const [viewingEvent, setViewingEvent] = useState<EventItem | null>(null);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/events");
      if (res.ok) {
        const data = await res.json();
        setItems(data.events || []);
        setParticipants(data.participants || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchItems();
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const userPermissions = session?.user?.permissions || [];
  const isAdmin = session?.user?.role === "admin";
  const canAccess = isAdmin || userPermissions.includes("manage_news") || userPermissions.includes("*");

  if (status === "unauthenticated" || (status === "authenticated" && !canAccess)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center px-4">
        <ShieldCheck className="w-16 h-16 text-gray-300 mb-2" />
        <h1 className="text-2xl font-black text-red-500">ปฏิเสธการเข้าใช้งาน</h1>
        <p className="text-gray-500 max-w-sm">เฉพาะผู้ควบคุมระบบที่มีสิทธิ์แอดมินเท่านั้นที่สามารถเข้าชมหน้านี้ได้</p>
        <button onClick={() => router.push("/")} className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500 active:scale-95">
          กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  const handleImageUploadSelect = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void, aspect: number = 16 / 9) => {
    const target = e.target;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropperFileSrc(reader.result?.toString() || null);
      setCropperCallback(() => setUrl);
      setCropperAspect(aspect);
      target.value = '';
    });
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedFile: File) => {
    try {
      setIsUploadingImage(true);
      setCropperFileSrc(null);
      const formData = new FormData();
      formData.append("file", croppedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (cropperCallback) cropperCallback(data.url);
      } else {
        const data = await res.json();
        toast.error(`อัปโหลดรูปภาพล้มเหลว: ${data.details || data.error || 'Unknown Error'}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsUploadingImage(false);
      setCropperCallback(null);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("กรุณากรอกหัวข้อและรายละเอียด");
      return;
    }

    if (!formDate || !formStartTime || !formEndTime) {
      toast.error("กรุณาเลือกวันและเวลาให้ครบถ้วน");
      return;
    }

    try {
      setIsSubmitting(true);
      const finalDate = formatThaiDate(formDate, formStartTime, formEndTime);
      
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          date: finalDate,
          location: formLocation,
          description: formDescription,
          imageUrl: formImageUrl,
          maxParticipants: formMaxParticipants,
          status: formStatus,
        }),
      });

      if (res.ok) {
        setFormTitle("");
        setFormDate("");
        setFormStartTime("");
        setFormEndTime("");
        setFormLocation("");
        setFormDescription("");
        setFormImageUrl("");
        setFormMaxParticipants("0");
        setFormStatus('active');
        setShowAddForm(false);
        toast.success("สร้างโครงการ/กิจกรรมสำเร็จ");
        await fetchItems();
      } else {
        const data = await res.json();
        toast.error(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string, title: string) => {
    if (!confirm(`ยืนยันการลบกิจกรรม "${title}" ออกจากระบบ?`)) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบกิจกรรมสำเร็จ");
        await fetchItems();
      } else {
        toast.error("ไม่สามารถลบได้");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    
    let finalDate = editingItem.date;
    if (editDate && editStartTime && editEndTime) {
      finalDate = formatThaiDate(editDate, editStartTime, editEndTime);
    } else {
      toast.error("กรุณาเลือกวันและเวลาให้ครบถ้วน");
      return;
    }

    try {
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingItem, date: finalDate }),
      });

      if (res.ok) {
        setEditingItem(null);
        toast.success("อัปเดตกิจกรรมสำเร็จ");
        await fetchItems();
      } else {
        toast.error("อัปเดตไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 md:p-10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">
            <Settings className="w-4 h-4" />
            <span>Admin Events System</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">จัดการโครงการและกิจกรรม</h1>
          <p className="text-sm font-semibold text-gray-500 mt-1 max-w-xl leading-relaxed">
            สร้างโครงการ/กิจกรรม จัดการโควต้า และดูรายชื่อผู้ลงทะเบียนเข้าร่วม
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/admin/news"
            className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Settings2 className="w-4 h-4 text-orange-500" /> จัดการข่าวสาร
          </Link>
        </div>
      </div>

      {/* Main Actions */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`rounded-2xl px-5 py-3.5 text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 ${
            showAddForm ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-orange-500/20"
          }`}
        >
          {showAddForm ? <><X className="w-4 h-4" /> ยกเลิกการเพิ่ม</> : <><Plus className="w-4 h-4" /> สร้างโครงการใหม่</>}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mt-6 rounded-3xl border border-orange-200/60 bg-white p-6 shadow-xl shadow-orange-100/30">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-800 tracking-tight">สร้างโครงการ / กิจกรรมใหม่</h2>
            </div>
          </div>

          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">ชื่อกิจกรรม *</label>
              <input type="text" required value={formTitle} onChange={e => setFormTitle(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">วันที่จัดกิจกรรม *</label>
              <input type="date" required value={formDate} onChange={e => setFormDate(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">เวลาเริ่ม - สิ้นสุด *</label>
              <div className="flex items-center gap-2">
                <input type="time" required value={formStartTime} onChange={e => setFormStartTime(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none" />
                <span className="text-gray-400 font-bold">-</span>
                <input type="time" required value={formEndTime} onChange={e => setFormEndTime(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">สถานที่</label>
              <input type="text" value={formLocation} onChange={e => setFormLocation(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">จำนวนผู้เข้าร่วมสูงสุด (0 = ไม่จำกัด)</label>
              <input type="number" min="0" value={formMaxParticipants} onChange={e => setFormMaxParticipants(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">สถานะการรับสมัคร</label>
              <select value={formStatus} onChange={e => setFormStatus(e.target.value as 'active' | 'closed')} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none bg-white">
                <option value="active">เปิดรับสมัคร (Active)</option>
                <option value="closed">ปิดรับสมัคร (Closed)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">รายละเอียดกิจกรรม *</label>
              <textarea required rows={5} value={formDescription} onChange={e => setFormDescription(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none resize-none" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">โปสเตอร์กิจกรรม</label>
              <input 
                type="text" 
                placeholder="วางลิงก์รูปภาพ (URL) หรืออัปโหลดไฟล์ด้านล่าง" 
                value={formImageUrl} 
                onChange={e => setFormImageUrl(e.target.value)} 
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none" 
              />
              <div className="flex items-center gap-4 mt-2">
                {formImageUrl && <img src={formImageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm" />}
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl px-4 py-4 cursor-pointer hover:bg-gray-50 hover:border-orange-400 transition">
                  <UploadCloud className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">{isUploadingImage ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดภาพจากเครื่อง"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUploadSelect(e, setFormImageUrl, 4 / 5)} disabled={isUploadingImage} />
                </label>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="submit" disabled={isSubmitting} className="rounded-xl bg-gray-900 hover:bg-orange-500 px-8 py-3 text-sm font-bold text-white transition disabled:opacity-70 flex items-center gap-2">
                {isSubmitting ? "กำลังบันทึก..." : <><Save className="w-4 h-4" /> สร้างโครงการ</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="mt-10 mb-4 flex relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><Search className="w-4 h-4" /></span>
        <input type="text" placeholder="ค้นหาชื่อกิจกรรม..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-medium focus:border-orange-500 outline-none shadow-sm" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xl shadow-gray-100/50">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-black uppercase text-gray-400">
                <th className="px-6 py-5">กิจกรรม</th>
                <th className="px-6 py-5">วันที่จัด</th>
                <th className="px-6 py-5">ผู้เข้าร่วม</th>
                <th className="px-6 py-5">สถานะ</th>
                <th className="px-6 py-5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/70 text-sm">
              {paginatedItems.map(item => {
                const eventParticipants = participants.filter(p => p.eventId === item.id);
                return (
                  <tr key={item.id} className="hover:bg-orange-50/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} className="w-12 h-16 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-gray-300" /></div>
                        )}
                        <div>
                          <div className="font-bold text-gray-800">{item.title}</div>
                          <div className="text-xs text-gray-400 mt-1 line-clamp-1">{item.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">{item.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400"/>
                        <span className="font-bold">{eventParticipants.length}</span>
                        {item.maxParticipants > 0 && <span className="text-gray-400">/ {item.maxParticipants}</span>}
                        <button onClick={() => setViewingEvent(item)} className="ml-2 text-xs text-blue-500 hover:underline">ดูรายชื่อ</button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.status === 'active' ? 'เปิดรับสมัคร' : 'ปิดแล้ว'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button onClick={() => {
                        setEditingItem(item);
                        const parsed = parseThaiDate(item.date);
                        if (parsed) {
                          setEditDate(parsed.date);
                          setEditStartTime(parsed.startTime);
                          setEditEndTime(parsed.endTime);
                        } else {
                          setEditDate("");
                          setEditStartTime("");
                          setEditEndTime("");
                        }
                      }} className="p-2 text-gray-400 hover:text-blue-500 transition"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteItem(item.id, item.title)} className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">ไม่พบข้อมูลโครงการ/กิจกรรม</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-900">แก้ไขกิจกรรม</h3>
              <button onClick={() => setEditingItem(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-400">ชื่อกิจกรรม</label>
                <input type="text" value={editingItem.title} onChange={e => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">วันที่จัด</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">เวลาเริ่ม - สิ้นสุด</label>
                <div className="flex items-center gap-2">
                  <input type="time" value={editStartTime} onChange={e => setEditStartTime(e.target.value)} className="w-full rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" />
                  <span className="text-gray-400 font-bold">-</span>
                  <input type="time" value={editEndTime} onChange={e => setEditEndTime(e.target.value)} className="w-full rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">สถานที่</label>
                <input type="text" value={editingItem.location} onChange={e => setEditingItem(prev => prev ? { ...prev, location: e.target.value } : null)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">จำนวนผู้เข้าร่วมสูงสุด (0 = ไม่จำกัด)</label>
                <input type="number" min="0" value={editingItem.maxParticipants} onChange={e => setEditingItem(prev => prev ? { ...prev, maxParticipants: parseInt(e.target.value) || 0 } : null)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">สถานะ</label>
                <select value={editingItem.status} onChange={e => setEditingItem(prev => prev ? { ...prev, status: e.target.value as 'active' | 'closed' } : null)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none bg-white">
                  <option value="active">เปิดรับสมัคร</option>
                  <option value="closed">ปิดรับสมัคร</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-400">รายละเอียดเต็ม</label>
                <textarea rows={6} value={editingItem.description} onChange={e => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none resize-none" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">รูปภาพโปสเตอร์</label>
                <input 
                  type="text" 
                  placeholder="วางลิงก์รูปภาพ (URL) หรืออัปโหลดไฟล์ด้านล่าง" 
                  value={editingItem.imageUrl} 
                  onChange={e => setEditingItem(prev => prev ? { ...prev, imageUrl: e.target.value } : null)} 
                  className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" 
                />
                <div className="flex items-center gap-4 mt-2">
                  {editingItem.imageUrl && <img src={editingItem.imageUrl} className="w-16 h-20 object-cover rounded-xl border" />}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer hover:bg-gray-50">
                    <span className="text-xs text-gray-500">{isUploadingImage ? "กำลังอัปโหลด..." : "อัปโหลดภาพจากเครื่องใหม่"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUploadSelect(e, url => setEditingItem(prev => prev ? { ...prev, imageUrl: url } : null), 4 / 5)} disabled={isUploadingImage} />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setEditingItem(null)} className="px-5 py-2.5 text-sm font-bold text-gray-500 rounded-xl hover:bg-gray-50">ยกเลิก</button>
              <button onClick={handleSaveEdit} className="px-5 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl flex items-center gap-2"><Save className="w-4 h-4"/> บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* Participants View Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-900">รายชื่อผู้เข้าร่วม</h3>
                <p className="text-sm text-gray-500">{viewingEvent.title}</p>
              </div>
              <button onClick={() => setViewingEvent(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">ลำดับ</th>
                    <th className="px-4 py-3 font-bold">อีเมล (Email)</th>
                    <th className="px-4 py-3 font-bold">วันที่ลงทะเบียน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {participants.filter(p => p.eventId === viewingEvent.id).map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{p.userEmail}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(p.joinedAt).toLocaleString('th-TH')}</td>
                    </tr>
                  ))}
                  {participants.filter(p => p.eventId === viewingEvent.id).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400">ยังไม่มีผู้เข้าร่วม</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewingEvent(null)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">ปิด</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropperFileSrc && (
        <ImageCropperModal
          imageSrc={cropperFileSrc}
          aspect={cropperAspect}
          onCancel={() => { setCropperFileSrc(null); setCropperCallback(null); }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
