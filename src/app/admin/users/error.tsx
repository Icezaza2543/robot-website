"use client";

import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Users Page Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center px-4">
      <ShieldAlert className="w-16 h-16 text-red-400 mb-2" />
      <h1 className="text-2xl font-black text-red-500">เกิดข้อผิดพลาดในการแสดงผลหน้าจัดการสมาชิก</h1>
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl max-w-2xl text-left font-mono text-sm overflow-auto">
        <p className="font-bold mb-2">รายละเอียด Error สำหรับนักพัฒนา:</p>
        <p>{error.message}</p>
        {error.stack && (
          <pre className="mt-2 text-xs text-red-500/80 whitespace-pre-wrap">{error.stack}</pre>
        )}
      </div>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500 active:scale-95"
      >
        ลองโหลดใหม่อีกครั้ง
      </button>
    </div>
  );
}
