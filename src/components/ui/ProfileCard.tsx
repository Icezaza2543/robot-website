"use client";

import React, { useState } from "react";
import { Fingerprint } from "lucide-react";
import QRCode from "react-qr-code";

export type UserRank = "Member" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export interface ProfileCardProps {
  user: {
    name: string;
    studentId: string;
    image?: string;
    role?: string;
    points?: number;
    rank: UserRank;
    issueDate?: string;   // e.g. "2024-01-01"
    expiryDate?: string;  // e.g. "2026-12-31"
  };
  className?: string;
  /** Pass a ref to capture only the front side for sharing */
  frontRef?: React.RefObject<HTMLDivElement | null>;
}

const rankConfig: Record<UserRank, { color: string; label: string }> = {
  Member: { color: "#64748b", label: "MEMBER" },
  Bronze: { color: "#b45309", label: "BRONZE" },
  Silver: { color: "#64748b", label: "SILVER" },
  Gold: { color: "#ca8a04", label: "GOLD" },
  Platinum: { color: "#0d9488", label: "PLATINUM" },
  Diamond: { color: "#4f46e5", label: "DIAMOND" },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

export function ProfileCard({ user, className = "", frontRef }: ProfileCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const config = rankConfig[user.rank] || rankConfig.Member;

  const nameParts = user.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Default dates if not provided
  const issueDate = user.issueDate || new Date().toISOString().split("T")[0];
  const expiryDate = user.expiryDate || (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  })();

  return (
    <div
      className={`w-[300px] h-[480px] perspective-[1000px] select-none ${className}`}
      style={{ perspective: "1000px", WebkitPerspective: "1000px" }}
      onDoubleClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="w-full h-full relative transition-transform duration-700 cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >

        {/* ================= FRONT SIDE ================= */}
        <div
          ref={frontRef}
          className="absolute inset-0 bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden border-2 border-gray-100"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg) translateZ(1px)",
            WebkitTransform: "rotateY(0deg) translateZ(1px)"
          }}
        >
          {/* Badge Clip Hole */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-gray-200/80 rounded-full border border-gray-300/50 shadow-inner z-20" />

          {/* Top Header */}
          <div className="px-6 pt-12 pb-4 flex justify-between items-start z-10 relative">
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest text-white px-2 py-0.5 bg-black w-max mb-0.5">ROBOT</span>
              <span
                className="text-[11px] font-black tracking-widest text-white px-2 py-0.5 w-max"
                style={{ backgroundColor: config.color }}
              >CLUB</span>
            </div>
            <img src="/Robot.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
          </div>

          {/* Photo Section — fixed aspect ratio container, image fills without stretching */}
          {/* Photo Section wrapper — relative so badge can overflow */}
          <div className="px-6 relative z-10">
            {/* Photo container — overflow hidden for background-image crop */}
            <div
              className="w-full rounded-xl overflow-hidden relative border-4 border-white shadow-sm"
              style={{ backgroundColor: config.color, aspectRatio: "4/3" }}
            >
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {user.image ? (
                <div
                  className="absolute inset-0 z-10"
                  style={{
                    backgroundImage: `url('${user.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 z-10">
                  <span className="text-6xl font-black opacity-50">{firstName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Level Badge — outside overflow-hidden, floats over the photo corner */}
            <div className="absolute bottom-0 right-3 translate-y-1/2 w-14 h-14 bg-white rounded-full z-20 shadow-lg flex items-center justify-center p-1 border-2 border-gray-100">
              <div
                className="w-full h-full rounded-full border-2 flex flex-col items-center justify-center text-center leading-none"
                style={{ borderColor: config.color, color: config.color }}
              >
                <span className="text-[8px] font-black tracking-wider">LEVEL</span>
                <span className="text-[7px] font-black">{config.label}</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="px-6 flex-1 flex flex-col mt-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-gray-800 leading-none uppercase tracking-tight truncate">{firstName}</h3>
                <h3 className="text-xl font-black text-gray-900 leading-none uppercase tracking-tighter mt-1 truncate">{lastName}</h3>
                <div
                  className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: config.color }}
                >
                  {user.role || "Member"}
                </div>
              </div>
              <div className="flex flex-col items-end pb-1 shrink-0">
                <span className="text-[10px] font-black text-gray-400">RANK</span>
                <span className="text-3xl font-black leading-none tracking-tighter" style={{ color: config.color }}>
                  {user.rank === "Member" ? "00" : user.rank.charAt(0)}
                </span>
              </div>
            </div>

            {/* Footer Barcode */}
            <div className="mt-auto mb-6 bg-gray-900 text-white rounded-xl p-3 flex justify-between items-center shadow-md">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">AUTHORIZED ACCESS</span>
                <span className="text-[10px] font-bold uppercase mt-1 leading-none">ROBOT-{user.studentId}</span>
              </div>
              <div className="flex gap-[2px] h-6 items-center opacity-80">
                {[1, 3, 2, 1, 4, 1, 2, 2, 3, 1, 1, 2, 3, 1, 2].map((w, i) => (
                  <div key={i} className="bg-white h-full" style={{ width: `${w}px` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Double Click Hint */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/60 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm pointer-events-none z-50">
            Double Click to Flip
          </div>
        </div>

        {/* ================= BACK SIDE ================= */}
        <div
          className="absolute inset-0 bg-gray-50 rounded-3xl shadow-xl flex flex-col items-center border-2 border-gray-200 overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg) translateZ(1px)",
            WebkitTransform: "rotateY(180deg) translateZ(1px)"
          }}
        >
          {/* Top color bar */}
          <div className="w-full h-2 shrink-0" style={{ backgroundColor: config.color }} />

          {/* Badge Clip Hole */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-gray-200/80 rounded-full border border-gray-300/50 shadow-inner z-20" />

          <div className="flex-1 flex flex-col items-center justify-center w-full px-8 mt-8">
            <Fingerprint className="w-10 h-10 mb-4" style={{ color: config.color }} />
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Scan for Identity</h4>

            {/* QR Code */}
            {/* Real scannable QR Code */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 mb-5">
              <QRCode
                value={`ROBOT-CLUB:${user.studentId}`}
                size={112}
                bgColor="#ffffff"
                fgColor="#111111"
                level="M"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>

            {/* Student ID */}
            <div className="text-center w-full mb-2 ">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Student ID</p>
              <p className="font-mono text-xl font-bold tracking-[0.2em] text-gray-900 bg-white border border-gray-200 py-2 rounded-xl shadow-sm">
                {user.studentId}
              </p>
            </div>

            {/* Issue & Expiry Dates */}
            {/* <div className="w-full grid grid-cols-2 gap-3 mb-2">
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">วันที่ออกบัตร</p>
                <p className="text-[11px] font-black text-gray-800 leading-tight">{formatDate(issueDate)}</p>
              </div>
              <div className="rounded-xl p-3 text-center shadow-sm border-2" style={{ backgroundColor: `${config.color}15`, borderColor: `${config.color}40` }}>
                <p className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: config.color }}>วันหมดอายุ</p>
                <p className="text-[11px] font-black leading-tight" style={{ color: config.color }}>{formatDate(expiryDate)}</p>
              </div>
            </div> */}
          </div>

          <div className="w-full p-4 text-center border-t border-gray-200 bg-gray-100/50">
            <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">
              This card is property of NU Robot Club.<br />
              If found, please return to EE701.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
