"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings, X, Plus, Inbox, Save, Search, Trash2, Edit2, UploadCloud, Newspaper, Settings2, ShieldCheck, List } from "lucide-react";
import ImageCropperModal from "@/components/ui/ImageCropperModal";
import Pagination from "@/components/ui/Pagination";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  imageUrl: string;
  igLink: string;
}

export default function AdminNewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<NewsItem[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [isLoading, setIsLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("ข่าวสารทั่วไป");
  const [formAuthor, setFormAuthor] = useState("ประชาสัมพันธ์ชมรม");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formIgLink, setFormIgLink] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);

  const [cropperFileSrc, setCropperFileSrc] = useState<string | null>(null);
  const [cropperCallback, setCropperCallback] = useState<((url: string) => void) | null>(null);
  const [cropperAspect, setCropperAspect] = useState<number>(16 / 9);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
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
        alert(`อัปโหลดรูปภาพล้มเหลว: ${data.details || data.error || 'Unknown Error'}`);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsUploadingImage(false);
      setCropperCallback(null);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert("กรุณากรอกหัวข้อและเนื้อหา");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          date: formDate,
          summary: formSummary,
          content: formContent,
          category: formCategory,
          author: formAuthor,
          imageUrl: formImageUrl,
          igLink: formIgLink,
        }),
      });

      if (res.ok) {
        setFormTitle("");
        setFormDate("");
        setFormSummary("");
        setFormContent("");
        setFormCategory("ข่าวสารทั่วไป");
        setFormAuthor("ประชาสัมพันธ์ชมรม");
        setFormImageUrl("");
        setFormIgLink("");
        setShowAddForm(false);
        await fetchItems();
      } else {
        const data = await res.json();
        alert(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string, title: string) => {
    if (!confirm(`ยืนยันการลบข่าว "${title}" ออกจากระบบ?`)) return;
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchItems();
      } else {
        alert("ไม่สามารถลบได้");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch("/api/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        setEditingItem(null);
        await fetchItems();
      } else {
        alert("อัปเดตไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
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
            <span>Admin News System</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">จัดการข่าวสารและกิจกรรม</h1>
          <p className="text-sm font-semibold text-gray-500 mt-1 max-w-xl leading-relaxed">
            เพิ่ม ลบ และอัปเดตข่าวสารชมรมที่จะไปแสดงในหน้าหลักของเว็บไซต์
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/admin/about"
            className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Settings2 className="w-4 h-4 text-orange-500" /> จัดการหน้าเกี่ยวกับ
          </Link>
          <Link
            href="/admin/borrow"
            className="rounded-2xl border border-orange-200 bg-orange-50 hover:bg-orange-100 px-5 py-3.5 text-sm font-bold text-orange-600 shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
          >
            <List className="w-4 h-4" /> แผงควบคุมคำขอยืม
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
          {showAddForm ? <><X className="w-4 h-4" /> ยกเลิกการเพิ่ม</> : <><Plus className="w-4 h-4" /> สร้างบทความข่าวสารใหม่</>}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mt-6 rounded-3xl border border-orange-200/60 bg-white p-6 shadow-xl shadow-orange-100/30">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-800 tracking-tight">เพิ่มบทความ/ข่าวสารใหม่</h2>
            </div>
          </div>

          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">หัวข้อข่าว *</label>
              <input type="text" required value={formTitle} onChange={e => setFormTitle(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">หมวดหมู่</label>
              <input type="text" value={formCategory} onChange={e => setFormCategory(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">วันที่แสดงผล</label>
              <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">ผู้เขียน</label>
              <input type="text" value={formAuthor} onChange={e => setFormAuthor(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">สรุปเนื้อหาย่อ (แสดงหน้าแรก)</label>
              <input type="text" value={formSummary} onChange={e => setFormSummary(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">เนื้อหาเต็ม (รองรับพิมพ์ข้อความยาว) *</label>
              <textarea required rows={5} value={formContent} onChange={e => setFormContent(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none resize-none" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">ลิงก์โพสต์ Instagram (ถ้ามี)</label>
              <input type="url" placeholder="https://www.instagram.com/p/..." value={formIgLink} onChange={e => setFormIgLink(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">รูปภาพหน้าปก</label>
              <div className="flex items-center gap-4">
                {formImageUrl && <img src={formImageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm" />}
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl px-4 py-4 cursor-pointer hover:bg-gray-50 hover:border-orange-400 transition">
                  <UploadCloud className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">{isUploadingImage ? "กำลังอัปโหลด..." : "อัปโหลดภาพ (Google Drive)"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUploadSelect(e, setFormImageUrl, 16 / 9)} disabled={isUploadingImage} />
                </label>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="submit" disabled={isSubmitting} className="rounded-xl bg-gray-900 hover:bg-orange-500 px-8 py-3 text-sm font-bold text-white transition disabled:opacity-70 flex items-center gap-2">
                {isSubmitting ? "กำลังบันทึก..." : <><Save className="w-4 h-4" /> บันทึกบทความ</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="mt-10 mb-4 flex relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><Search className="w-4 h-4" /></span>
        <input type="text" placeholder="ค้นหาหัวข้อข่าว..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-medium focus:border-orange-500 outline-none shadow-sm" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xl shadow-gray-100/50">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-black uppercase text-gray-400">
                <th className="px-6 py-5">บทความ</th>
                <th className="px-6 py-5">หมวดหมู่</th>
                <th className="px-6 py-5">วันที่</th>
                <th className="px-6 py-5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/70 text-sm">
              {paginatedItems.map(item => (
                <tr key={item.id} className="hover:bg-orange-50/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><Newspaper className="w-5 h-5 text-gray-300" /></div>
                      )}
                      <div>
                        <div className="font-bold text-gray-800">{item.title}</div>
                        <div className="text-xs text-gray-400 mt-1 line-clamp-1">{item.summary}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{item.category}</span></td>
                  <td className="px-6 py-4 font-medium text-gray-600">{item.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setEditingItem(item)} className="p-2 text-gray-400 hover:text-blue-500 transition"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteItem(item.id, item.title)} className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">ไม่พบข้อมูลข่าวสาร</td></tr>
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
              <h3 className="text-lg font-black text-gray-900">แก้ไขบทความ</h3>
              <button onClick={() => setEditingItem(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-400">หัวข้อข่าว</label>
                <input type="text" value={editingItem.title} onChange={e => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">วันที่แสดงผล</label>
                <input type="date" value={editingItem.date} onChange={e => setEditingItem(prev => prev ? { ...prev, date: e.target.value } : null)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">หมวดหมู่</label>
                <input type="text" value={editingItem.category} onChange={e => setEditingItem(prev => prev ? { ...prev, category: e.target.value } : null)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">ผู้เขียน</label>
                <input type="text" value={editingItem.author} onChange={e => setEditingItem(prev => prev ? { ...prev, author: e.target.value } : null)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-400">สรุปเนื้อหาย่อ</label>
                <input type="text" value={editingItem.summary} onChange={e => setEditingItem(prev => prev ? { ...prev, summary: e.target.value } : null)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-400">เนื้อหาเต็ม</label>
                <textarea rows={6} value={editingItem.content} onChange={e => setEditingItem(prev => prev ? { ...prev, content: e.target.value } : null)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none resize-none" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-400">ลิงก์ IG</label>
                <input type="url" value={editingItem.igLink} onChange={e => setEditingItem(prev => prev ? { ...prev, igLink: e.target.value } : null)} className="rounded-xl border px-4 py-2 text-sm focus:border-orange-500 outline-none" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">เปลี่ยนรูปภาพปก</label>
                <div className="flex items-center gap-4">
                  {editingItem.imageUrl && <img src={editingItem.imageUrl} className="w-16 h-16 object-cover rounded-xl border" />}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer hover:bg-gray-50">
                    <span className="text-xs text-gray-500">{isUploadingImage ? "กำลังอัปโหลด..." : "อัปโหลดภาพใหม่"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUploadSelect(e, url => setEditingItem(prev => prev ? { ...prev, imageUrl: url } : null), 16 / 9)} disabled={isUploadingImage} />
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
