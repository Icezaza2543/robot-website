"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";

type BorrowRequest = {
  id: string;
  items: string; // JSON string
  status: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string;
};

export default function DashboardClient() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/borrow");
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลประวัติการยืมได้");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id: string) => {
    if (!confirm("คุณต้องการแจ้งคืนอุปกรณ์ในรายการนี้ใช่หรือไม่?")) return;
    
    setReturningId(id);
    try {
      const res = await fetch("/api/borrow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "return" }),
      });
      
      if (!res.ok) throw new Error("Return request failed");
      
      // Refresh list
      await fetchRequests();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการแจ้งคืน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setReturningId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("คุณต้องการยกเลิกคำขอยืมนี้ใช่หรือไม่?")) return;
    
    setCancelingId(id);
    try {
      const res = await fetch("/api/borrow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "cancel" }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Cancel request failed");
      }
      
      // Refresh list
      await fetchRequests();
      setSelectedRequest(null);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการยกเลิก: ${err.message}`);
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded border border-gray-100 h-32"></div>
          ))}
        </div>
        <div className="bg-white p-6 rounded border border-gray-100 h-64"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded text-sm">{error}</div>;
  }

  const activeBorrows = requests.filter(r => r.status === "approved").length;
  const pendingRequests = requests.filter(r => r.status === "pending").length;
  const overdueRequests = requests.filter(r => r.status === "overdue").length;

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="กำลังยืมอยู่" value={activeBorrows} />
        <StatCard title="รออนุมัติ" value={pendingRequests} />
        <StatCard 
          title="เกินกำหนด" 
          value={overdueRequests} 
          isWarning={overdueRequests > 0} 
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Link 
          href="/equipment"
          className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-[#f97316] hover:bg-[#ea580c] transition-colors rounded"
        >
          ยืมอุปกรณ์ใหม่
        </Link>
      </div>

      {/* History List */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ประวัติการยืมอุปกรณ์</h2>
        </div>
        
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            คุณยังไม่มีประวัติการยืมอุปกรณ์
            <div className="mt-4">
              <Link href="/equipment" className="text-orange-500 hover:underline">ยืมอุปกรณ์เลย</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {requests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(req => (
                <RequestItem 
                  key={req.id} 
                  request={req} 
                  onReturn={(e) => { e.stopPropagation(); handleReturn(req.id); }}
                  onCancel={(e) => { e.stopPropagation(); handleCancel(req.id); }}
                  isReturning={returningId === req.id}
                  isCanceling={cancelingId === req.id}
                  onClick={() => setSelectedRequest(req)}
                />
              ))}
            </div>
            {Math.ceil(requests.length / ITEMS_PER_PAGE) > 1 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={Math.ceil(requests.length / ITEMS_PER_PAGE)} 
                  onPageChange={setCurrentPage} 
                />
              </div>
            )}
          </>
        )}
      </div>

      {selectedRequest && (
        <RequestDetailsModal 
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onReturn={() => handleReturn(selectedRequest.id)}
          onCancel={() => handleCancel(selectedRequest.id)}
          isReturning={returningId === selectedRequest.id}
          isCanceling={cancelingId === selectedRequest.id}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, isWarning = false }: { title: string, value: number, isWarning?: boolean }) {
  return (
    <div className="bg-white p-6 rounded border border-gray-200">
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <p className={`text-3xl font-semibold tracking-tight ${isWarning ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

function RequestItem({ 
  request, 
  onReturn, 
  onCancel,
  isReturning,
  isCanceling,
  onClick
}: { 
  request: BorrowRequest, 
  onReturn: (e: React.MouseEvent) => void, 
  onCancel: (e: React.MouseEvent) => void,
  isReturning: boolean,
  isCanceling: boolean,
  onClick: () => void
}) {
  let itemsList = [];
  try {
    itemsList = JSON.parse(request.items);
  } catch(e) {}
  
  const itemName = itemsList.length > 0 ? itemsList[0].name : "Unknown Item";
  const moreCount = itemsList.length > 1 ? ` และอีก ${itemsList.length - 1} รายการ` : "";

  const statusMap: Record<string, { label: string, colorClass: string }> = {
    pending: { label: "รออนุมัติ", colorClass: "bg-gray-100 text-gray-700" },
    approved: { label: "อนุมัติแล้ว", colorClass: "bg-green-100 text-green-700" },
    rejected: { label: "ไม่อนุมัติ", colorClass: "bg-red-100 text-red-700" },
    returned: { label: "คืนแล้ว", colorClass: "bg-blue-100 text-blue-700" },
    overdue: { label: "เกินกำหนด", colorClass: "bg-orange-100 text-orange-700" },
    return_pending: { label: "รอตรวจรับคืน", colorClass: "bg-yellow-100 text-yellow-800" }
  };

  const statusInfo = statusMap[request.status] || { label: request.status, colorClass: "bg-gray-100 text-gray-700" };

  return (
    <div 
      onClick={onClick}
      className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-gray-50 cursor-pointer"
    >
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="font-mono text-xs text-gray-500">{request.id}</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.colorClass}`}>
            {statusInfo.label}
          </span>
        </div>
        <p className="text-gray-900 font-medium">{itemName}{moreCount}</p>
        <div className="text-sm text-gray-500 mt-1 flex flex-col sm:flex-row gap-1 sm:gap-4">
          <span>ยืม: {request.borrowDate}</span>
          <span>กำหนดคืน: {request.dueDate}</span>
        </div>
      </div>
      
      {/* Actions based on status */}
      <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 flex gap-2">
        {request.status === "pending" && (
          <button 
            onClick={onCancel}
            disabled={isCanceling}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {isCanceling ? "กำลังยกเลิก..." : "ยกเลิกคำขอ"}
          </button>
        )}
        {(request.status === "approved" || request.status === "overdue") && (
          <button 
            onClick={onReturn}
            disabled={isReturning}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {isReturning ? "กำลังแจ้ง..." : "ขอคืนอุปกรณ์"}
          </button>
        )}
      </div>
    </div>
  );
}

function RequestDetailsModal({ 
  request, 
  onClose, 
  onReturn, 
  onCancel,
  isReturning,
  isCanceling
}: { 
  request: BorrowRequest, 
  onClose: () => void,
  onReturn: () => void,
  onCancel: () => void,
  isReturning: boolean,
  isCanceling: boolean
}) {
  let itemsList: any[] = [];
  try {
    itemsList = JSON.parse(request.items);
  } catch(e) {}

  const statusMap: Record<string, { label: string, colorClass: string }> = {
    pending: { label: "รออนุมัติ", colorClass: "bg-gray-100 text-gray-700" },
    approved: { label: "อนุมัติแล้ว", colorClass: "bg-green-100 text-green-700" },
    rejected: { label: "ไม่อนุมัติ / ยกเลิก", colorClass: "bg-red-100 text-red-700" },
    returned: { label: "คืนแล้ว", colorClass: "bg-blue-100 text-blue-700" },
    overdue: { label: "เกินกำหนด", colorClass: "bg-orange-100 text-orange-700" },
    return_pending: { label: "รอตรวจรับคืน", colorClass: "bg-yellow-100 text-yellow-800" }
  };
  const statusInfo = statusMap[request.status] || { label: request.status, colorClass: "bg-gray-100 text-gray-700" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-black text-gray-900">รายละเอียดใบยืม</h3>
            <p className="text-xs font-mono text-gray-500 mt-0.5">{request.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-600">สถานะ</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.colorClass}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-bold mb-1">วันที่ยืม</p>
              <p className="text-sm font-medium text-gray-900">{request.borrowDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold mb-1">กำหนดคืน</p>
              <p className="text-sm font-medium text-gray-900">{request.dueDate}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">รายการอุปกรณ์ ({itemsList.length})</p>
            <ul className="space-y-3">
              {itemsList.map((item, idx) => (
                <li key={idx} className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                  <span className="text-sm font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-700 whitespace-nowrap">
                    x {item.quantity || 1}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          {request.status === "pending" && (
            <button 
              onClick={onCancel}
              disabled={isCanceling}
              className="px-4 py-2 text-sm font-bold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {isCanceling ? "กำลังยกเลิก..." : "ยกเลิกคำขอยืม"}
            </button>
          )}
          {(request.status === "approved" || request.status === "overdue") && (
            <button 
              onClick={onReturn}
              disabled={isReturning}
              className="px-4 py-2 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-orange-500 disabled:opacity-50 transition-colors"
            >
              {isReturning ? "กำลังแจ้ง..." : "ขอแจ้งคืนอุปกรณ์"}
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
        
      </div>
    </div>
  );
}
