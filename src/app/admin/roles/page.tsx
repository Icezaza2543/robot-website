"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Plus, X, Save, Trash2, Edit2, ShieldAlert, Key, Users } from "lucide-react";

interface RoleData {
  roleName: string;
  rank: string;
  permissions: string;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "manage_news", label: "จัดการข่าวสาร", desc: "เพิ่ม ลบ แก้ไขข่าวสารและกิจกรรม" },
  { id: "manage_items", label: "จัดการอุปกรณ์", desc: "เพิ่ม ลบ แก้ไขคลังอุปกรณ์" },
  { id: "manage_requests", label: "จัดการคำขอยืม", desc: "อนุมัติ คืน หรือปฏิเสธการยืมอุปกรณ์" },
  { id: "manage_website", label: "ตั้งค่าเว็บไซต์", desc: "แก้ไขหน้า About, รายชื่อที่ปรึกษา" },
  { id: "manage_roles", label: "จัดการตำแหน่ง (Roles)", desc: "สร้าง แก้ไข ลบ ตำแหน่งและสิทธิ์การเข้าถึง" },
  { id: "manage_users", label: "จัดการสมาชิก", desc: "มอบหมายตำแหน่ง (Role) ให้สมาชิก" },
];

const RANKS = ["Member", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "VIP"];

