"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings, X, Plus, Inbox, Save, Search, Package, MapPin, Minus, Trash2, Megaphone, FileUp, Download, Edit2, Image as ImageIcon, UploadCloud } from "lucide-react";
import * as XLSX from "xlsx";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  location: string;
  description: string;
  imageUrl?: string;
}

const CATEGORIES = [
  "Microcontroller",
  "Module",
  "Electronic Components",
  "Tools",
  "Mechanical",
];

export default function AdminItemsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State Management
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // New Item Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formStock, setFormStock] = useState("10");
  const [formLocation, setFormLocation] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Edit Item Form State
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUrl(data.url);
      } else {
        alert("อัปโหลดรูปภาพล้มเหลว");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Excel Import handlers
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { name: "Arduino Uno R3", category: "Microcontroller", stock: 10, location: "Shelf A1", description: "Main board" }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "equipment_template.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (data.length === 0) {
          alert("ไม่พบข้อมูลในไฟล์ Excel");
          return;
        }

        setIsLoading(true);
        let successCount = 0;
        for (const row of data) {
          if (!row.name || !row.category) continue;
          const res = await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: row.name,
              category: row.category,
              stock: Number(row.stock || 0),
              location: row.location || "",
              description: row.description || "",
            })
          });
          if (res.ok) successCount++;
        }
        
        alert(`นำเข้าสำเร็จ ${successCount} รายการ`);
        fetchItems();
      } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ""; // clear input
  };

  // Load items from API
  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Error loading items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Protect on the client side just in case (middleware already covers this)
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center px-4">
        <h1 className="text-2xl font-black text-red-500">ปฏิเสธการเข้าใช้งาน</h1>
        <p className="text-gray-500 max-w-sm">เฉพาะผู้ควบคุมระบบที่มีสิทธิ์แอดมินเท่านั้นที่สามารถเข้าชมหน้านี้ได้</p>
        <button
          onClick={() => router.push("/equipment")}
          className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500 active:scale-95"
        >
          กลับสู่ระบบยืมอุปกรณ์
        </button>
      </div>
    );
  }

  // Handle Add Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formCategory || formStock === "") {
      alert("กรุณากรอกข้อมูลหลักให้ครบถ้วน");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formName,
          category: formCategory,
          stock: Number(formStock),
          location: formLocation,
          description: formDescription,
          imageUrl: formImageUrl,
        }),
      });

      if (res.ok) {
        // Reset and hide form
        setFormName("");
        setFormCategory(CATEGORIES[0]);
        setFormStock("10");
        setFormLocation("");
        setFormDescription("");
        setFormImageUrl("");
        setShowAddForm(false);
        // Refresh catalog
        await fetchItems();
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.error || "ไม่สามารถเพิ่มข้อมูลได้"}`);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบอุปกรณ์ "${name}" ออกจากระบบถาวร?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/items?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchItems(); // Refresh catalog
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.error || "ไม่สามารถลบข้อมูลได้"}`);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  // Handle Update Stock Quantity (Increase / Decrease)
  const handleUpdateStock = async (id: string, currentStock: number, change: number) => {
    const newStock = Math.max(0, currentStock + change);

    // Optimistic UI Update: update the local state immediately
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, stock: newStock } : item))
    );

    try {
      const res = await fetch("/api/items", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, stock: newStock }),
      });

      if (!res.ok) {
        // If server failed, revert and fetch clean state
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.error || "ไม่สามารถอัปเดตจำนวนสิ่งของได้"}`);
        await fetchItems();
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      await fetchItems();
    }
  };

  // Handle Setting Stock Directly by Typing
  const handleSetStock = async (id: string, valueString: string) => {
    const numericValue = valueString === "" ? 0 : Number(valueString);
    if (isNaN(numericValue) || numericValue < 0) return;

    // Optimistic UI Update: update the local state immediately
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, stock: numericValue } : item))
    );

    try {
      const res = await fetch("/api/items", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, stock: numericValue }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.error || "ไม่สามารถอัปเดตจำนวนสิ่งของได้"}`);
        await fetchItems();
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      await fetchItems();
    }
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        setEditingItem(null);
        fetchItems();
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and Search logic
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">
            <Settings className="w-4 h-4" />
            <span>สำหรับผู้จัดการระบบ (Admin Panel)</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">
            จัดการอุปกรณ์อิเล็กทรอนิกส์ & IoT
          </h1>
          <p className="text-sm font-semibold text-gray-400 mt-1">
            เพิ่ม ลบ และควบคุมคลังวัสดุอุปกรณ์ของชมรมโรบอท NU Robot Club
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/admin/sponsors"
            className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Megaphone className="w-4 h-4 text-orange-500" /> จัดการผู้สนับสนุน
          </Link>
          <Link
            href="/admin/borrow"
            className="rounded-2xl border border-orange-200 bg-orange-50 hover:bg-orange-100 px-5 py-3.5 text-sm font-bold text-orange-600 shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" /> จัดการอนุมัติการยืม
          </Link>
        </div>
      </div>

      <div className="flex justify-end mt-6">

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          {showAddForm ? (
            <><X className="w-4 h-4" /> ปิดฟอร์มบันทึก</>
          ) : (
            <><Plus className="w-4 h-4" /> เพิ่มอุปกรณ์เข้าระบบ</>
          )}
        </button>
      </div>

      {/* Elegant Add Item Form Section */}
      {showAddForm && (
        <div className="mt-8 rounded-3xl border border-gray-200/80 bg-white shadow-sm p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-gray-400" />
            แบบฟอร์มเพิ่มรายการอุปกรณ์อิเล็กทรอนิกส์
          </h3>

          <form onSubmit={handleAddItem} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">ชื่ออุปกรณ์ *</label>
              <input
                type="text"
                required
                placeholder="เช่น ESP32 DevKitC V4"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">หมวดหมู่ *</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">จำนวนสิ่งของในคลัง (ชิ้น) *</label>
              <input
                type="number"
                min="0"
                required
                placeholder="10"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">ตำแหน่งจัดเก็บในห้องชมรม</label>
              <input
                type="text"
                placeholder="เช่น ตู้ A ชั้น 2 หรือ กล่องอะไหล่ C"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">รายละเอียด / บันทึกเพิ่มเติม</label>
              <input
                type="text"
                placeholder="ข้อมูลจำเพาะ เช่น แรงดันไฟเลี้ยง 3.3V-5V หรือ รายละเอียดโปรเจกต์ที่แนะนำ"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">รูปภาพอุปกรณ์ (ไม่บังคับ)</label>
              <div className="flex items-center gap-4">
                {formImageUrl && (
                  <img src={formImageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm" />
                )}
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 cursor-pointer hover:bg-gray-50 hover:border-orange-400 transition">
                  <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 font-medium">
                    {isUploadingImage ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดรูปภาพ (Google Drive)"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setFormImageUrl)} disabled={isUploadingImage} />
                </label>
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 transition active:scale-95 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-gray-900 hover:bg-orange-500 px-6 py-3 text-sm font-bold text-white transition disabled:opacity-70 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? "กำลังบันทึก..." : <><Save className="w-4 h-4" /> บันทึกข้อมูล</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Search & Filtering */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="ค้นหาชื่ออุปกรณ์, ตำแหน่งจัดเก็บ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">ตัวกรองหมวดหมู่:</span>
          <button
            onClick={() => setCategoryFilter("All")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 cursor-pointer ${categoryFilter === "All"
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            ทั้งหมด
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 cursor-pointer ${categoryFilter === cat
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <span className="text-sm font-bold text-gray-400 animate-pulse">กำลังโหลดฐานข้อมูลคลัง...</span>
        </div>
      ) : (
        /* Inventory Catalog list view */
        <div className="mt-8 flex flex-col gap-4">
          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center flex flex-col items-center">
              <Package className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mt-4">ไม่พบรายการอุปกรณ์</h3>
              <p className="text-sm text-gray-400 mt-1.5 max-w-xs mx-auto">
                ลองตรวจสอบตัวสะกดหรือเปลี่ยนตัวกรอง หรือคลิก "เพิ่มอุปกรณ์เข้าระบบ" เพื่อบันทึกข้อมูลชุดใหม่
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xl shadow-gray-100/50 transition-all duration-300">
              {/* Subtle Top Accent Line */}
              <div className="h-1.5 w-full bg-gray-100" />

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-black uppercase tracking-wider text-gray-400 select-none">
                      <th className="px-6 py-5">ชื่ออุปกรณ์อิเล็กทรอนิกส์</th>
                      <th className="px-6 py-5">หมวดหมู่</th>
                      <th className="px-6 py-5">ตำแหน่งจัดเก็บ</th>
                      <th className="px-6 py-5 text-center">จำนวนในคลัง</th>
                      <th className="px-6 py-5 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/70 text-sm font-medium text-gray-700">
                    {filteredItems.map((item) => {
                      const isOutOfStock = item.stock === 0;
                      const isLowStock = item.stock > 0 && item.stock <= 5;

                      // Dynamic Category Styling based on standard club item types
                      let catStyles = "bg-white text-gray-600 border-gray-200";
                      if (item.category === "Microcontroller") {
                        catStyles = "bg-white text-orange-600 border-gray-200";
                      } else if (item.category === "Module") {
                        catStyles = "bg-white text-blue-600 border-gray-200";
                      } else if (item.category === "Electronic Components") {
                        catStyles = "bg-white text-purple-600 border-gray-200";
                      } else if (item.category === "Tools") {
                        catStyles = "bg-white text-emerald-600 border-gray-200";
                      } else if (item.category === "Mechanical") {
                        catStyles = "bg-white text-teal-600 border-gray-200";
                      }

                      return (
                        <tr key={item.id} className="hover:bg-orange-500/[0.02] active:bg-orange-500/[0.01] transition-all duration-200">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-gray-200 shrink-0 shadow-sm" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 shrink-0 flex items-center justify-center">
                                  <ImageIcon className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="font-extrabold text-gray-800 text-[15px] sm:text-base tracking-tight leading-tight">{item.name}</span>
                                <span className="text-xs text-gray-400 font-semibold mt-1.5 max-w-sm line-clamp-1">
                                  {item.description || "ไม่มีรายละเอียดประกอบสิ่งของ"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-black border px-3 py-1.5 rounded-xl uppercase tracking-wider ${catStyles}`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-1.5 text-gray-500 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs">
                              <MapPin className="w-3 h-3 shrink-0" /> {item.location}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-2">
                              {/* Decrease Button */}
                              <button
                                type="button"
                                onClick={() => handleUpdateStock(item.id, item.stock, -1)}
                                disabled={item.stock === 0}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:pointer-events-none active:scale-90 hover:text-orange-500 transition-all duration-200 cursor-pointer shadow-sm"
                                title="ลดจำนวนอุปกรณ์ (ของเสีย/ชำรุด)"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              {/* Interactive Stock Number Input */}
                              <div className="relative flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.stock}
                                  onChange={(e) => handleSetStock(item.id, e.target.value)}
                                  className={`w-16 rounded-xl border px-2 py-1.5 text-center text-xs font-black text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 transition text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isOutOfStock
                                    ? "bg-red-50/50 border-red-200 text-red-600 focus:ring-red-400 focus:border-red-400"
                                    : isLowStock
                                      ? "bg-yellow-50/50 border-yellow-200 text-yellow-600 focus:ring-yellow-400 focus:border-yellow-400"
                                      : "bg-green-50/50 border-green-200 text-green-600 focus:ring-green-400 focus:border-green-400"
                                    }`}
                                  title="พิมพ์ระบุจำนวนในคลังโดยตรง"
                                />
                                <span className="absolute right-1.5 text-[8px] text-gray-400 select-none pointer-events-none font-extrabold">ชิ้น</span>
                              </div>

                              {/* Increase Button */}
                              <button
                                type="button"
                                onClick={() => handleUpdateStock(item.id, item.stock, 1)}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 active:scale-90 hover:text-orange-500 transition-all duration-200 cursor-pointer shadow-sm"
                                title="เพิ่มจำนวนอุปกรณ์ (รับของเพิ่ม)"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingItem(item)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 active:scale-90 transition-all duration-200 cursor-pointer shadow-sm"
                                title="แก้ไขข้อมูลอุปกรณ์"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id, item.name)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 active:scale-90 transition-all duration-200 cursor-pointer shadow-sm"
                                title="ลบอุปกรณ์ออกจากคลัง"
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
          )}
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-orange-500" /> แก้ไขข้อมูลอุปกรณ์
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">ชื่ออุปกรณ์ *</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">หมวดหมู่ *</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">ตำแหน่งจัดเก็บ</label>
                  <input
                    type="text"
                    value={editingItem.location}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                    placeholder="เช่น ตู้ A ชั้น 2"
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">รายละเอียดเพิ่มเติม</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={2}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">รูปภาพอุปกรณ์ (เปลี่ยนรูปใหม่)</label>
                <div className="flex items-center gap-4">
                  {editingItem.imageUrl && (
                    <img src={editingItem.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm" />
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl px-4 py-4 cursor-pointer hover:bg-gray-50 hover:border-orange-400 transition">
                    <UploadCloud className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500 font-medium">
                      {isUploadingImage ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดรูปภาพใหม่"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setEditingItem({ ...editingItem, imageUrl: url }))} disabled={isUploadingImage} />
                  </label>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl px-5 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition disabled:opacity-70 active:scale-95"
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
