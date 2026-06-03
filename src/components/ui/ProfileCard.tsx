"use client";

import React, { useState } from "react";
import { QrCode, Award, Shield, Fingerprint } from "lucide-react";

export type UserRank = "Member" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export interface ProfileCardProps {
  user: {
    name: string;
    studentId: string;
    image?: string;
    role?: string;
    points?: number;
    rank: UserRank;
  };
  className?: string;
}

const rankConfig: Record<UserRank, { color: string; bgClass: string; textClass: string; borderClass: string; label: string }> = {
  Member: {
    color: "#64748b", // slate-500
    bgClass: "bg-slate-50",
    textClass: "text-slate-700",
    borderClass: "border-slate-200",
    label: "MEMBER",
  },
  Bronze: {
    color: "#b45309", // amber-700
    bgClass: "bg-amber-50",
    textClass: "text-amber-800",
    borderClass: "border-amber-200",
    label: "BRONZE",
  },
  Silver: {
    color: "#64748b", // slate-500
    bgClass: "bg-slate-50",
    textClass: "text-slate-800",
    borderClass: "border-slate-300",
    label: "SILVER",
  },
  Gold: {
    color: "#ca8a04", // yellow-600
    bgClass: "bg-yellow-50",
    textClass: "text-yellow-800",
    borderClass: "border-yellow-300",
    label: "GOLD",
  },
  Platinum: {
    color: "#0d9488", // teal-600
    bgClass: "bg-teal-50",
    textClass: "text-teal-800",
    borderClass: "border-teal-200",
    label: "PLATINUM",
  },
  Diamond: {
    color: "#4f46e5", // indigo-600
    bgClass: "bg-indigo-50",
    textClass: "text-indigo-800",
    borderClass: "border-indigo-200",
    label: "DIAMOND",
  },
};

export function ProfileCard({ user, className = "" }: ProfileCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const config = rankConfig[user.rank] || rankConfig.Member;

  // Format name for bold display (split into parts)
  const nameParts = user.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <div 
      className={`relative w-full max-w-[340px] aspect-[5/8] mx-auto select-none ${className}`}
      style={{ perspective: "1200px" }}
      onDoubleClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className="w-full h-full relative transition-transform duration-700 cursor-pointer"
        style={{ 
          transformStyle: "preserve-3d", 
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" 
        }}
      >
        
        {/* ================= FRONT SIDE ================= */}
        <div 
          className="absolute inset-0 bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden border-2 border-gray-100"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Badge Clip Hole */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-gray-200/80 rounded-full border border-gray-300/50 shadow-inner z-20"></div>

          {/* Top Header Section */}
          <div className="px-6 pt-12 pb-4 flex justify-between items-start z-10 relative">
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest text-white px-2 py-0.5 bg-black w-max mb-0.5">ROBOT</span>
              <span 
                className="text-[11px] font-black tracking-widest text-white px-2 py-0.5 w-max"
                style={{ backgroundColor: config.color }}
              >
                CLUB
              </span>
            </div>
            {user.points !== undefined && (
              <div className="text-right">
                <div className="text-2xl font-black tracking-tighter text-gray-900 leading-none">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">PTS</div>
              </div>
            )}
          </div>

          {/* Photo Section */}
          <div className="px-6 relative z-10">
            <div 
              className="w-full aspect-[4/3] rounded-xl overflow-hidden relative border-4 border-white shadow-sm"
              style={{ backgroundColor: config.color }}
            >
              {/* Subtle Grid Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" 
                style={{ 
                  backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px"
                }}
              />
              
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover object-center relative z-10"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/80 relative z-10">
                  <span className="text-6xl font-black opacity-50">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Decorative Circle (like in the ref image) */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white rounded-full z-20 shadow-md flex items-center justify-center p-1 border border-gray-100">
                <div 
                  className="w-full h-full rounded-full border-2 flex flex-col items-center justify-center text-center leading-none"
                  style={{ borderColor: config.color, color: config.color }}
                >
                  <span className="text-[10px] font-black tracking-wider">LEVEL</span>
                  <span className="text-sm font-black">{config.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="px-6 flex-1 flex flex-col mt-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <h3 className="text-lg font-black text-gray-800 leading-none uppercase tracking-tight break-words">
                  {firstName}
                </h3>
                <h3 className="text-xl font-black text-gray-900 leading-none uppercase tracking-tighter mt-1 break-words">
                  {lastName}
                </h3>
                <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: config.color }}>
                  {user.role || "Member"}
                </div>
              </div>
              
              {/* Rank Graphic */}
              <div className="flex flex-col items-end pb-1">
                 <span className="text-[10px] font-black text-gray-400">RANK</span>
                 <span className="text-3xl font-black leading-none tracking-tighter" style={{ color: config.color }}>
                   {user.rank === "Member" ? "00" : user.rank.charAt(0)}
                 </span>
              </div>
            </div>

            {/* Footer Barcode Area */}
            <div className="mt-auto mb-6 bg-gray-900 text-white rounded-xl p-3 flex justify-between items-center shadow-md">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">AUTHORIZED ACCESS</span>
                <span className="text-[10px] font-bold uppercase mt-1 leading-none">ROBOT-{user.studentId}</span>
              </div>
              {/* Fake Barcode */}
              <div className="flex gap-[2px] h-6 items-center opacity-80">
                {[1,3,2,1,4,1,2,2,3,1,1,2,3,1,2].map((w, i) => (
                  <div key={i} className="bg-white h-full" style={{ width: `${w}px` }}></div>
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
          className="absolute inset-0 bg-gray-50 rounded-3xl shadow-xl flex flex-col items-center border-2 border-gray-200"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Badge Clip Hole */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-gray-200/80 rounded-full border border-gray-300/50 shadow-inner z-20"></div>

          <div className="flex-1 flex flex-col items-center justify-center w-full px-8">
            <Fingerprint className="w-12 h-12 text-gray-300 mb-6" />
            
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Scan for Identity</h4>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
              <QrCode className="w-32 h-32 text-gray-900" strokeWidth={1.5} />
            </div>

            <div className="text-center w-full space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student ID</p>
              <p className="font-mono text-xl font-bold tracking-[0.2em] text-gray-900 bg-gray-200/50 py-2 rounded-lg">{user.studentId}</p>
            </div>
          </div>

          <div className="w-full p-6 text-center border-t border-gray-200 bg-gray-100/50 rounded-b-3xl">
             <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">
               This card is property of NU Robot Club.<br/>
               If found, please return to EE701.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
