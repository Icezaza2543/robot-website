"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/providers/CartProvider";
import { ShoppingCart, ClipboardList, Plug, Package, Trash2, ExternalLink, Settings, MonitorUp, History, LogOut, X, IdCard, Pencil } from "lucide-react";
import { ProfileCardModal } from "@/components/ui/ProfileCardModal";
import { EditProfileModal } from "@/components/ui/EditProfileModal";

export default function NavbarAuth() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const { cartItems, cartCount, removeFromCart } = useCart();
  const cartRef = useRef<HTMLDivElement>(null);

  // Close cart popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-10 w-28 animate-pulse rounded-xl bg-gray-100" />
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <Link
        href="/login"
        className="rounded-xl bg-gray-900 hover:bg-orange-500 px-6 py-2.5 text-base font-bold text-white shadow-md shadow-gray-900/10 transition-all duration-300 hover:shadow-orange-500/20 active:scale-95 cursor-pointer"
      >
        เข้าสู่ระบบ
      </Link>
    );
  }

  const { name, email, image, role } = session.user;
  const isAdmin = role === "admin";

  return (
    <>
      <div className="flex items-center gap-4 relative z-50">
        {/* Cart Button with Click-Toggle Popup */}
        <div 
          className="relative"
          ref={cartRef}
        >
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200/80 bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer active:scale-95 group"
            title="ตะกร้ายืมอุปกรณ์"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white shadow-md shadow-orange-500/30 animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Click-Based Cart Dropdown Popup */}
          {isCartOpen && (
            <div className="fixed right-4 left-4 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2.5 sm:w-80 w-auto origin-top-right rounded-3xl border border-gray-100 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-[999]">
              <h4 className="text-xs font-black text-gray-900 border-b border-gray-100 pb-2 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><ClipboardList className="w-4 h-4 text-orange-500" /> อุปกรณ์ในตะกร้า</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-md">
                    {cartCount} รายการ
                  </span>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </h4>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-gray-400 flex flex-col items-center gap-1.5">
                  <Plug className="w-8 h-8 text-gray-200 mb-1" />
                  <span>ตะกร้าว่างเปล่า</span>
                  <span className="text-[10px] font-medium text-gray-300">เลือกของเพื่อสะสมขอยืม</span>
                </div>
              ) : (
                <>
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-100/50 pr-1 flex flex-col gap-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 group/item">
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black text-orange-500 block uppercase tracking-wider mb-0.5">
                            {item.id}
                          </span>
                          <h5 className="text-xs font-bold text-gray-800 truncate" title={item.name}>
                            {item.name}
                          </h5>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold mt-0.5">
                            <Package className="w-3 h-3" /> <span>จำนวน: {item.quantity} ชิ้น</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 hover:text-red-500 hover:scale-110 transition-all duration-200 cursor-pointer active:scale-90 p-1"
                          title="ลบสิ่งของออกจากตะกร้า"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
                    <Link
                      href="/cart"
                      onClick={() => setIsCartOpen(false)}
                      className="w-full rounded-2xl bg-gray-900 hover:bg-orange-500 text-white font-bold py-3 text-center text-xs transition-all duration-300 shadow-md shadow-gray-900/10 hover:shadow-orange-500/20 cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>ไปยังหน้าตะกร้ายืมอุปกรณ์</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* User Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            className="flex items-center gap-2.5 rounded-xl border border-gray-200/80 bg-white p-1.5 pr-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer active:scale-98"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-orange-100 border border-orange-200">
              {image ? (
                <Image
                  src={image}
                  alt={name || "User Profile"}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold text-orange-500 uppercase">
                  {name ? name.charAt(0) : "U"}
                </div>
              )}
            </div>
            <div className="hidden flex-col items-start text-left sm:flex">
              <span className="text-sm font-bold text-gray-800 line-clamp-1 max-w-[120px]">
                {name || "สมาชิก"}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-500">
                {isAdmin ? "ผู้ดูแลระบบ" : "สมาชิกชมรม"}
              </span>
            </div>
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Premium Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2.5 w-64 origin-top-right rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header Info */}
              <div className="px-3.5 py-3 border-b border-gray-50 flex flex-col">
                <span className="text-sm font-bold text-gray-800 truncate">
                  {name}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {email}
                </span>
              </div>

              {/* Links */}
              <div className="mt-1.5 flex flex-col gap-0.5">
                {/* ID Card Button */}
                <button
                  onClick={() => {
                    setIsCardModalOpen(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors text-left w-full cursor-pointer"
                >
                  <IdCard className="w-4 h-4" />
                  บัตรประจำตัว (ID Card)
                </button>

                {/* Edit Profile Button */}
                <button
                  onClick={() => {
                    setIsEditProfileOpen(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors text-left w-full cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  แก้ไขโปรไฟล์
                </button>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    แผงผู้ดูแลระบบ
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  แผงควบคุม (Dashboard)
                </Link>

                <Link
                  href="/equipment"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <MonitorUp className="w-4 h-4" />
                  ยืมอุปกรณ์อิเล็กทรอนิกส์
                </Link>

                <Link
                  href="/borrow/history"
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <History className="w-4 h-4" />
                  ประวัติการยืม-คืน
                </Link>
              </div>

              {/* Action Sign Out */}
              <div className="mt-1.5 border-t border-gray-50 pt-1.5">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  ออกจากระบบ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProfileCardModal 
        isOpen={isCardModalOpen} 
        onClose={() => setIsCardModalOpen(false)} 
        user={{
          name: name || "",
          email: email || "",
          image: image || undefined,
          role: role || undefined
        }}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </>
  );
}
