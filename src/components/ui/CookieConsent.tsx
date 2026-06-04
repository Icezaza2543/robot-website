"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookie_consent");
    if (!hasConsented) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setShow(false);
  };

  const handleDecline = () => {
    // We can just hide it, but maybe save a state so we don't bother them for a session
    sessionStorage.setItem("cookie_consent_declined", "true");
    setShow(false);
  };

  if (!show) return null;

  // If they declined in this session, don't show again until next session
  if (typeof window !== "undefined" && sessionStorage.getItem("cookie_consent_declined")) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:bottom-6 md:left-6 md:right-auto md:w-[400px]">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 relative overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-500">
        <button 
          onClick={handleDecline}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex gap-4">
          <div className="mt-1">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Cookie className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-gray-900 mb-1">เราใช้คุกกี้ 🍪</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed pr-4">
              เว็บไซต์ของเรามีการใช้งานคุกกี้เพื่อมอบประสบการณ์การใช้งานที่ดีที่สุดให้กับคุณ และเพื่อนำไปปรับปรุงเว็บไซต์ต่อไป 
              <Link href="/privacy" className="text-orange-500 hover:underline ml-1 font-bold">
                อ่านนโยบายความเป็นส่วนตัว
              </Link>
            </p>
            <div className="flex gap-2">
              <button 
                onClick={handleAccept}
                className="flex-1 bg-gray-900 hover:bg-orange-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm active:scale-95"
              >
                ยอมรับคุกกี้
              </button>
              <button 
                onClick={handleDecline}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2.5 rounded-xl transition active:scale-95"
              >
                ปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
