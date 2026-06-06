"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings2, Plus, X, Edit2, Trash2, Users, UploadCloud, Save } from "lucide-react";
import ImageCropperModal from "@/components/ui/ImageCropperModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import toast from "react-hot-toast";

interface President {
  id: string;
  name: string;
  year: string;
  imageUrl: string;
}

export default function AdminPresidentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<President[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formImage, setFormImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editImage, setEditImage] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<President | null>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [cropperFileSrc, setCropperFileSrc] = useState<string | null>(null);
  const [cropperCallback, setCropperCallback] = useState<((url: string) => void) | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/presidents");
      if (res.ok) {
        const data = await res.json();
        // Sort by year descending (newest first)
        const sorted = data.sort((a: President, b: President) => Number(b.year) - Number(a.year));
        setItems(sorted);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load presidents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchData();
    }
  }, [status, session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const userPermissions = session?.user?.permissions || [];
  const canAccess = session?.user?.role === "admin" || userPermissions.includes("manage_website") || userPermissions.includes("*");

  if (status === "unauthenticated" || !canAccess) {
    return <div className="flex min-h-screen justify-center items-center font-bold text-red-500">ปฏิเสธการเข้าใช้งาน (Unauthorized)</div>;
  }

  const handleImageUploadSelect = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const target = e.target;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropperFileSrc(reader.result?.toString() || null);
      setCropperCallback(() => setUrl);
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

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        if (cropperCallback) cropperCallback(data.url);
      } else {
        toast.error("อัปโหลดรูปภาพล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setIsUploadingImage(false);
      setCropperCallback(null);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formYear) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/presidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, year: formYear, imageUrl: formImage }),
      });
      if (res.ok) {
        setFormName(""); setFormYear(""); setFormImage(""); setShowAddForm(false);
        toast.success("เพิ่มข้อมูลสำเร็จ");
        fetchData();
      } else {
        toast.error("เพิ่มข้อมูลล้มเหลว");
      }
    } catch (err) {
      toast.error("ข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editYear) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/presidents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name: editName, year: editYear, imageUrl: editImage }),
      });
      if (res.ok) {
        setEditingId(null);
        toast.success("แก้ไขข้อมูลสำเร็จ");
        fetchData();
      } else {
        toast.error("แก้ไขข้อมูลล้มเหลว");
      }
    } catch (err) {
      toast.error("ข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/presidents?id=${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบข้อมูลสำเร็จ");
        fetchData();
      } else {
        toast.error("ไม่สามารถลบได้");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 shadow-sm flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">
            <Users className="w-4 h-4" />
            <span>Admin Control</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">จัดการทำเนียบอดีตประธานชมรม</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`rounded-2xl px-5 py-3 text-sm font-bold shadow-sm transition active:scale-95 flex items-center gap-2 ${
            showAddForm ? "bg-gray-100 text-gray-600" : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
        >
          {showAddForm ? <><X className="w-4 h-4" /> ปิดฟอร์ม</> : <><Plus className="w-4 h-4" /> เพิ่มรายชื่อ</>}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddItem} className="bg-white border border-gray-200 rounded-3xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-black text-gray-800 mb-4 border-b pb-3">เพิ่มรายชื่อประธานชมรม</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">ชื่อ - นามสกุล *</label>
              <input type="text" required value={formName} onChange={e => setFormName(e.target.value)} className="rounded-xl border px-4 py-3 text-sm focus:border-orange-500 outline-none" placeholder="นาย สมชาย ใจดี" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500">ประจำปีการศึกษา (พ.ศ.) *</label>
              <input type="number" required value={formYear} onChange={e => setFormYear(e.target.value)} className="rounded-xl border px-4 py-3 text-sm focus:border-orange-500 outline-none" placeholder="2566" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-500">รูประธานชมรม</label>
              <div className="flex flex-col gap-2">
                <input type="url" placeholder="วางลิงก์รูปภาพ (URL)..." value={formImage} onChange={e => setFormImage(e.target.value)} className="rounded-xl border px-4 py-3 text-sm focus:border-orange-500 outline-none w-full" />
                <div className="flex items-center gap-4 mt-1">
                  {formImage && <img src={formImage} className="w-16 h-16 object-cover rounded-full border shadow-sm" />}
                  <label className="flex-1 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 hover:border-orange-400 transition text-center">
                    <span className="text-sm text-gray-500 flex items-center justify-center gap-2">
                      <UploadCloud className="w-4 h-4"/> {isUploadingImage ? "กำลังอัปโหลด..." : "คลิกอัปโหลดรูปภาพใหม่"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUploadSelect(e, setFormImage)} disabled={isUploadingImage} />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-gray-900 text-white px-6 py-3 text-sm font-bold hover:bg-orange-500 transition disabled:opacity-70 flex items-center gap-2">
              <Save className="w-4 h-4" /> บันทึกข้อมูล
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white border rounded-3xl">ยังไม่มีข้อมูลในระบบ</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition group">
              {editingId === item.id ? (
                <form onSubmit={handleUpdateItem} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">ชื่อ</label>
                    <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">ปีการศึกษา</label>
                    <input type="number" required value={editYear} onChange={e => setEditYear(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">รูปภาพ</label>
                    <div className="flex items-center gap-2">
                      {editImage && <img src={editImage} className="w-8 h-8 rounded-full object-cover" />}
                      <label className="flex-1 bg-gray-50 border rounded-lg px-2 py-1.5 text-xs text-center cursor-pointer hover:bg-gray-100">
                        {isUploadingImage ? "..." : "เปลี่ยนภาพ"}
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUploadSelect(e, setEditImage)} disabled={isUploadingImage} />
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => setEditingId(null)} className="flex-1 bg-gray-100 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200">ยกเลิก</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 py-2 rounded-xl text-xs font-bold text-white hover:bg-blue-700">บันทึก</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="w-16 h-16 rounded-full object-cover border-4 border-gray-50 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-300 flex items-center justify-center border-4 border-white shadow-sm">
                        <Users className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-black text-gray-800 truncate">{item.name}</div>
                      <div className="text-xs font-bold text-orange-500 bg-orange-50 inline-block px-2 py-0.5 rounded-full mt-1">
                        ปีการศึกษา {item.year}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingId(item.id); setEditName(item.name); setEditYear(item.year); setEditImage(item.imageUrl); }} className="p-2 text-gray-400 hover:text-blue-500 bg-gray-50 hover:bg-blue-50 rounded-xl transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-xl transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {cropperFileSrc && (
        <ImageCropperModal
          imageSrc={cropperFileSrc}
          aspect={1}
          onCancel={() => { setCropperFileSrc(null); setCropperCallback(null); }}
          onCropComplete={handleCropComplete}
        />
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title="ยืนยันการลบข้อมูล"
        description={`คุณแน่ใจหรือไม่ที่จะลบรายชื่อ "${deleteTarget?.name}" ออกจากทำเนียบ? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmText="ลบข้อมูลถาวร"
        cancelText="ยกเลิก"
        isDestructive={true}
      />
    </div>
  );
}
