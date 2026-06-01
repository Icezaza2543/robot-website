"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/providers/CartProvider";
import { Plug, Settings, Search, MapPin, ShoppingCart, Check, X, AlertTriangle } from "lucide-react";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  location: string;
  description: string;
}

export default function EquipmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToCart, cartItems } = useCart();

  // State Management
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

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
    if (status === "authenticated") {
      fetchItems();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Client side fallback safety (Middleware already enforces this)
  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/equipment");
    return null;
  }

  // Categories extraction
  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))];

  // Filtering
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 md:p-10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">
            <Plug className="w-4 h-4" />
            <span>NU Robot Club Smart Inventory</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">
            คลังยืมอุปกรณ์อิเล็กทรอนิกส์ & IoT
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-1 max-w-xl leading-relaxed">
            ยินดีต้อนรับคุณ <span className="text-orange-500 font-bold">{session?.user?.name}</span>! สมาชิกชมรมสามารถเลือกยืมบอร์ดควบคุม โมดูลเซนเซอร์ อะไหล่ และเครื่องมือสำหรับพัฒนาโปรเจกต์ได้ที่นี่
          </p>
        </div>

        {session?.user?.role === "admin" && (
          <button
            onClick={() => router.push("/admin/items")}
            className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 hover:bg-orange-100 px-5 py-3.5 text-sm font-bold text-orange-600 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            จัดการคลังอุปกรณ์ (Admin)
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-6">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="ค้นหาชื่ออุปกรณ์ บอร์ดควบคุม เซนเซอร์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
          />
        </div>

        {/* Category tags */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">หมวดหมู่:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 cursor-pointer ${categoryFilter === cat
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {cat === "All" ? "ทั้งหมด" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog items display */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <span className="text-sm font-bold text-gray-400 animate-pulse">กำลังโหลดคลังวัสดุอุปกรณ์...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center animate-in fade-in duration-300 flex flex-col items-center">
          <Plug className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mt-4">ไม่มีอุปกรณ์ในคลัง</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
            ขณะนี้ยังไม่มีอุปกรณ์บันทึกอยู่ในระบบคลังสิ่งของอยู่ระหว่างการเชื่อมต่อฐานข้อมูลหรือลงทะเบียนอุปกรณ์เข้าระบบ
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const isOutOfStock = item.stock === 0;
            const isLowStock = item.stock > 0 && item.stock <= 5;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-white p-6 hover:border-orange-500/30 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 group"
              >
                <div>
                  {/* Category tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block text-xs font-bold bg-gray-50 border border-gray-200/40 text-gray-500 px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isOutOfStock
                        ? "bg-red-50 text-red-600 border border-red-200/30"
                        : isLowStock
                          ? "bg-yellow-50 text-yellow-600 border border-yellow-200/30"
                          : "bg-green-50 text-green-600 border border-green-200/30"
                        }`}
                    >
                      {isOutOfStock ? (
                        <><X className="w-3 h-3" /> ของหมด</>
                      ) : isLowStock ? (
                        <><AlertTriangle className="w-3 h-3" /> ใกล้หมด</>
                      ) : (
                        <><Check className="w-3 h-3" /> มีให้ยืม</>
                      )}
                    </div>
                  </div>

                  {/* Name and description */}
                  <h3 className="text-lg font-bold text-gray-800 leading-snug group-hover:text-orange-500 transition-colors duration-200">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" /> ที่จัดเก็บ: {item.location}
                  </p>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-3">
                    {item.description || "ไม่มีรายละเอียดคอมโพเนนต์ชิ้นนี้ สมาชิกชมรมสามารถหยิบไปประกอบโปรเจกต์ได้เลย"}
                  </p>
                </div>

                {/* Bottom stock details and action */}
                <div className="border-t border-gray-50 pt-5 mt-6 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">คงเหลือในคลัง</span>
                    <span className="text-sm font-black text-gray-800">{item.stock} ชิ้น</span>
                  </div>

                  {(() => {
                    const isInCart = cartItems.some((i) => i.id === item.id);
                    return (
                      <button
                        disabled={isOutOfStock}
                        onClick={() => addToCart(item)}
                        className={`rounded-2xl px-5 py-3 text-xs font-bold shadow-sm transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                          isOutOfStock
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : isInCart
                            ? "bg-orange-50 border border-orange-200/60 text-orange-600 hover:bg-orange-100 hover:border-orange-300"
                            : "bg-gray-900 hover:bg-orange-500 text-white hover:shadow-orange-500/10"
                        }`}
                      >
                        {isOutOfStock ? "หมดชั่วคราว" : isInCart ? <><Check className="w-4 h-4" /> เลือกเพิ่มเติม</> : <><ShoppingCart className="w-4 h-4" /> เลือกยืมสิ่งของ</>}
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
