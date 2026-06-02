"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings, Save, Users, Settings2, Trash2, Edit2, UploadCloud, Plus, X, Newspaper } from "lucide-react";

interface AboutInfo {
  history: string;
  vision: string;
  contact: string;
}

interface Advisor {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}

export default function AdminAboutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [aboutInfo, setAboutInfo] = useState<AboutInfo>({ history: "", vision: "", contact: "" });
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form for Advisor
  const [showAddAdvisor, setShowAddAdvisor] = useState(false);
  const [advName, setAdvName] = useState("");
  const [advRole, setAdvRole] = useState("");
  const [advImage, setAdvImage] = useState("");
  const [isAddingAdv, setIsAddingAdv] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resInfo, resAdv] = await Promise.all([
        fetch("/api/about"),
        fetch("/api/advisors")
      ]);
      
      if (resInfo.ok) {
        const info = await resInfo.json();
        setAboutInfo(info);
      }
      if (resAdv.ok) {
        const adv = await resAdv.json();
        setAdvisors(adv);
      }
    } catch (err) {
      console.error(err);
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

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return <div className="flex min-h-screen justify-center items-center">ไม่ได้รับอนุญาต</div>;
  }

  const handleSaveAboutInfo = async () => {
    try {
      setIsSavingInfo(true);
      const res = await fetch("/api/about", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aboutInfo),
      });
      if (res.ok) alert("บันทึกข้อมูลเรียบร้อย");
      else alert("บันทึกข้อมูลล้มเหลว");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setUrl(data.url);
      } else alert("อัปโหลดรูปภาพล้มเหลว");
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advName || !advRole) return alert("กรุณากรอกข้อมูลให้ครบ");

    try {
      setIsAddingAdv(true);
      const res = await fetch("/api/advisors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: advName, role: advRole, imageUrl: advImage }),
      });
      if (res.ok) {
        setAdvName(""); setAdvRole(""); setAdvImage(""); setShowAddAdvisor(false);
        fetchData();
      } else alert("เพิ่มที่ปรึกษาล้มเหลว");
    } catch (err) {
      alert("ข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsAddingAdv(false);
    }
  };

  const handleDeleteAdvisor = async (id: string) => {
    if (!confirm("ยืนยันการลบที่ปรึกษา?")) return;
    try {
      const res = await fetch(`/api/advisors?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 md:p-10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">
            <Settings2 className="w-4 h-4" />
            <span>Admin About Content System</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">จัดการหน้าเกี่ยวกับ (About)</h1>
          <p className="text-sm font-semibold text-gray-500 mt-1 max-w-xl leading-relaxed">
            ปรับปรุงประวัติชมรม วิสัยทัศน์ และข้อมูลผู้ดูแล / ที่ปรึกษาชมรม
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/news" className="rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-700 flex items-center gap-2 shadow-sm hover:bg-gray-50"><Newspaper className="w-4 h-4 text-orange-500" /> จัดการข่าวสาร</Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: About Texts */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><Edit2 className="w-5 h-5"/></div>
            <h2 className="text-xl font-black text-gray-800">แก้ไขเนื้อหาหลัก</h2>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">ประวัติชมรม</label>
            <textarea rows={4} value={aboutInfo.history} onChange={e => setAboutInfo({...aboutInfo, history: e.target.value})} className="rounded-xl border px-4 py-3 text-sm focus:border-orange-500 outline-none resize-none" placeholder="บอกเล่าเรื่องราวของชมรม..." />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">วิสัยทัศน์ / เป้าหมาย</label>
            <textarea rows={3} value={aboutInfo.vision} onChange={e => setAboutInfo({...aboutInfo, vision: e.target.value})} className="rounded-xl border px-4 py-3 text-sm focus:border-orange-500 outline-none resize-none" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">ที่อยู่และช่องทางติดต่อ</label>
            <textarea rows={3} value={aboutInfo.contact} onChange={e => setAboutInfo({...aboutInfo, contact: e.target.value})} className="rounded-xl border px-4 py-3 text-sm focus:border-orange-500 outline-none resize-none" />
          </div>

          <div className="flex justify-end mt-2">
            <button onClick={handleSaveAboutInfo} disabled={isSavingInfo} className="rounded-xl bg-gray-900 hover:bg-orange-500 px-8 py-3 text-sm font-bold text-white transition flex items-center gap-2">
              {isSavingInfo ? "กำลังบันทึก..." : <><Save className="w-4 h-4"/> บันทึกเนื้อหา</>}
            </button>
          </div>
        </div>

        {/* Section 2: Advisors */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Users className="w-5 h-5"/></div>
              <h2 className="text-xl font-black text-gray-800">รายชื่อที่ปรึกษาชมรม</h2>
            </div>
            <button onClick={() => setShowAddAdvisor(!showAddAdvisor)} className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl flex items-center gap-1">
              {showAddAdvisor ? <X className="w-4 h-4" /> : <><Plus className="w-4 h-4"/> เพิ่มรายชื่อ</>}
            </button>
          </div>

          {showAddAdvisor && (
            <form onSubmit={handleAddAdvisor} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">ชื่อ - นามสกุล *</label>
                  <input type="text" required value={advName} onChange={e => setAdvName(e.target.value)} className="rounded-xl border px-3 py-2 text-sm outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">ตำแหน่ง *</label>
                  <input type="text" required placeholder="เช่น อาจารย์ที่ปรึกษา" value={advRole} onChange={e => setAdvRole(e.target.value)} className="rounded-xl border px-3 py-2 text-sm outline-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500">รูปภาพ</label>
                <div className="flex items-center gap-3">
                  {advImage && <img src={advImage} className="w-12 h-12 object-cover rounded-full border shadow-sm" />}
                  <label className="flex-1 border-2 border-dashed rounded-xl px-3 py-2 cursor-pointer hover:bg-white text-center">
                    <span className="text-xs text-gray-500">{isUploadingImage ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดรูปจากคอม"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setAdvImage)} disabled={isUploadingImage} />
                  </label>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={isAddingAdv} className="rounded-xl bg-blue-600 text-white px-5 py-2 text-sm font-bold hover:bg-blue-700">เพิ่มรายชื่อ</button>
              </div>
            </form>
          )}

          <div className="flex flex-col gap-3">
            {advisors.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">ยังไม่มีรายชื่อที่ปรึกษา</p>
            ) : (
              advisors.map(adv => (
                <div key={adv.id} className="flex items-center justify-between bg-white border border-gray-100 hover:border-blue-100 rounded-2xl p-4 shadow-xs transition">
                  <div className="flex items-center gap-4">
                    {adv.imageUrl ? (
                      <img src={adv.imageUrl} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"><Users className="w-5 h-5 text-gray-400" /></div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900">{adv.name}</div>
                      <div className="text-xs font-medium text-gray-500">{adv.role}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAdvisor(adv.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