export default function AdminRolesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [roles, setRoles] = useState<RoleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formRoleName, setFormRoleName] = useState("");
  const [formRank, setFormRank] = useState("Member");
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchRoles();
    }
  }, [status, session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Frontend check (Backend also checks)
  const isAdmin = session?.user?.role === "admin";
  const userPermissions = session?.user?.permissions || [];
  const canManageRoles = isAdmin || userPermissions.includes("manage_roles") || userPermissions.includes("*");

  if (!canManageRoles) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center px-4">
        <ShieldAlert className="w-16 h-16 text-gray-300 mb-2" />
        <h1 className="text-2xl font-black text-red-500">ปฏิเสธการเข้าใช้งาน</h1>
        <p className="text-gray-500 max-w-sm">คุณไม่มีสิทธิ์ในการจัดการตำแหน่ง (Roles)</p>
        <button onClick={() => router.push("/")} className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500 active:scale-95">
          กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  const handleTogglePermission = (permId: string) => {
    setFormPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleOpenAdd = () => {
    setFormRoleName("");
    setFormRank("Member");
    setFormPermissions([]);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleOpenEdit = (r: RoleData) => {
    setFormRoleName(r.roleName);
    setFormRank(r.rank || "Member");
    setFormPermissions(r.permissions ? r.permissions.split(",").map(p => p.trim()) : []);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoleName.trim()) {
      alert("กรุณากรอกชื่อตำแหน่ง");
      return;
    }

    if (formRoleName.toLowerCase() === "admin" || formRoleName.toLowerCase() === "user") {
      alert("ไม่สามารถใช้ชื่อตำแหน่ง admin หรือ user ได้ (สงวนไว้สำหรับระบบ)");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleName: formRoleName,
          rank: formRank,
          permissions: formPermissions.join(","),
        }),
      });

      if (res.ok) {
        setShowForm(false);
        await fetchRoles();
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

  const handleDelete = async (roleName: string) => {
    if (!confirm(`ยืนยันการลบตำแหน่ง "${roleName}" ออกจากระบบ? สมาชิกที่อยู่ในตำแหน่งนี้จะถูกปรับเป็น User ธรรมดา`)) return;
    try {
      const res = await fetch(`/api/admin/roles?roleName=${encodeURIComponent(roleName)}`, { method: "DELETE" });
      if (res.ok) {
        await fetchRoles();
      } else {
        const data = await res.json();
        alert(data.error || "ไม่สามารถลบได้");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">
            <Key className="w-4 h-4" />
            <span>Role-Based Access Control</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">จัดการตำแหน่ง (Roles)</h1>
          <p className="text-sm font-semibold text-gray-500 mt-1 max-w-xl leading-relaxed">
            สร้างตำแหน่งกำหนดแรงก์ และตั้งค่าสิทธิ์การเข้าถึงเมนูแอดมิน (Permissions) ได้อย่างอิสระ
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/users"
            className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4 text-orange-500" /> จัดการสมาชิก
          </Link>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={() => showForm ? setShowForm(false) : handleOpenAdd()}
          className={`rounded-2xl px-5 py-3.5 text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 ${
            showForm ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-gray-900 text-white hover:bg-black hover:shadow-black/20"
          }`}
        >
          {showForm ? <><X className="w-4 h-4" /> ปิดฟอร์ม</> : <><Plus className="w-4 h-4" /> สร้างตำแหน่งใหม่</>}
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-xl shadow-gray-100/50">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-800 tracking-tight">{isEditing ? "แก้ไขตำแหน่ง" : "สร้างตำแหน่งใหม่"}</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อตำแหน่ง (Role Name) *</label>
                <input 
                  type="text" 
                  required 
                  disabled={isEditing}
                  value={formRoleName} 
                  onChange={e => setFormRoleName(e.target.value)} 
                  placeholder="เช่น เหรัญญิก, ฝ่ายพัสดุ"
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none disabled:bg-gray-50 disabled:text-gray-400" 
                />
                {isEditing && <span className="text-[10px] text-gray-400">ไม่สามารถแก้ไขชื่อตำแหน่งได้ หากต้องการเปลี่ยนชื่อให้ลบและสร้างใหม่</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ระดับ Rank เริ่มต้น</label>
                <select 
                  value={formRank} 
                  onChange={e => setFormRank(e.target.value)} 
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 outline-none bg-white"
                >
                  {RANKS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-400">เมื่อผู้ใช้ได้รับตำแหน่งนี้ จะได้ Rank นี้โดยอัตโนมัติ</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">สิทธิ์การเข้าถึง (Permissions)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {AVAILABLE_PERMISSIONS.map(perm => {
                  const isChecked = formPermissions.includes(perm.id) || formPermissions.includes("*");
                  return (
                    <label 
                      key={perm.id} 
                      className={`relative flex cursor-pointer rounded-2xl border p-4 transition-all ${
                        isChecked ? "border-orange-500 bg-orange-50/50" : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-5 items-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={formPermissions.includes("*")}
                            onChange={() => handleTogglePermission(perm.id)}
                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${isChecked ? "text-orange-900" : "text-gray-700"}`}>
                            {perm.label}
                          </span>
                          <span className={`text-[11px] leading-snug mt-0.5 ${isChecked ? "text-orange-600/80" : "text-gray-500"}`}>
                            {perm.desc}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-gray-100">
              <button type="submit" disabled={isSubmitting} className="rounded-xl bg-orange-500 hover:bg-orange-600 px-8 py-3 text-sm font-bold text-white transition disabled:opacity-70 flex items-center gap-2">
                {isSubmitting ? "กำลังบันทึก..." : <><Save className="w-4 h-4" /> {isEditing ? "อัปเดตตำแหน่ง" : "บันทึกตำแหน่ง"}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Role List */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Built-in Admin Role (Cannot be modified here) */}
        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 flex flex-col justify-between opacity-80">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide">admin</h3>
              </div>
              <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Built-in</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-gray-500">Rank:</span>
              <span className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-2.5 py-0.5 rounded-lg shadow-sm">Diamond (Default)</span>
            </div>
            <div className="text-xs text-gray-500 font-medium leading-relaxed">
              สิทธิ์สูงสุดของระบบ สามารถเข้าถึงได้ทุกส่วนโดยไม่มีข้อจำกัด
            </div>
          </div>
        </div>

        {roles.map(role => (
          <div key={role.roleName} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-black text-gray-800">{role.roleName}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-gray-500">Rank:</span>
                <span className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-lg shadow-sm">{role.rank}</span>
              </div>
              
              <div className="mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">สิทธิ์การเข้าถึง</span>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions ? role.permissions.split(",").map(p => {
                    const perm = AVAILABLE_PERMISSIONS.find(ap => ap.id === p.trim());
                    return perm ? (
                      <span key={p} className="text-[10px] font-semibold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">
                        {perm.label}
                      </span>
                    ) : (
                      <span key={p} className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {p}
                      </span>
                    );
                  }) : <span className="text-xs text-gray-400 italic">ไม่มีสิทธิ์</span>}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
              <button onClick={() => handleOpenEdit(role)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(role.roleName)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {roles.length === 0 && !isLoading && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <Key className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-400">ยังไม่มีตำแหน่งเพิ่มเติม</p>
            <p className="text-xs text-gray-400 mt-1">คลิก "สร้างตำแหน่งใหม่" ด้านบนเพื่อเพิ่ม</p>
          </div>
        )}
      </div>
    </div>
  );
}
