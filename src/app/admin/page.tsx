"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  Newspaper,
  Package,
  List,
  LayoutTemplate,
  UsersRound,
  HandCoins,
  Key,
  Users,
  ShieldCheck,
  LogOut,
  ChevronRight,
  DoorOpen,
  CalendarDays
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    router.replace("/");
    return null;
  }

  const role = session.user.role;
  const permissions = (session.user as any).permissions || [];
  const isAdmin = role === "admin" || permissions.includes("*");

  const hasPerm = (perm: string) => isAdmin || permissions.includes(perm);

  const hasAdminAccess =
    isAdmin ||
    permissions.some((p: string) => p.startsWith("manage_"));

  if (!hasAdminAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center px-4">
        <ShieldCheck className="w-16 h-16 text-gray-300 mb-2" />
        <h1 className="text-2xl font-black text-red-500">ปฏิเสธการเข้าใช้งาน</h1>
        <p className="text-gray-500 max-w-sm">คุณไม่มีสิทธิ์ในการเข้าถึงหน้าผู้ดูแลระบบ</p>
        <button onClick={() => router.push("/")} className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500 active:scale-95">
          กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  const menuGroups = [
    {
      title: "ระบบจองห้อง",
      items: [
        {
          title: "จัดการห้องและจอง (Rooms)",
          desc: "เพิ่ม/ลดห้อง, ดูตารางการใช้, และอนุมัติคำขอ",
          href: "/admin/rooms",
          icon: DoorOpen,
          color: "text-purple-500",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-100",
          show: hasPerm("manage_rooms")
        }
      ]
    },
    {
      title: "ระบบยืม-คืนอุปกรณ์",
      items: [
        {
          title: "จัดการคำขอยืม (Borrow Requests)",
          desc: "อนุมัติ, ปฏิเสธ หรือตรวจสอบสถานะการยืมอุปกรณ์",
          href: "/admin/borrow",
          icon: List,
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100",
          show: hasPerm("manage_requests")
        },
        {
          title: "คลังอุปกรณ์ (Inventory)",
          desc: "เพิ่ม ลบ หรือแก้ไขจำนวนอุปกรณ์ในคลัง",
          href: "/admin/items",
          icon: Package,
          color: "text-indigo-500",
          bgColor: "bg-indigo-50",
          borderColor: "border-indigo-100",
          show: hasPerm("manage_items")
        }
      ]
    },
    {
      title: "จัดการเว็บไซต์",
      items: [
        {
          title: "จัดการข่าวสาร (News)",
          desc: "อัปเดตกิจกรรมและข่าวสารบนหน้าแรก",
          href: "/admin/news",
          icon: Newspaper,
          color: "text-orange-500",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-100",
          show: hasPerm("manage_news")
        },
        {
          title: "จัดการโครงการ/กิจกรรม (Events)",
          desc: "สร้างโครงการ เปิดรับสมัคร และจัดการโควต้าผู้เข้าร่วม",
          href: "/admin/events",
          icon: CalendarDays,
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100",
          show: hasPerm("manage_news")
        },
        {
          title: "หน้าเกี่ยวกับชมรม (About)",
          desc: "แก้ไขประวัติ, วิสัยทัศน์ และข้อมูลติดต่อ",
          href: "/admin/about",
          icon: LayoutTemplate,
          color: "text-emerald-500",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-100",
          show: hasPerm("manage_website")
        },
        // {
        //   title: "รายชื่อที่ปรึกษา (Advisors)",
        //   desc: "เพิ่ม หรือแก้ไขรายชื่ออาจารย์ที่ปรึกษาชมรม",
        //   href: "/admin/advisors",
        //   icon: UsersRound,
        //   color: "text-teal-500",
        //   bgColor: "bg-teal-50",
        //   borderColor: "border-teal-100",
        //   show: hasPerm("manage_website")
        // },
        {
          title: "ผู้สนับสนุน (Sponsors)",
          desc: "จัดการรายชื่อและโลโก้ผู้สนับสนุนชมรม",
          href: "/admin/sponsors",
          icon: HandCoins,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-100",
          show: hasPerm("manage_website")
        }
      ]
    },
    {
      title: "ระบบสมาชิกและสิทธิ์ (RBAC)",
      items: [
        {
          title: "จัดการสมาชิก (Users)",
          desc: "ดูรายชื่อสมาชิกทั้งหมด และมอบหมายตำแหน่ง (Role)",
          href: "/admin/users",
          icon: Users,
          color: "text-purple-500",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-100",
          show: hasPerm("manage_users")
        },
        {
          title: "จัดการตำแหน่ง (Roles & Permissions)",
          desc: "สร้างตำแหน่งใหม่ ตั้งค่า Rank และกำหนดสิทธิ์แบบละเอียด",
          href: "/admin/roles",
          icon: Key,
          color: "text-rose-500",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-100",
          show: hasPerm("manage_roles")
        }
      ]
    }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">
            <Settings className="w-4 h-4" />
            <span>Control Panel</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">แผงควบคุมผู้ดูแลระบบ</h1>
          <p className="text-sm font-semibold text-gray-500 mt-2 max-w-xl leading-relaxed">
            ยินดีต้อนรับ, <span className="text-gray-800 font-bold">{session.user.name}</span>! คุณกำลังอยู่ในโหมดผู้ควบคุมระบบ เมนูด้านล่างจะแสดงเฉพาะส่วนที่คุณได้รับสิทธิ์ให้จัดการเท่านั้น
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
          >
            กลับสู่หน้าแรก
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 px-5 py-3.5 text-sm font-bold text-red-600 shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Menus */}
      <div className="mt-10 flex flex-col gap-10">
        {menuGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter(item => item.show);

          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx}>
              <h2 className="text-lg font-black text-gray-800 mb-4 tracking-tight border-b border-gray-200 pb-3">
                {group.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={i}
                      href={item.href}
                      className="group flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-orange-200 transition-all active:scale-[0.98]"
                    >
                      <div>
                        <div className={`w-12 h-12 rounded-2xl ${item.bgColor} ${item.borderColor} border flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                          <Icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <h3 className="text-base font-black text-gray-800 group-hover:text-orange-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs font-semibold text-gray-500 mt-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <div className="mt-6 flex items-center text-xs font-bold text-gray-400 group-hover:text-orange-500 transition-colors">
                        จัดการตอนนี้ <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
