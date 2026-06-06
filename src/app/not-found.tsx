"use client";

import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="relative inline-block mb-8">
          <div className="text-[120px] font-black text-gray-200 leading-none select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-orange-500 text-white p-4 rounded-full shadow-xl shadow-orange-500/30 transform rotate-12">
              <Search className="w-10 h-10" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
          ไม่พบหน้าที่คุณค้นหา
        </h1>
        
        <p className="text-gray-500 font-medium text-base mb-10 leading-relaxed px-4">
          หน้าเว็บที่คุณพยายามเข้าถึงอาจถูกลบไปแล้ว หรือคุณอาจพิมพ์ URL ผิด กรุณาตรวจสอบอีกครั้ง
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3.5 px-6 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-orange-500/30"
          >
            <Home className="w-5 h-5" />
            กลับสู่หน้าหลัก
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-3.5 px-6 rounded-2xl font-bold transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            ย้อนกลับ
          </button>
        </div>
      </div>
    </div>
  );
}
