"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Timer, CheckCircle2, RefreshCw, XCircle, Package, AlertTriangle, FileText, Settings, ClipboardList, Search, PartyPopper, Inbox, MapPin, User, Megaphone, Newspaper, Settings2 } from "lucide-react";
import Pagination from "@/components/ui/Pagination";

interface RequestItem {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
}

interface BorrowRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  borrowerName: string;
  borrowerPhone: string;
  items: string; // JSON string
  borrowDate: string;
  dueDate: string;
  returnDate: string;
  note: string;
  status: string;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBorrowPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State Management
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRequests, setExpandedRequests] = useState<{ [key: string]: boolean }>({});

  // Action Panel Form State
  const [actioningRequestId, setActioningRequestId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "return" | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Load all borrow requests from API
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/borrow");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        console.error("Failed to load borrow requests");
      }
    } catch (err) {
      console.error("Error loading borrow requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchRequests();
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <span className="text-sm font-bold text-gray-400 animate-pulse">กำลังโหลดแผงผู้ดูแลระบบ...</span>
        </div>
      </div>
    );
  }

  // Client side fallback safety (Middleware already enforces this)
  const userPermissions = session?.user?.permissions || [];
  const isAdmin = session?.user?.role === "admin";
  const canAccess = isAdmin || userPermissions.includes("manage_requests") || userPermissions.includes("*");

  if (status === "unauthenticated" || (status === "authenticated" && !canAccess)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center px-4">
        <Lock className="w-16 h-16 text-gray-300 mb-2" />
        <h1 className="text-2xl font-black text-rose-500">ปฏิเสธการเข้าใช้งาน</h1>
        <p className="text-gray-500 max-w-sm">เฉพาะผู้ควบคุมระบบชมรม (Admin) เท่านั้นที่สามารถจัดการคำขออนุมัติยืมได้</p>
        <Link
          href="/equipment"
          className="rounded-2xl bg-gray-900 hover:bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-md transition duration-300 cursor-pointer"
        >
          กลับไปคลังยืมของสมาชิก
        </Link>
      </div>
    );
  }

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedRequests((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Helper: Status label & styling
  const getStatusDetails = (statusName: string) => {
    const s = statusName.toLowerCase();
    switch (s) {
      case "pending":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-700",
          dot: "bg-amber-500",
          text: "รอดำเนินการอนุมัติ",
          icon: <Timer className="w-3.5 h-3.5" />,
        };
      case "approved":
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
          dot: "bg-emerald-500",
          text: "อนุมัติแล้ว (กำลังยืม)",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "return_pending":
        return {
          bg: "bg-teal-50 border-teal-200 text-teal-700",
          dot: "bg-teal-500",
          text: "สมาชิกขอคืนอุปกรณ์",
          icon: <RefreshCw className="w-3.5 h-3.5" />,
        };
      case "rejected":
        return {
          bg: "bg-rose-50 border-rose-200 text-rose-700",
          dot: "bg-rose-500",
          text: "ปฏิเสธการขอยืม",
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
      case "returned":
        return {
          bg: "bg-blue-50 border-blue-200 text-blue-700",
          dot: "bg-blue-500",
          text: "ส่งคืนแล้ว (เสร็จสิ้น)",
          icon: <Package className="w-3.5 h-3.5" />,
        };
      case "overdue":
        return {
          bg: "bg-purple-50 border-purple-200 text-purple-700",
          dot: "bg-purple-500",
          text: "เกินกำหนดส่งคืน",
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200 text-gray-700",
          dot: "bg-gray-500",
          text: statusName,
          icon: <FileText className="w-3.5 h-3.5" />,
        };
    }
  };

  // Open confirmation actions dialog
  const openActionForm = (requestId: string, type: "approve" | "reject" | "return") => {
    setActioningRequestId(requestId);
    setActionType(type);
    setAdminNoteInput("");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Close action dialog
  const closeActionForm = () => {
    setActioningRequestId(null);
    setActionType(null);
    setAdminNoteInput("");
    setErrorMessage(null);
  };

  // Submit Action to PATCH API
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actioningRequestId || !actionType) return;

    let targetStatus = "pending";
    if (actionType === "approve") targetStatus = "approved";
    if (actionType === "reject") targetStatus = "rejected";
    if (actionType === "return") targetStatus = "returned";

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await fetch("/api/admin/borrow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: actioningRequestId,
          status: targetStatus,
          adminNote: adminNoteInput.trim() || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "เกิดข้อผิดพลาดในการดำเนินการ");
      }

      setSuccessMessage(`ทำรายการสำเร็จ: อัปเดตใบคำขอ ${actioningRequestId} เรียบร้อยแล้ว`);
      
      // Refresh requests list
      await fetchRequests();

      // Delay closing to let user read success message
      setTimeout(() => {
        closeActionForm();
        setSuccessMessage(null);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "ล้มเหลวในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute stats
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status.toLowerCase() === "pending").length;
  const approvedCount = requests.filter((r) => r.status.toLowerCase() === "approved").length;
  const returnPendingCount = requests.filter((r) => r.status.toLowerCase() === "return_pending").length;
  const overdueCount = requests.filter((r) => r.status.toLowerCase() === "overdue").length;
  const returnedCount = requests.filter((r) => r.status.toLowerCase() === "returned").length;

  // Format YYYY-MM-DD
  const formatDateString = (dateStr: string) => {
    if (!dateStr) return "-";
    const parts = dateStr.split(" ");
    const ymd = parts[0].split("-");
    if (ymd.length === 3) {
      const formattedDate = `${ymd[2]}/${ymd[1]}/${ymd[0]}`;
      return parts[1] ? `${formattedDate} ${parts[1]}` : formattedDate;
    }
    return dateStr;
  };

  // Filter lists
  const filteredRequests = requests.filter((request) => {
    if (statusFilter !== "All" && request.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    const matchesSearch =
      request.id.toLowerCase().includes(search.toLowerCase()) ||
      request.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      request.items.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 md:p-10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">
            <Settings className="w-4 h-4" />
            <span>NU Robot Club Administrator Portal</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">
            ระบบอนุมัติและจัดการคำขอยืมอุปกรณ์
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-1 max-w-xl leading-relaxed">
            แผงควบคุมหลักสำหรับแอดมินเพื่อตรวจสอบความถูกต้อง ตรวจสอบเหตุผล อนุมัติการส่งออกวัสดุ และบันทึกยืนยันรับคืนอุปกรณ์กลับเข้าสู่คลังจัดเก็บ
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
            href="/admin/items"
            className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4 text-orange-500" /> จัดการรายการอุปกรณ์
          </Link>
          <Link
            href="/admin/news"
            className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Newspaper className="w-4 h-4 text-orange-500" /> จัดการข่าวสาร
          </Link>
          <Link
            href="/admin/about"
            className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Settings2 className="w-4 h-4 text-orange-500" /> จัดการหน้าเกี่ยวกับ
          </Link>
        </div>
      </div>

      {/* Admin Quick Dashboard Counters */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-6">
        {/* Stat: Total */}
        <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">ใบคำขอทั้งหมด</span>
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-gray-900">{totalCount}</span>
            <span className="text-xs font-bold text-gray-400">รายการ</span>
          </div>
        </div>

        {/* Stat: Pending */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold uppercase tracking-wider">รอดำเนินการ</span>
            <Timer className="w-5 h-5 animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-amber-600">{pendingCount}</span>
            <span className="text-xs font-bold text-amber-500">รอตัดสินใจ</span>
          </div>
        </div>

        {/* Stat: Approved (Held items) */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-xs font-bold uppercase tracking-wider">กำลังยืมถือครอง</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-600">{approvedCount}</span>
            <span className="text-xs font-bold text-emerald-500">อยู่นอกคลัง</span>
          </div>
        </div>

        {/* Stat: Return Pending */}
        <div className="rounded-2xl border border-teal-200 bg-teal-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between text-teal-500">
            <span className="text-xs font-bold uppercase tracking-wider">รอรับคืนของ</span>
            <RefreshCw className={`w-5 h-5 ${returnPendingCount > 0 ? "animate-spin-slow" : ""}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className={`text-3xl font-black ${returnPendingCount > 0 ? "text-teal-600" : "text-gray-700"}`}>{returnPendingCount}</span>
            <span className="text-xs font-bold text-teal-500">รอตรวจรับ</span>
          </div>
        </div>

        {/* Stat: Overdue */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between text-purple-500">
            <span className="text-xs font-bold uppercase tracking-wider">เกินกำหนดส่งคืน</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className={`text-3xl font-black ${overdueCount > 0 ? "text-purple-600 animate-pulse" : "text-gray-700"}`}>
              {overdueCount}
            </span>
            <span className="text-xs font-bold text-purple-500">เร่งด่วน</span>
          </div>
        </div>

        {/* Stat: Returned */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/20 p-5 shadow-sm">
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-xs font-bold uppercase tracking-wider">ส่งคืนแล้ว</span>
            <Package className="w-5 h-5" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-blue-600">{returnedCount}</span>
            <span className="text-xs font-bold text-blue-500">เก็บเข้าคลัง</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Search and Tag Filters */}
      <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-gray-100 pb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="ค้นหาด้วยรหัสใบยืม, ผู้ยืม, อีเมล หรือสิ่งของ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">สถานะ:</span>
          {[
            { id: "All", label: "ทั้งหมด" },
            { id: "pending", label: "รอดำเนินการ" },
            { id: "approved", label: "อนุมัติแล้ว" },
            { id: "return_pending", label: "รอรับคืน" },
            { id: "rejected", label: "ปฏิเสธ" },
            { id: "returned", label: "คืนแล้ว" },
            { id: "overdue", label: "เกินกำหนด" },
          ].map((statusBtn) => (
            <button
              key={statusBtn.id}
              onClick={() => setStatusFilter(statusBtn.id)}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                statusFilter === statusBtn.id
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {statusBtn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Request Processing Overlay / Modal Form */}
      {actioningRequestId && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-950 flex items-center gap-2">
                {actionType === "approve" && <span className="text-emerald-500 flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5" /> ยืนยันอนุมัติใบยืมอุปกรณ์</span>}
                {actionType === "reject" && <span className="text-rose-500 flex items-center gap-1.5"><XCircle className="w-5 h-5" /> ยืนยันการปฏิเสธคำขอยืม</span>}
                {actionType === "return" && <span className="text-blue-500 flex items-center gap-1.5"><Package className="w-5 h-5" /> บันทึกยืนยันคืนสิ่งของอุปกรณ์</span>}
                <span className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded-md text-gray-600">
                  {actioningRequestId}
                </span>
              </h3>
              <button
                onClick={closeActionForm}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              {/* Warnings and Details */}
              <div className="text-xs leading-relaxed p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-gray-600 font-medium">
                {actionType === "approve" && (
                  <p className="text-emerald-700 font-semibold flex gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 inline mt-0.5" /> <span>การอนุมัติจะทำการ **หักลดจำนวนอุปกรณ์ (Stock)** ที่ถูกจองออกจากระบบคลังใน Google Sheets ทันที กรุณาตรวจสอบให้แน่ใจว่าอุปกรณ์พร้อมจ่ายแจกจริง</span>
                  </p>
                )}
                {actionType === "reject" && (
                  <p className="text-rose-700 font-semibold">
                    ใบขอยืมของสมาชิกจะถูกปรับเป็น "ปฏิเสธ" ระบบจะไม่ดำเนินการหักจำนวนสิ่งของออกจากสต็อกในคลัง
                  </p>
                )}
                {actionType === "return" && (
                  <p className="text-blue-700 font-semibold">
                    การทำรายการส่งคืนจะทำการ **เพิ่มยอดสต็อกในคลังบวกกลับเข้าสู่ระบบ** คอลัมน์วันส่งกลับจะระบุตามเวลาของวันนี้โดยอัตโนมัติ
                  </p>
                )}
              </div>

              {/* Text Input area for Admin Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 block">
                  บันทึกเพิ่มเติมจากแอดมิน (เขียนระบุสถานที่รับของ, เหตุผล หรือข้อตกลงเพิ่มเติม):
                </label>
                <textarea
                  placeholder={
                    actionType === "reject"
                      ? "ระบุเหตุผลในการปฏิเสธคำขอนี้ เช่น สต็อกเสียหาย, ข้อมูลเบอร์โทรไม่ถูกต้อง..."
                      : "ระบุข้อตกลง เช่น มารับของได้ที่ตู้เก็บโมดูล A ชั้น 2 วันพรุ่งนี้..."
                  }
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                  required={actionType === "reject"} // Reject must have a reason!
                />
              </div>

              {/* Error Notification Alert Banner */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 leading-relaxed animate-pulse flex items-start gap-1.5">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Notification */}
              {successMessage && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 leading-relaxed flex items-start gap-1.5">
                  <PartyPopper className="w-4 h-4 shrink-0 mt-0.5" /> <span>{successMessage}</span>
                </div>
              )}

              {/* Actions Footer Button layout */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={closeActionForm}
                  className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2.5 text-xs font-bold text-gray-500 transition active:scale-95 cursor-pointer"
                  disabled={isSubmitting}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                    actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : ""
                  } ${actionType === "reject" ? "bg-rose-600 hover:bg-rose-700" : ""} ${
                    actionType === "return" ? "bg-blue-600 hover:bg-blue-700" : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin h-3.5 w-3.5 border-t-2 border-b-2 border-white rounded-full"></span>
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    "ยืนยันการทำรายการ"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requests List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <span className="text-sm font-bold text-gray-400 animate-pulse">กำลังโหลดคำขอทั้งหมดจากคลัง Google Sheets...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center animate-in fade-in duration-300 flex flex-col items-center">
          <Inbox className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mt-4">ไม่พบรายการใบขอยืมอุปกรณ์</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
            {search || statusFilter !== "All"
              ? "ไม่พบข้อมูลใด ๆ ที่ตรงกับเงื่อนไขคำค้นหาหรือตัวกรองดังกล่าว ลองเปลี่ยนคำค้นหาใหม่"
              : "ขณะนี้ยังไม่มีใบยื่นเรื่องของานยืมอุปกรณ์ IoT หรือคอมพิวเตอร์ส่งเข้ามาในระบบหลังบ้าน"}
          </p>
          {(search || statusFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="mt-6 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 px-5 py-2.5 text-xs font-bold text-orange-600 shadow-sm transition active:scale-95 cursor-pointer"
            >
              ล้างการค้นหาและตัวกรอง
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-5 animate-in fade-in duration-300">
          {paginatedRequests.map((request) => {
            const statusDetail = getStatusDetails(request.status);
            const isExpanded = !!expandedRequests[request.id];
            
            // Parse item array
            let parsedItems: RequestItem[] = [];
            try {
              parsedItems = JSON.parse(request.items);
            } catch (e) {
              console.error("JSON parsing error inside Admin view requests", e);
            }

            return (
              <div
                key={request.id}
                className={`rounded-3xl border transition-all duration-300 bg-white overflow-hidden shadow-sm hover:shadow-md ${
                  isExpanded ? "border-orange-200 ring-1 ring-orange-200/50" : "border-gray-200/80"
                }`}
              >
                {/* Header card area */}
                <div
                  onClick={() => toggleExpand(request.id)}
                  className="p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none group transition-colors hover:bg-gray-50/50"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-base font-black text-gray-900 bg-gray-100 border border-gray-200/60 px-3 py-1.5 rounded-xl">
                      {request.id}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-400">ผู้ยืมสิ่งของ</span>
                      <span className="text-sm font-black text-gray-800 leading-snug">
                        {request.borrowerName}
                      </span>
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:items-center gap-4 lg:gap-8">
                    {/* E-mail Submitter */}
                    <div className="flex flex-col col-span-2 md:col-span-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">อีเมลล็อกอิน</span>
                      <span className="text-xs font-bold text-gray-700 truncate max-w-[140px]" title={request.userEmail}>
                        {request.userEmail}
                      </span>
                    </div>

                    {/* Borrow date */}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">วันที่ยืม</span>
                      <span className="text-xs font-bold text-gray-700">
                        {formatDateString(request.borrowDate)}
                      </span>
                    </div>

                    {/* Due date */}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">กำหนดคืน</span>
                      <span className={`text-xs font-black ${
                        request.status.toLowerCase() === "overdue" ? "text-purple-600" : "text-gray-700"
                      }`}>
                        {formatDateString(request.dueDate)}
                      </span>
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center col-span-2 lg:col-auto lg:ml-2">
                      <div className={`flex items-center gap-1 border rounded-full px-3 py-1 text-xs font-black tracking-wide ${statusDetail.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDetail.dot}`} />
                        <span>{statusDetail.icon} {statusDetail.text}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expand indicators Chevron button */}
                  <div className="hidden lg:flex items-center justify-center h-10 w-10 rounded-xl bg-gray-50 group-hover:bg-orange-50 group-hover:text-orange-500 text-gray-400 transition-colors">
                    <svg
                      className={`h-5 w-5 transition-transform duration-300 ${
                        isExpanded ? "rotate-180 text-orange-500" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Extended Details Drawer */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/20 p-6 sm:p-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                      {/* Left Side: Items table layout */}
                      <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-gray-400" /> รายการสิ่งของขอออกยืม ({parsedItems.length} ชิ้น)
                        </h4>

                        <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-xs">
                          <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID อุปกรณ์</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ชื่อรายการ</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">หมวดหมู่</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">จำนวนขอยืม</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {parsedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                  <td className="whitespace-nowrap px-4 py-3 text-xs">
                                    <span className="font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                      {item.id}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-xs">
                                    <div className="font-bold text-gray-800">{item.name}</div>
                                    <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                      <MapPin className="w-3 h-3 shrink-0" /><span>ที่เก็บสิ่งของ:</span>
                                      <span className="font-semibold text-gray-500">{item.location || "ไม่ได้ระบุ"}</span>
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-xs font-bold text-gray-400">
                                    {item.category}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-center text-xs font-black text-gray-800">
                                    {item.quantity}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right Side: Notes and Admin Panel Action buttons */}
                      <div className="space-y-5">
                        {/* Submitter Info Card */}
                        <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-xs space-y-3">
                          <h4 className="text-xs font-black text-gray-950 border-b border-gray-50 pb-2 flex items-center gap-1.5">
                            <User className="w-4 h-4" /> ข้อมูลสมาชิกที่ทำรายการ
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="font-bold text-gray-400">ยื่นคำขอโดย:</span>
                              <span className="font-semibold text-gray-700">{request.userName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold text-gray-400">อีเมลทางการ:</span>
                              <span className="font-semibold text-gray-700">{request.userEmail}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold text-gray-400">เบอร์ติดต่อกลับ:</span>
                              <span className="font-bold text-orange-600">{request.borrowerPhone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Note/Reason Column */}
                        <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-xs space-y-2">
                          <h4 className="text-xs font-black text-gray-950 flex items-center gap-1.5">
                            <FileText className="w-4 h-4" /> จุดประสงค์การขอยืมของสมาชิก
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-wrap font-medium">
                            {request.note || "ไม่มีระบุจุดประสงค์เพิ่มเติม"}
                          </p>
                        </div>

                        {/* Admin Notes Feedbacks */}
                        {request.adminNote && (
                          <div className="rounded-2xl border border-orange-200 bg-orange-50/10 p-5 shadow-xs space-y-2">
                            <h4 className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                              <Megaphone className="w-4 h-4" /> บันทึกของแอดมินก่อนหน้านี้
                            </h4>
                            <p className="text-xs text-orange-900 leading-relaxed bg-white p-3 rounded-xl border border-orange-100/50 whitespace-pre-wrap font-medium">
                              {request.adminNote}
                            </p>
                          </div>
                        )}

                        {/* Admin Control Actions Buttons Panel */}
                        <div className="pt-2 border-t border-gray-100 space-y-2.5">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Settings className="w-3 h-3" /> การจัดการควบคุมคำขออนุมัติ:
                          </h4>

                          {request.status.toLowerCase() === "pending" && (
                            <div className="flex gap-2.5">
                              {/* Approve Button */}
                              <button
                                onClick={() => openActionForm(request.id, "approve")}
                                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 text-xs transition shadow-sm hover:shadow-md cursor-pointer text-center active:scale-98"
                              >
                                <CheckCircle2 className="w-4 h-4" /> อนุมัติยืม
                              </button>

                              {/* Reject Button */}
                              <button
                                onClick={() => openActionForm(request.id, "reject")}
                                className="flex-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold py-2.5 px-4 text-xs transition cursor-pointer text-center active:scale-98"
                              >
                                <XCircle className="w-4 h-4" /> ปฏิเสธขอยืม
                              </button>
                            </div>
                          )}

                          {(request.status.toLowerCase() === "approved" || request.status.toLowerCase() === "overdue") && (
                            <button
                              onClick={() => openActionForm(request.id, "return")}
                              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 text-xs transition shadow-sm hover:shadow-md cursor-pointer text-center active:scale-98 flex items-center justify-center gap-1.5"
                            >
                              <Package className="w-4 h-4" /> ยืนยันรับคืนอุปกรณ์กลับเข้าคลัง {request.status.toLowerCase() === "overdue" && "(เกินกำหนด)"}
                            </button>
                          )}

                          {request.status.toLowerCase() === "return_pending" && (
                            <div className="space-y-2">
                              <div className="rounded-xl bg-teal-50 border border-teal-200 p-2.5 text-center text-xs font-bold text-teal-700 flex items-center justify-center gap-1.5">
                                <RefreshCw className="w-4 h-4" /> สมาชิกได้ยื่นคำขอคืนอุปกรณ์แล้ว
                              </div>
                              <button
                                onClick={() => openActionForm(request.id, "return")}
                                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 text-xs transition shadow-sm hover:shadow-md cursor-pointer text-center active:scale-98 flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" /> ตรวจรับและยืนยันรับคืนอุปกรณ์เข้าคลัง
                              </button>
                            </div>
                          )}

                          {["rejected", "returned"].includes(request.status.toLowerCase()) && (
                            <div className="text-center rounded-xl bg-gray-100 border border-gray-200/50 p-2.5 text-xs text-gray-500 font-bold flex items-center justify-center gap-1.5">
                              {request.status.toLowerCase() === "returned" && <><CheckCircle2 className="w-4 h-4" /> ทำรายการคืนเข้าสต็อกเรียบร้อยแล้ว</>}
                              {request.status.toLowerCase() === "rejected" && <><XCircle className="w-4 h-4" /> ปฏิเสธคำขอนี้แล้ว</>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer stats metadata */}
                    <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between text-[11px] font-bold text-gray-400">
                      <div>
                        สร้างเมื่อ: {formatDateString(request.createdAt || request.borrowDate)}
                        {request.updatedAt && request.updatedAt !== request.createdAt && (
                          <span className="ml-3">อัปเดตล่าสุด: {formatDateString(request.updatedAt)}</span>
                        )}
                      </div>

                      {request.returnDate && (
                        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">
                          <Package className="w-4 h-4" /> คืนสิ่งของเมื่อ:
                          <span className="font-bold">{formatDateString(request.returnDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

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
