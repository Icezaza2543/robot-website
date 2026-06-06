"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CalendarDays, DoorOpen, Plus, Search, Trash2, Edit2, Loader2, Image as ImageIcon, X, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

// Detect overlapping reservations within a list
function isOverlapping(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}
function findConflicts(reservations: any[]): Set<string> {
  const approved = reservations.filter(r => r.status === 'approved');
  const pending  = reservations.filter(r => r.status === 'pending');
  const conflicted = new Set<string>();
  pending.forEach(p => {
    const ps = new Date(p.startDate), pe = new Date(p.endDate);
    approved.forEach(a => {
      if (a.roomId === p.roomId && isOverlapping(ps, pe, new Date(a.startDate), new Date(a.endDate))) {
        conflicted.add(p.id);
      }
    });
  });
  return conflicted;
}

const getThaiDayAbbr = (daysString: string) => {
  if (!daysString) return '';
  const map: Record<string, string> = {
    '1': 'จ.', '2': 'อ.', '3': 'พ.', '4': 'พฤ.', '5': 'ศ.', '6': 'ส.', '7': 'อา.'
  };
  return daysString.split(',').map(d => map[d.trim()] || d).join(', ');
};


export default function AdminRoomsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'reservations' | 'rooms'>('reservations');
  const [isLoading, setIsLoading] = useState(true);

  const [deleteRoomTarget, setDeleteRoomTarget] = useState<string | null>(null);
  const [deleteResTarget, setDeleteResTarget] = useState<string | null>(null);

  const [rooms, setRooms] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    roomId: "",
    roomName: "",
    floor: "",
    building: "",
    description: "",
    maxHours: "3",
    allowedDays: "1,2,3,4,5",
  });

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImageUrlInput, setCoverImageUrlInput] = useState(""); // for URL paste
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [roomsRes, resRes] = await Promise.all([
        fetch("/api/admin/rooms"),
        fetch("/api/admin/reservations")
      ]);
      
      if (roomsRes.ok) setRooms(await roomsRes.json());
      if (resRes.ok) setReservations(await resRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (room?: any) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        roomId: room.roomId,
        roomName: room.roomName,
        floor: room.floor,
        building: room.building,
        description: room.description,
        maxHours: room.maxHours.toString(),
        allowedDays: room.allowedDays,
      });
      setCoverImageUrl(room.coverImage);
      setCoverImageUrlInput("");
      setCoverImageFile(null);
    } else {
      setEditingRoom(null);
      setFormData({
        roomId: `room-${Date.now()}`,
        roomName: "",
        floor: "",
        building: "",
        description: "",
        maxHours: "3",
        allowedDays: "1,2,3,4,5",
      });
      setCoverImageUrl("");
      setCoverImageUrlInput("");
      setCoverImageFile(null);
    }
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = async () => {
    setIsUploading(true);
    // Priority: new file upload > pasted URL > existing URL
    let finalImageUrl = coverImageUrlInput.trim() || coverImageUrl;

    if (coverImageFile) {
      try {
        const formData = new FormData();
        formData.append("file", coverImageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.url) finalImageUrl = uploadData.url;
        } else {
          toast.error("ไม่สามารถอัพโหลดรูปภาพได้");
          setIsUploading(false);
          return;
        }
      } catch (err) {
        toast.error("ไม่สามารถอัพโหลดรูปภาพได้");
        setIsUploading(false);
        return;
      }
    }

    const payload = {
      ...formData,
      coverImage: finalImageUrl,
      galleryImages: "", // Simplified for now
      status: "active",
    };

    try {
      const res = await fetch("/api/admin/rooms", {
        method: editingRoom ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingRoom ? "อัปเดตห้องสำเร็จ" : "เพิ่มห้องสำเร็จ");
        setIsRoomModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลห้อง");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    setDeleteRoomTarget(roomId);
  };

  const executeDeleteRoom = async () => {
    if (!deleteRoomTarget) return;
    try {
      const res = await fetch(`/api/admin/rooms?id=${deleteRoomTarget}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบห้องสำเร็จ");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการลบห้อง");
    } finally {
      setDeleteRoomTarget(null);
    }
  };

  const handleDeleteReservation = (resId: string) => {
    setDeleteResTarget(resId);
  };

  const executeDeleteReservation = async () => {
    if (!deleteResTarget) return;
    try {
      const res = await fetch(`/api/admin/reservations?id=${deleteResTarget}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบรายการจองสำเร็จ");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการลบรายการจอง");
    } finally {
      setDeleteResTarget(null);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    let rejectReason = "";
    if (newStatus === "rejected") {
      rejectReason = prompt("เหตุผลที่ไม่อนุมัติ (เว้นว่างได้):") || "";
    }
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, rejectReason })
      });
      if (res.ok) {
        toast.success(`อัปเดตสถานะเป็น ${newStatus} สำเร็จ`);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
  }

  // Permission check
  const userPermissions = session?.user?.permissions || [];
  const canManageRooms = userPermissions.includes("manage_rooms") || userPermissions.includes("*");
  if (!canManageRooms) return <div className="text-center p-20 text-xl font-bold text-red-500">Access Denied</div>;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">จัดการห้องและจอง (Room Management)</h1>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('reservations')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${activeTab === 'reservations' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <CalendarDays className="w-4 h-4" /> รายการจองห้อง
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${activeTab === 'rooms' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <DoorOpen className="w-4 h-4" /> ตั้งค่าห้อง
          </button>
        </div>
      </div>

      {activeTab === 'reservations' && (() => {
        const conflictedIds = findConflicts(reservations);
        return (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">รายการจองล่าสุด</h2>
            {conflictedIds.size > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" /> มีคิว Pending ที่เวลาชนกับ Approved อยู่ {conflictedIds.size} รายการ
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="py-4 pr-4 font-semibold">ห้อง</th>
                  <th className="py-4 pr-4 font-semibold">ผู้จอง</th>
                  <th className="py-4 pr-4 font-semibold">หัวข้อ</th>
                  <th className="py-4 pr-4 font-semibold">วัน/เวลา</th>
                  <th className="py-4 pr-4 font-semibold">คำร้องพิเศษ</th>
                  <th className="py-4 pr-4 font-semibold">สถานะ</th>
                  <th className="py-4 font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reservations.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">ยังไม่มีรายการจอง</td></tr>
                ) : reservations.sort((a: any, b: any) => {
                  // Sort: pending first, then by date
                  if (a.status === 'pending' && b.status !== 'pending') return -1;
                  if (a.status !== 'pending' && b.status === 'pending') return 1;
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }).map((res: any) => {
                  const room = rooms.find((r: any) => r.roomId === res.roomId);
                  const hasConflict = conflictedIds.has(res.id);
                  return (
                    <tr key={res.id} className={`hover:bg-gray-50/50 transition ${hasConflict ? 'bg-red-50/30' : ''}`}>
                      <td className="py-4 pr-4 font-bold text-gray-900">{room?.roomName || res.roomId}</td>
                      <td className="py-4 pr-4">
                        <div className="font-medium text-gray-900">{res.name}</div>
                        <div className="text-xs text-gray-500">{res.email}</div>
                      </td>
                      <td className="py-4 pr-4 text-gray-600 max-w-[160px] truncate" title={res.title}>{res.title}</td>
                      <td className="py-4 pr-4 text-gray-600">
                        <div>{new Date(res.startDate).toLocaleDateString('th-TH')}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(res.startDate).toLocaleTimeString('th-TH', {hour: '2-digit', minute: '2-digit'})} – {new Date(res.endDate).toLocaleTimeString('th-TH', {hour: '2-digit', minute: '2-digit'})}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        {hasConflict && (
                          <div className="mb-1">
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" /> เวลาชนคิว Approved
                            </span>
                          </div>
                        )}
                        {res.isSpecialRequest === "TRUE" ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" /> คำร้องพิเศษ
                            </span>
                            <span className="text-xs text-gray-500 truncate max-w-[160px]" title={res.specialReason}>{res.specialReason}</span>
                          </div>
                        ) : !hasConflict ? (
                          <span className="text-gray-400 text-xs">ปกติ</span>
                        ) : null}
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          res.status === 'approved' ? 'bg-green-100 text-green-700' :
                          res.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          res.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {res.status.toUpperCase()}
                        </span>
                        {res.rejectReason && (
                          <div className="text-xs text-red-500 mt-1 max-w-[120px] truncate" title={res.rejectReason}>
                            {res.rejectReason}
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {res.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(res.id, 'approved')}
                                className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition"
                                title="อนุมัติ"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(res.id, 'rejected')}
                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                                title="ไม่อนุมัติ"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteReservation(res.id)}
                            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition"
                            title="ลบออก"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        );
      })()}

      {activeTab === 'rooms' && (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">ห้องในการดูแลทั้งหมด</h2>
            <button 
              onClick={() => handleOpenModal()} 
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> เพิ่มห้องใหม่
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.filter(r => r.status === 'active').map(room => (
              <div key={room.roomId} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition bg-gray-50/50">
                <div className="w-full h-40 bg-gray-200 rounded-xl mb-4 overflow-hidden relative">
                  {room.coverImage ? (
                    <img src={room.coverImage} alt={room.roomName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-8 h-8" /></div>
                  )}
                </div>
                <h3 className="text-xl font-black text-gray-900">{room.roomName}</h3>
                <p className="text-sm text-gray-500 mb-4">{room.building} ชั้น {room.floor}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md">สูงสุด {room.maxHours} ชม.</span>
                  <span className="text-xs font-semibold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-md">วันอนุญาต: {getThaiDayAbbr(room.allowedDays)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(room)} className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                    <Edit2 className="w-4 h-4" /> แก้ไข
                  </button>
                  <button onClick={() => handleDeleteRoom(room.roomId)} className="p-2 border border-red-200 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900">{editingRoom ? "แก้ไขห้อง" : "เพิ่มห้องใหม่"}</h3>
              <button onClick={() => setIsRoomModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อห้อง (Room Name)</label>
                  <input type="text" value={formData.roomName} onChange={e => setFormData({...formData, roomName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium" placeholder="e.g. EE701" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ชั้น (Floor)</label>
                  <input type="text" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium" placeholder="e.g. 7" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">อาคาร (Building)</label>
                <input type="text" value={formData.building} onChange={e => setFormData({...formData, building: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium" placeholder="e.g. ตึกวิศวกรรมไฟฟ้า" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">รายละเอียดห้อง (Description)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium min-h-[100px]" placeholder="อุปกรณ์ที่มีในห้อง..." />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/3">
                  <label className="block text-sm font-bold text-gray-700 mb-1">จำกัดเวลา (ชั่วโมง/ครั้ง)</label>
                  <input type="number" value={formData.maxHours} onChange={e => setFormData({...formData, maxHours: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium" min="1" />
                </div>
                <div className="w-full sm:w-2/3">
                  <label className="block text-sm font-bold text-gray-700 mb-2">วันที่อนุญาตให้จองได้</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '1', label: 'จันทร์' },
                      { value: '2', label: 'อังคาร' },
                      { value: '3', label: 'พุธ' },
                      { value: '4', label: 'พฤหัส' },
                      { value: '5', label: 'ศุกร์' },
                      { value: '6', label: 'เสาร์' },
                      { value: '7', label: 'อาทิตย์' }
                    ].map(day => {
                      const isSelected = formData.allowedDays ? formData.allowedDays.split(',').map(d=>d.trim()).includes(day.value) : false;
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            const currentDays = formData.allowedDays ? formData.allowedDays.split(',').map(d => d.trim()).filter(Boolean) : [];
                            const newDays = isSelected 
                              ? currentDays.filter(d => d !== day.value)
                              : [...currentDays, day.value];
                            setFormData({ ...formData, allowedDays: newDays.sort().join(',') });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition ${isSelected ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-200'}`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">รูปภาพปก</label>
                {/* Preview */}
                {(coverImageUrlInput.trim() || coverImageUrl) && (
                  <img
                    src={coverImageUrlInput.trim() || coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-36 object-cover rounded-xl mb-3 border border-gray-100"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
                {/* URL paste */}
                <div className="mb-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">วาง URL รูปภาพ (paste link)</label>
                  <input
                    type="url"
                    value={coverImageUrlInput}
                    onChange={e => { setCoverImageUrlInput(e.target.value); setCoverImageFile(null); }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
                {/* OR divider */}
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-semibold">หรือ</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                {/* File upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">อัพโหลดไฟล์</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => { setCoverImageFile(e.target.files?.[0] || null); setCoverImageUrlInput(""); }}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                  />
                  {coverImageFile && <p className="text-xs text-green-600 mt-1">เลือกไฟล์: {coverImageFile.name}</p>}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button onClick={() => setIsRoomModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition">ยกเลิก</button>
              <button onClick={handleSaveRoom} disabled={isUploading || !formData.roomName} className="px-6 py-2.5 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Room Confirm Modal */}
      <ConfirmModal
        isOpen={deleteRoomTarget !== null}
        onClose={() => setDeleteRoomTarget(null)}
        onConfirm={executeDeleteRoom}
        title="ยืนยันการลบห้อง"
        description="คุณแน่ใจหรือไม่ที่จะลบห้องนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
        confirmText="ลบห้องถาวร"
        isDestructive={true}
      />

      {/* Delete Reservation Confirm Modal */}
      <ConfirmModal
        isOpen={deleteResTarget !== null}
        onClose={() => setDeleteResTarget(null)}
        onConfirm={executeDeleteReservation}
        title="ยืนยันการลบรายการจอง"
        description="คุณแน่ใจหรือไม่ที่จะลบรายการจองนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
        confirmText="ลบรายการจองถาวร"
        isDestructive={true}
      />
    </div>
  );
}
