"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Search, ShieldAlert, Edit2, ShieldCheck, Key, Save, X } from "lucide-react";
import Pagination from "@/components/ui/Pagination";

interface SheetUser {
  email: string;
  name: string;
  role: string;
  rank: string;
  customAvatar: string;
}

interface RoleData {
  roleName: string;
  rank: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<SheetUser[]>([]);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/roles")
      ]);
      
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }
      if (rolesRes.ok) {
        setRoles(await rolesRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
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
  const canManageUsers = userPermissions.includes("manage_users") || userPermissions.includes("*");

  if (!canManageUsers) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center px-4">
        <ShieldAlert className="w-16 h-16 text-gray-300 mb-2" />
        <h1 className="text-2xl font-black text-red-500">ปฏิเสธการเข้าใช้งาน</h1>
        <p className="text-gray-500 max-w-sm">คุณไม่มีสิทธิ์ในการจัดการสมาชิก</p>
        <button onClick={() => router.push("/")} className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500 active:scale-95">
          กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  const handleEditClick = (user: SheetUser) => {
    setEditingEmail(user.email);
    setSelectedRole(user.role || "user");
  };

  const handleSaveRole = async (email: string) => {
    // find the default rank for this role
    let rankToSet = "Member";
    if (selectedRole === "admin") {
      rankToSet = "Diamond";
    } else if (selectedRole === "user") {
      rankToSet = "Member";
    } else {
      const foundRole = roles.find(r => r.roleName.toLowerCase() === selectedRole.toLowerCase());
      if (foundRole) {
        rankToSet = foundRole.rank;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role: selectedRole,
          rank: rankToSet,
        }),
      });

      if (res.ok) {
        setEditingEmail(null);
        await fetchData();
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

  const validUsers = Array.isArray(users) ? users : [];
  const filteredUsers = validUsers.filter(user => 
    String(user.name || "").toLowerCase().includes(search.toLowerCase()) || 
    String(user.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (user.role && String(user.role).toLowerCase().includes(search.toLowerCase()))
  );
  const validRoles = Array.isArray(roles) ? roles : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">
            <Users className="w-4 h-4" />
            <span>Member Management</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">จัดการสมาชิก</h1>
          <p className="text-sm font-semibold text-gray-500 mt-1 max-w-xl leading-relaxed">
            เปลี่ยนตำแหน่งของสมาชิก (Role) และระดับแรงก์จะเปลี่ยนตามโครงสร้างของตำแหน่งนั้นๆ อัตโนมัติ
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/roles"
            className="rounded-2xl border border-orange-200 bg-orange-50 hover:bg-orange-100 px-5 py-3.5 text-sm font-bold text-orange-600 shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" /> จัดการตำแหน่ง (Roles)
          </Link>
        </div>
      </div>

      <div className="mt-8 mb-4 flex relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><Search className="w-4 h-4" /></span>
        <input type="text" placeholder="ค้นหาชื่อ, อีเมล หรือตำแหน่ง..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-medium focus:border-orange-500 outline-none shadow-sm" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xl shadow-gray-100/50">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-black uppercase text-gray-400">
                <th className="px-6 py-5">สมาชิก</th>
                <th className="px-6 py-5">ตำแหน่ง (Role)</th>
                <th className="px-6 py-5">Rank</th>
                <th className="px-6 py-5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/70 text-sm">
              {paginatedUsers.map(user => (
                <tr key={user.email} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {user.customAvatar ? (
                        <img src={user.customAvatar} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                          <Users className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{user.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingEmail === user.email ? (
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-800 focus:outline-none"
                      >
                        <option value="user">User (ผู้ใช้ทั่วไป)</option>
                        {validRoles.map(r => (
                          <option key={r.roleName} value={r.roleName}>{r.roleName}</option>
                        ))}
                        <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                      </select>
                    ) : (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role !== 'user' && user.role ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">
                    {user.rank || 'Member'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingEmail === user.email ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleSaveRole(user.email)} disabled={isSubmitting} className="p-2 bg-orange-500 text-white hover:bg-orange-600 rounded-xl transition disabled:opacity-50">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingEmail(null)} disabled={isSubmitting} className="p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-xl transition disabled:opacity-50">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleEditClick(user)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">ไม่พบสมาชิก</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
