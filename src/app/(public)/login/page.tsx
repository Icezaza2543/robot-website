"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import GoogleLoginButton from "@/components/auth/google-login-button";

function LoginCard() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Decorative layout ambient blur behind card */}
      <div className="absolute top-1/3 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-100/40 blur-3xl"></div>

      {/* Main Premium Login Card */}
      <div className="w-full max-w-md rounded-3xl border border-gray-200/60 bg-white p-8 md:p-10 shadow-xl shadow-gray-900/5 flex flex-col items-center">

        {/* Brand/Logo Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative overflow-hidden rounded-2xl bg-gray-50 p-2 shadow-sm border border-gray-100 mb-5">
            <Image
              src="/Robot.png"
              alt="NU Robot Club Logo"
              width={80}
              height={80}
              className="rounded-xl object-contain"
            />
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">
            NU <span className="text-orange-500">Robot</span> Club
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            Faculty of Engineering  <br /> Naresuan University
          </p>
        </div>

        {/* Welcome Text */}
        <div className="w-full mt-8 text-center">
          <h3 className="text-xl font-bold text-gray-800">
            เข้าสู่ระบบ
          </h3>
          <p className="text-xs md:text-sm text-gray-400 font-semibold mt-2 leading-relaxed">
            ลงชื่อเข้าใช้งานด้วยบัญชี <span className="text-orange-500 font-bold">Google</span> เพื่อยืมอุปกรณ์อิเล็กทรอนิกส์และไอโอที
          </p>
        </div>

        {/* Auth Buttons Container */}
        <div className="w-full mt-8 flex flex-col gap-4">

          {/* Reusable Google Sign-In Button */}
          <GoogleLoginButton callbackUrl={callbackUrl} />

          {/* Secure Hint */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-semibold mt-2">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>ระบบนี้ใช้สำหรับสมาชิกชมรมและผู้ที่ต้องการยืมอุปกรณ์เท่านั้น</span>
          </div>

        </div>

        {/* Footer Link / Navigation */}
        <div className="mt-8 border-t border-gray-100 pt-6 w-full text-center">
          <Link
            href="/"
            className="text-sm font-bold text-gray-400 transition hover:text-orange-500 flex items-center justify-center gap-1"
          >
            <span>&larr;</span> กลับสู่หน้าหลักเว็บบล็อก
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    }>
      <LoginCard />
    </Suspense>
  );
}
