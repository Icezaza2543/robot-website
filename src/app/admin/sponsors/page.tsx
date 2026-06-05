"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Lock, Plus, Trash2, Megaphone, CheckCircle2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface Sponsor {
  id: string;
  url: string;
  status: string;
  createdAt: string;
}

export default function AdminSponsorsPage() {
  const { data: session, status } = useSession();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSponsors = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/sponsors");
      if (res.ok) {
        const data = await res.json();
        setSponsors(data);
      }
    } catch (err) {
      console.error("Failed to load sponsors", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchSponsors();
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
  const canAccess = isAdmin || userPermissions.includes("manage_website") || userPermissions.includes("*");

  if (status === "unauthenticated" || (status === "authenticated" && !canAccess)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center px-4">
        <Lock className="w-16 h-16 text-gray-300 mb-2" />
        <h1 className="text-2xl font-black text-rose-500">ปฏิเสธการเข้าใช้งาน</h1>
        <Link href="/" className="rounded-2xl bg-gray-900 hover:bg-orange-500 px-6 py-3 text-sm font-bold text-white transition">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl.trim() }),
      });

      if (res.ok) {
        setNewUrl("");
        toast.success("เพิ่มผู้สนับสนุนสำเร็จ");
        fetchSponsors();
      } else {
        toast.error("เกิดข้อผิดพลาดในการเพิ่มผู้สนับสนุน");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบโลโก้ผู้สนับสนุนนี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch(`/api/sponsors?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบผู้สนับสนุนสำเร็จ");
        setSponsors((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast.error("ไม่สามารถลบผู้สนับสนุนได้");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-orange-500" />
            จัดการผู้สนับสนุน (Sponsors)
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-2 max-w-xl">
            เพิ่มรูปภาพโลโก้ผู้สนับสนุนชมรม ซึ่งจะไปแสดงผลเป็นแถบเลื่อน (Marquee) ที่ด้านล่างของหน้าหลัก
          </p>
        </div>
        <Link
          href="/admin/borrow"
          className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-600 transition"
        >
          กลับไปหน้าระบบอนุมัติ
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Form */}
        <div className="md:col-span-1">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" /> เพิ่มผู้สนับสนุนใหม่
            </h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">URL รูปภาพโลโก้</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              {newUrl && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-center">
                  <img src={newUrl} alt="Preview" className="max-h-24 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !newUrl}
                className="mt-2 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {isSubmitting ? "กำลังบันทึก..." : "เพิ่มผู้สนับสนุน"}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="md:col-span-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-400" /> รายการโลโก้ที่แสดงผลอยู่
            </h2>

            {isLoading ? (
              <div className="text-center py-12 text-sm font-semibold text-gray-400">กำลังโหลด...</div>
            ) : sponsors.length === 0 ? (
              <div className="text-center py-12 text-sm font-semibold text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                ยังไม่มีผู้สนับสนุน
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="group relative rounded-2xl border border-gray-200 bg-white p-4 flex items-center justify-center h-32 hover:border-orange-300 transition-colors">
                    <img src={sponsor.url} alt="Sponsor Logo" className="max-h-full max-w-full object-contain" />
                    
                    <button
                      onClick={() => handleDelete(sponsor.id)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-gray-200 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-200 transition-all cursor-pointer"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
