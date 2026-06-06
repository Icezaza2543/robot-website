"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
        
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
          อุ๊ปส์! เกิดข้อผิดพลาดบางอย่าง
        </h1>
        
        <p className="text-gray-500 font-medium text-sm mb-8">
          ระบบพบปัญหาทางเทคนิคในขณะที่พยายามโหลดหน้านี้ กรุณาลองใหม่อีกครั้ง หรือกลับสู่หน้าหลัก
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3.5 px-6 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-orange-500/30"
          >
            <RefreshCw className="w-5 h-5" />
            ลองโหลดใหม่อีกครั้ง
          </button>
          
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 px-6 rounded-2xl font-bold transition-all active:scale-95"
          >
            <Home className="w-5 h-5" />
            กลับสู่หน้าหลัก
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-left">
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" /> รายละเอียดข้อผิดพลาด (Debug Info)
          </p>
          <div className="bg-red-50 rounded-xl p-3 border border-red-100 overflow-auto max-h-24">
            <code className="text-xs text-red-600 break-words font-mono">
              {error.message || "Unknown error occurred"}
            </code>
          </div>
          {error.digest && (
            <p className="text-[10px] text-gray-400 font-medium uppercase mt-3">
              Digest: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
