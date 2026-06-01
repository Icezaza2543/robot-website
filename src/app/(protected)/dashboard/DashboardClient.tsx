"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
          <h2 className="text-lg font-medium text-gray-900">ประวัติการขอยืมล่าสุด</h2>
        </div>
        
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">คุณยังไม่มีประวัติการยืมอุปกรณ์</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map(req => (
              <RequestItem 
                key={req.id} 
                request={req} 
                onReturn={() => handleReturn(req.id)}
                isReturning={returningId === req.id}
              />
            ))}
          </div>
        )}
      </div>
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

function RequestItem({ request, onReturn, isReturning }: { request: BorrowRequest, onReturn: () => void, isReturning: boolean }) {
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
    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-gray-50">
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
      <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
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
