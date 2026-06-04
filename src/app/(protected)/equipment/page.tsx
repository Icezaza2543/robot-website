"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/providers/CartProvider";
import { Plug, Settings, Search, MapPin, ShoppingCart, Check, X, AlertTriangle, Package, Plus, Minus } from "lucide-react";
import Pagination from "@/components/ui/Pagination";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  location: string;
  description: string;
  imageUrl?: string;
}

export default function EquipmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();

  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

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
    if (status === "authenticated") fetchItems();
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/equipment");
    return null;
  }

  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

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
            คลังยืมอุปกรณ์อิเล็กทรอนิกส์ &amp; IoT
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
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">หมวดหมู่:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 cursor-pointer ${
                categoryFilter === cat ? "bg-orange-500 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat === "All" ? "ทั้งหมด" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
          <span className="text-sm font-bold text-gray-400 animate-pulse">กำลังโหลดคลังวัสดุอุปกรณ์...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center animate-in fade-in duration-300 flex flex-col items-center">
          <Plug className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mt-4">ไม่มีอุปกรณ์ในคลัง</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
            ขณะนี้ยังไม่มีอุปกรณ์บันทึกอยู่ในระบบ
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedItems.map((item) => {
              const isOutOfStock = item.stock === 0;
            const isLowStock = item.stock > 0 && item.stock <= 5;
            const cartItem = cartItems.find((i) => i.id === item.id);
            const qty = cartItem?.quantity ?? 0;
            const isInCart = qty > 0;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-white p-6 hover:border-orange-500/30 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 group"
              >
                <div>
                  {item.imageUrl ? (
                    <div className="w-full aspect-[4/3] mb-5 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 relative group-hover:border-orange-200 transition-colors">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="w-full h-32 mb-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100 shrink-0 flex items-center justify-center group-hover:border-orange-200 transition-colors">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block text-xs font-bold bg-gray-50 border border-gray-200/40 text-gray-500 px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isOutOfStock ? "bg-red-50 text-red-600 border border-red-200/30"
                        : isLowStock ? "bg-yellow-50 text-yellow-600 border border-yellow-200/30"
                        : "bg-green-50 text-green-600 border border-green-200/30"
                    }`}>
                      {isOutOfStock ? <><X className="w-3 h-3" /> ของหมด</>
                        : isLowStock ? <><AlertTriangle className="w-3 h-3" /> ใกล้หมด</>
                        : <><Check className="w-3 h-3" /> มีให้ยืม</>}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 leading-snug group-hover:text-orange-500 transition-colors duration-200">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" /> ที่จัดเก็บ: {item.location}
                  </p>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-3">
                    {item.description || "ไม่มีรายละเอียดคอมโพเนนต์ชิ้นนี้"}
                  </p>
                </div>

                {/* Bottom: stock info + quantity stepper */}
                <div className="border-t border-gray-50 pt-5 mt-6 flex items-center justify-between gap-3">
                  <div className="flex flex-col shrink-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">คงเหลือ</span>
                    <span className="text-sm font-black text-gray-800">{item.stock} ชิ้น</span>
                  </div>

                  {isOutOfStock ? (
                    <div className="rounded-2xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-400">
                      หมดชั่วคราว
                    </div>
                  ) : isInCart ? (
                    /* ─── Quantity stepper ─── */
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => qty <= 1 ? removeFromCart(item.id) : updateQuantity(item.id, qty - 1)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 active:scale-90 transition-all cursor-pointer shadow-sm"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="min-w-[56px] text-center rounded-xl border-2 border-green-400 bg-white px-2 py-1.5 shadow-sm">
                        <span className="text-sm font-black text-green-600">{qty}</span>
                        <span className="text-[10px] font-bold text-gray-400 ml-1">ชิ้น</span>
                      </div>

                      <button
                        type="button"
                        disabled={qty >= item.stock}
                        onClick={() => updateQuantity(item.id, qty + 1)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-green-50 hover:border-green-200 hover:text-green-600 active:scale-90 transition-all cursor-pointer shadow-sm disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* ─── Add to cart ─── */
                    <button
                      onClick={() => addToCart(item)}
                      className="rounded-2xl px-5 py-2.5 text-xs font-bold bg-gray-900 hover:bg-orange-500 text-white shadow-sm hover:shadow-orange-500/20 transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      เลือกยืม
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
