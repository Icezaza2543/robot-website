// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import NavbarAuth from "./NavbarAuth";

const navLinks = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/about", label: "เกี่ยวกับ" },
  { href: "/equipment", label: "ยืมอุปกรณ์" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">

        {/* Logo + Club Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group flex-shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          <Image
            src="/Robot.png"
            alt="NU Robot Club Logo"
            width={40}
            height={40}
            className="rounded-lg object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-base font-black text-gray-900 tracking-tight">
              NU <span className="text-orange-500">Robot</span> Club
            </span>
            <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
              Naresuan University
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-600 hover:text-orange-500 hover:bg-orange-50/60"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-orange-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Auth + Hamburger */}
        <div className="flex items-center gap-3">
          <NavbarAuth />

          {/* Hamburger (mobile only) */}
          <button
            id="navbar-hamburger"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg border border-gray-200 bg-white shadow-sm hover:border-orange-300 transition-all duration-200 gap-1.5 cursor-pointer"
            aria-label="เปิด/ปิดเมนู"
          >
            <span
              className={`block h-0.5 w-5 bg-gray-700 rounded-full transition-all duration-300 origin-center ${
                mobileOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-gray-700 rounded-full transition-all duration-300 ${
                mobileOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-gray-700 rounded-full transition-all duration-300 origin-center ${
                mobileOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 pb-4 pt-2 border-t border-gray-100">
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-600 hover:text-orange-500 hover:bg-orange-50/60"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}