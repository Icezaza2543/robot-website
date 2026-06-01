"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Timer, CheckCircle2, RefreshCw, XCircle, Package, AlertTriangle, FileText, Settings, BarChart3, Plug, ClipboardList, Search, PartyPopper, Inbox, MapPin, User, Megaphone, Clock } from "lucide-react";

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
  items: string; // JSON string of items
  borrowDate: string;
  dueDate: string;
  returnDate: string;
  note: string;
  status: string;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
}

export default function BorrowHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State Management
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRequests, setExpandedRequests] = useState<{ [key: string]: boolean }>({});

  // Return request state
  const [returningRequestId, setReturningRequestId] = useState<string | null>(null);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);

  // Cancel request state
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/borrow");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error("Error loading borrow requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchRequests();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <span className="text-sm font-bold text-gray-400 animate-pulse">กำลังโหลดข้อมูลประวัติการยืม...</span>
        </div>
      </div>
    );
  }

  // Client side fallback safety (Middleware already enforces this)
  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/borrow/history");
    return null;
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
          bg: "bg-amber-50 border-amber-200/80 text-amber-700",
          dot: "bg-amber-500",
          text: "รอดำเนินการอนุมัติ",
          icon: <Timer className="w-3.5 h-3.5" />,
        };
      case "approved":
        return {
          bg: "bg-emerald-50 border-emerald-200/80 text-emerald-700",
          dot: "bg-emerald-500",
          text: "อนุมัติแล้ว (กำลังยืม)",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "return_pending":
        return {
          bg: "bg-teal-50 border-teal-200/80 text-teal-700",
          dot: "bg-teal-500",
          text: "รอแอดมินยืนยันรับคืน",
          icon: <RefreshCw className="w-3.5 h-3.5" />,
        };
      case "rejected":
        return {
          bg: "bg-rose-50 border-rose-200/80 text-rose-700",
          dot: "bg-rose-500",
          text: "ปฏิเสธการขอยืม",
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
      case "returned":
        return {
          bg: "bg-blue-50 border-blue-200/80 text-blue-700",
          dot: "bg-blue-500",
          text: "ส่งคืนแล้ว (เสร็จสิ้น)",
          icon: <Package className="w-3.5 h-3.5" />,
        };
      case "overdue":
        return {
          bg: "bg-purple-50 border-purple-200/80 text-purple-700",
          dot: "bg-purple-500",
          text: "เกินกำหนดส่งคืน",
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200/80 text-gray-700",
          dot: "bg-gray-500",
          text: statusName,
          icon: <FileText className="w-3.5 h-3.5" />,
        };
    }
  };

  // Compute Quick Stats
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status.toLowerCase() === "pending").length;
  const approvedCount = requests.filter((r) => r.status.toLowerCase() === "approved").length;
  const overdueCount = requests.filter((r) => r.status.toLowerCase() === "overdue").length;

  // Formatting utility for dates (e.g. YYYY-MM-DD -> DD/MM/YYYY)
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

  // Helper to calculate remaining or overdue time from due date
  const getRemainingOrOverdueTime = (dueDateStr: string, statusStr: string) => {
    if (!dueDateStr) return null;
    const lowerStatus = statusStr.toLowerCase();
    
    if (lowerStatus !== "approved" && lowerStatus !== "overdue") {
      return null;
    }

    try {
      const parts = dueDateStr.split(" ");
      const ymd = parts[0].split("-");
      const dueTime = new Date(Number(ymd[0]), Number(ymd[1]) - 1, Number(ymd[2]));
      
      if (parts[1]) {
        const hm = parts[1].split(":");
        dueTime.setHours(Number(hm[0] || 0), Number(hm[1] || 0), 0, 0);
      } else {
        dueTime.setHours(23, 59, 59, 999);
      }

      const now = new Date();
      const diffMs = dueTime.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffMs > 0) {
        return {
          isOverdue: false,
          days: diffDays,
          text: diffDays === 1 ? "เหลือเวลาอีก 1 วัน" : `เหลือเวลาอีก ${diffDays} วัน`,
          badgeStyle: "bg-emerald-50 border-emerald-200 text-emerald-700",
          buttonLabel: "คืนอุปกรณ์ก่อนกำหนด",
        };
      } else {
        const overdueDays = Math.abs(diffDays);
        return {
          isOverdue: true,
          days: overdueDays,
          text: overdueDays === 0 ? "เกินกำหนดวันนี้" : `เกินกำหนดมา ${overdueDays} วัน`,
          badgeStyle: "bg-rose-50 border-rose-200 text-rose-700 animate-pulse",
          buttonLabel: "ส่งคำขอคืน (เกินกำหนด)",
        };
      }
    } catch (e) {
      console.error("Error parsing due date", e);
      return null;
    }
  };

  // Filtering
  const filteredRequests = requests.filter((request) => {
    // Check status filter
    if (statusFilter !== "All" && request.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    // Check search query (Req ID, borrowerName, or item name)
    const matchesSearch =
      request.id.toLowerCase().includes(search.toLowerCase()) ||
      request.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
      request.items.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-8 md:p-10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">
            <BarChart3 className="w-4 h-4" />
            <span>NU Robot Club Smart Service</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">
            ประวัติการยืมสิ่งของและอุปกรณ์
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-1 max-w-xl leading-relaxed">
            ติดตามสถานะคำขอยืมอุปกรณ์คอมพิวเตอร์ เซนเซอร์ และ IoT บอร์ดของคุณได้แบบเรียลไทม์ ตรวจสอบวันกำหนดคืน และรับบันทึกข้อความจากผู้ดูแลระบบ
          </p>
        </div>

        <Link
          href="/equipment"
          className="rounded-2xl bg-gray-900 hover:bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-gray-900/10 transition-all duration-300 hover:shadow-orange-500/20 active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Plug className="w-4 h-4" /> ยืมอุปกรณ์เพิ่มเติม
        </Link>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Stat: Total */}
        <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-400">คำขอทั้งหมด</span>
            <ClipboardList className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{totalCount}</span>
            <span className="text-xs font-bold text-gray-400">รายการ</span>
          </div>
        </div>

        {/* Stat: Pending */}
        <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-400">รอดำเนินการ</span>
            <Timer className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{pendingCount}</span>
            <span className="text-xs font-bold text-amber-500">รออนุมัติ</span>
          </div>
        </div>

        {/* Stat: Active Borrows */}
        <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-400">กำลังยืมอยู่</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{approvedCount}</span>
            <span className="text-xs font-bold text-emerald-500 font-semibold">ถือครอง</span>
          </div>
        </div>

        {/* Stat: Overdue */}
        <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-400">เกินกำหนดส่ง</span>
            <AlertTriangle className="w-5 h-5 text-purple-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${overdueCount > 0 ? "text-purple-600 animate-pulse" : "text-gray-900"}`}>
              {overdueCount}
            </span>
            <span className="text-xs font-bold text-purple-500">ต้องส่งคืน</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-gray-100 pb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="ค้นหาด้วยรหัสคำขอ ผู้รับผิดชอบ หรืออุปกรณ์..."
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

      {/* Return Request Confirmation Modal */}
      {returningRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-teal-700 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" /> ยืนยันส่งคำขอคืนอุปกรณ์
                <span className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded-md text-gray-600">
                  {returningRequestId}
                </span>
              </h3>
              <button
                onClick={() => {
                  setReturningRequestId(null);
                  setReturnError(null);
                  setReturnSuccess(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="text-xs leading-relaxed p-3.5 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 font-medium">
              <p>เมื่อกดยืนยัน สถานะของใบยืมจะเปลี่ยนเป็น <strong>&quot;รอแอดมินยืนยันรับคืน&quot;</strong> ผู้ดูแลระบบจะดำเนินการตรวจสอบอุปกรณ์ และยืนยันรับคืนเข้าคลัง</p>
            </div>

            {returnError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 leading-relaxed animate-pulse flex items-start gap-1.5">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{returnError}</span>
              </div>
            )}

            {returnSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 leading-relaxed flex items-start gap-1.5">
                <PartyPopper className="w-4 h-4 shrink-0 mt-0.5" /> <span>{returnSuccess}</span>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setReturningRequestId(null);
                  setReturnError(null);
                  setReturnSuccess(null);
                }}
                className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2.5 text-xs font-bold text-gray-500 transition active:scale-95 cursor-pointer"
                disabled={isSubmittingReturn}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isSubmittingReturn}
                onClick={async () => {
                  try {
                    setIsSubmittingReturn(true);
                    setReturnError(null);

                    const res = await fetch("/api/borrow", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: returningRequestId }),
                    });

                    const result = await res.json();

                    if (!res.ok) {
                      throw new Error(result.error || "เกิดข้อผิดพลาดในการส่งคำขอคืนอุปกรณ์");
                    }

                    setReturnSuccess("ส่งคำขอคืนอุปกรณ์สำเร็จ! รอผู้ดูแลระบบยืนยันรับคืน");
                    await fetchRequests();

                    setTimeout(() => {
                      setReturningRequestId(null);
                      setReturnSuccess(null);
                    }, 1500);
                  } catch (err: any) {
                    setReturnError(err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
                  } finally {
                    setIsSubmittingReturn(false);
                  }
                }}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {isSubmittingReturn ? (
                  <>
                    <span className="inline-block animate-spin h-3.5 w-3.5 border-t-2 border-b-2 border-white rounded-full"></span>
                    กำลังดำเนินการ...
                  </>
                ) : (
                  <><RefreshCw className="w-4 h-4" /> ยืนยันส่งคำขอคืน</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Request Confirmation Modal */}
      {cancellingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-rose-700 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> ยืนยันยกเลิกคำขอยืมอุปกรณ์
                <span className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded-md text-gray-600">
                  {cancellingRequestId}
                </span>
              </h3>
              <button
                onClick={() => {
                  setCancellingRequestId(null);
                  setCancelError(null);
                  setCancelSuccess(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="text-xs leading-relaxed p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 font-medium">
              <p>คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอยืมอุปกรณ์ใบนี้? การยกเลิกจะมีผลทันทีและไม่สามารถเปลี่ยนกลับได้</p>
            </div>

            {cancelError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 leading-relaxed animate-pulse flex items-start gap-1.5">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{cancelError}</span>
              </div>
            )}

            {cancelSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 leading-relaxed flex items-start gap-1.5">
                <PartyPopper className="w-4 h-4 shrink-0 mt-0.5" /> <span>{cancelSuccess}</span>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setCancellingRequestId(null);
                  setCancelError(null);
                  setCancelSuccess(null);
                }}
                className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-2.5 text-xs font-bold text-gray-500 transition active:scale-95 cursor-pointer"
                disabled={isSubmittingCancel}
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={async () => {
                  try {
                    setIsSubmittingCancel(true);
                    setCancelError(null);

                    const res = await fetch("/api/borrow", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: cancellingRequestId, action: "cancel" }),
                    });

                    const result = await res.json();

                    if (!res.ok) {
                      throw new Error(result.error || "เกิดข้อผิดพลาดในการยกเลิกคำขอยืม");
                    }

                    setCancelSuccess("ยกเลิกคำขอยืมสำเร็จแล้ว!");
                    await fetchRequests();

                    setTimeout(() => {
                      setCancellingRequestId(null);
                      setCancelSuccess(null);
                    }, 1500);
                  } catch (err: any) {
                    setCancelError(err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
                  } finally {
                    setIsSubmittingCancel(false);
                  }
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {isSubmittingCancel ? (
                  <>
                    <span className="inline-block animate-spin h-3.5 w-3.5 border-t-2 border-b-2 border-white rounded-full"></span>
                    กำลังยกเลิก...
                  </>
                ) : (
                  <><XCircle className="w-4 h-4" /> ยืนยันยกเลิกคำขอ</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <span className="text-sm font-bold text-gray-400 animate-pulse">กำลังดึงข้อมูลใบคำขอยืมจาก Google Sheets...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center animate-in fade-in duration-300 flex flex-col items-center">
          <Inbox className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mt-4">ไม่พบประวัติการยืมอุปกรณ์</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
            {search || statusFilter !== "All"
              ? "ไม่พบข้อมูลรายการขอยืมที่ตรงกับเงื่อนไขการค้นหาหรือตัวกรองที่ระบุ ลองล้างคำค้นหาหรือตัวกรอง"
              : "คุณยังไม่เคยส่งคำขออนุมัติยืมสิ่งของในระบบ เลือกเมนูยืมอุปกรณ์เพื่อสร้างคำขอแรกของคุณได้ทันที"}
          </p>
          {(search || statusFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="mt-6 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 px-5 py-2.5 text-xs font-bold text-orange-600 shadow-sm transition active:scale-95 cursor-pointer"
            >
              ล้างการกรองทั้งหมด
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-5">
          {filteredRequests.map((request) => {
            const statusDetail = getStatusDetails(request.status);
            const isExpanded = !!expandedRequests[request.id];
            const timeInfo = getRemainingOrOverdueTime(request.dueDate, request.status);
            
            // Safe JSON parse for requested items
            let parsedItems: RequestItem[] = [];
            try {
              parsedItems = JSON.parse(request.items);
            } catch (e) {
              console.error("JSON parsing error for request items", e);
            }

            return (
              <div
                key={request.id}
                className={`rounded-3xl border transition-all duration-300 bg-white overflow-hidden shadow-sm hover:shadow-md ${
                  isExpanded ? "border-orange-200 ring-1 ring-orange-200/50" : "border-gray-200/80"
                }`}
              >
                {/* Request Card Header (Summary) */}
                <div
                  onClick={() => toggleExpand(request.id)}
                  className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none group transition-colors hover:bg-gray-50/50"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-base font-black text-gray-900 bg-gray-100 border border-gray-200/60 px-3 py-1.5 rounded-xl">
                      {request.id}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-400">ผู้รับผิดชอบการยืม</span>
                      <span className="text-sm font-black text-gray-700 leading-snug">
                        {request.borrowerName}
                      </span>
                    </div>
                  </div>

                  {/* Dates & Status */}
                  <div className="grid grid-cols-2 md:flex md:items-center gap-4 lg:gap-8 flex-wrap">
                    {/* Borrow Date */}
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">วันที่ยืม</span>
                      <span className="text-sm font-bold text-gray-800">
                        {formatDateString(request.borrowDate)}
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">กำหนดส่งคืน</span>
                      <span className={`text-sm font-black ${
                        request.status.toLowerCase() === "overdue" ? "text-purple-600" : "text-gray-800"
                      }`}>
                        {formatDateString(request.dueDate)}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center col-span-2 md:col-auto">
                      <div className={`flex items-center gap-1.5 border rounded-full px-3.5 py-1.5 text-xs font-black tracking-wide ${statusDetail.bg}`}>
                        <span className={`h-2 w-2 rounded-full ${statusDetail.dot}`} />
                        <span>{statusDetail.icon} {statusDetail.text}</span>
                      </div>
                    </div>

                    {/* Time Countdown Badge */}
                    {timeInfo && (
                      <div className="flex items-center col-span-2 md:col-auto">
                        <div className={`flex items-center gap-1 border rounded-full px-3 py-1.5 text-xs font-black ${timeInfo.badgeStyle}`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{timeInfo.text}</span>
                        </div>
                      </div>
                    )}

                    {/* Quick Return Action Button */}
                    {(request.status.toLowerCase() === "approved" || request.status.toLowerCase() === "overdue") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent accordion expanding
                          setReturningRequestId(request.id);
                          setReturnError(null);
                          setReturnSuccess(null);
                        }}
                        className="col-span-2 md:col-auto rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-3.5 text-xs transition shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <><RefreshCw className="w-4 h-4" /> {timeInfo?.buttonLabel || "คืนอุปกรณ์"}</>
                      </button>
                    )}

                    {/* Quick Cancel Action Button for pending requests */}
                    {request.status.toLowerCase() === "pending" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent accordion expanding
                          setCancellingRequestId(request.id);
                          setCancelError(null);
                          setCancelSuccess(null);
                        }}
                        className="col-span-2 md:col-auto rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold py-2 px-3.5 text-xs transition shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> ยกเลิกคำขอ
                      </button>
                    )}
                  </div>

                  {/* Expand Chevron Icon */}
                  <div className="hidden md:flex items-center justify-center h-10 w-10 rounded-xl bg-gray-50 group-hover:bg-orange-50 group-hover:text-orange-500 text-gray-400 transition-colors">
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

                {/* Request Card Expandable Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/30 p-6 sm:p-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                      {/* Left: Items List */}
                      <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" /> รายการสิ่งของที่ยืม ({parsedItems.length} ชิ้น)
                        </h4>

                        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
                          <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID สินค้า</th>
                                <th scope="col" className="px-4 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ชื่ออุปกรณ์</th>
                                <th scope="col" className="px-4 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">หมวดหมู่</th>
                                <th scope="col" className="px-4 py-3.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">จำนวน</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {parsedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                                    <span className="font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                      {item.id}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <div className="font-bold text-gray-800">{item.name}</div>
                                    <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                      <MapPin className="w-3 h-3 shrink-0" /><span>ที่เก็บ:</span>
                                      <span className="font-semibold text-gray-500">{item.location || "ไม่ได้ระบุ"}</span>
                                    </div>
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-xs font-bold text-gray-500">
                                    {item.category}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-black text-gray-800">
                                    {item.quantity}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: Notes, Details, and Admin Feedback */}
                      <div className="space-y-5">
                        {/* Borrower Details */}
                        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm space-y-3">
                          <h4 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
                            <User className="w-4 h-4" /> ข้อมูลผู้ทำรายการ
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="font-bold text-gray-400">ชื่อสมาชิกยื่นเรื่อง:</span>
                              <span className="font-semibold text-gray-700">{request.userName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold text-gray-400">อีเมลลงทะเบียน:</span>
                              <span className="font-semibold text-gray-700">{request.userEmail}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold text-gray-400">เบอร์ติดต่อผู้ยืม:</span>
                              <span className="font-bold text-orange-600">{request.borrowerPhone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Note/Reason of Borrow */}
                        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm space-y-2">
                          <h4 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                            <FileText className="w-4 h-4" /> จุดประสงค์การขอยืม
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-wrap font-medium">
                            {request.note || "ไม่มีบันทึกจุดประสงค์เพิ่มเติม"}
                          </p>
                        </div>

                        {/* Admin Action/Note */}
                        {(request.adminNote || request.status.toLowerCase() === "rejected") && (
                          <div className={`rounded-2xl border p-5 shadow-sm space-y-2 ${
                            request.status.toLowerCase() === "rejected"
                              ? "bg-rose-50/50 border-rose-200/80 text-rose-800"
                              : "bg-emerald-50/30 border-emerald-200/80 text-emerald-800"
                          }`}>
                            <h4 className="text-sm font-black flex items-center gap-1.5">
                              <Megaphone className="w-4 h-4" /> บันทึกจากผู้ดูแลระบบ
                            </h4>
                            <p className="text-xs leading-relaxed bg-white p-3 rounded-xl border border-gray-100 whitespace-pre-wrap font-medium text-gray-700">
                              {request.adminNote || "กรุณาติดต่อผู้ดูแลระบบชมรมเพื่อตรวจสอบเหตุผลในการดำเนินการ"}
                            </p>
                          </div>
                        )}

                        {/* Member Return Action Button */}
                        {(request.status.toLowerCase() === "approved" || request.status.toLowerCase() === "overdue") && (
                          <div className="space-y-2 mt-2">
                            {timeInfo && (
                                <div className={`p-3 rounded-xl border text-xs font-bold text-center flex items-center justify-center gap-1.5 ${timeInfo.badgeStyle}`}>
                                  <Clock className="w-3.5 h-3.5" /> {timeInfo.text}
                                </div>
                            )}
                            <button
                              onClick={() => {
                                setReturningRequestId(request.id);
                                setReturnError(null);
                                setReturnSuccess(null);
                              }}
                              className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 text-xs transition shadow-sm hover:shadow-md cursor-pointer text-center active:scale-98 flex items-center justify-center gap-1.5"
                            >
                              <><RefreshCw className="w-4 h-4" /> {timeInfo?.buttonLabel || "ส่งคำขอคืนอุปกรณ์ให้แอดมินตรวจรับ"}</>
                            </button>
                          </div>
                        )}

                        {/* Member Cancel Action Button in detail panel */}
                        {request.status.toLowerCase() === "pending" && (
                          <div className="space-y-2 mt-2">
                            <button
                              onClick={() => {
                                setCancellingRequestId(request.id);
                                setCancelError(null);
                                setCancelSuccess(null);
                              }}
                              className="w-full rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold py-3 px-4 text-xs transition shadow-sm hover:shadow-md cursor-pointer text-center active:scale-98 flex items-center justify-center gap-1.5"
                            >
                              <XCircle className="w-4 h-4" /> ยกเลิกการส่งคำขอยืมนี้
                            </button>
                          </div>
                        )}

                        {request.status.toLowerCase() === "return_pending" && (
                          <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 text-center text-xs font-bold text-teal-700 mt-2 flex items-center justify-center gap-1.5">
                            <RefreshCw className="w-4 h-4" /> ส่งคำขอคืนแล้ว กำลังรอผู้ดูแลระบบตรวจรับของคืนเข้าคลัง...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Section of details */}
                    <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between text-xs font-semibold text-gray-400">
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
        </div>
      )}
    </div>
  );
}
