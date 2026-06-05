"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download, Share2, Loader2 } from "lucide-react";
import { ProfileCard, UserRank } from "./ProfileCard";
import * as htmlToImage from "html-to-image";
import toast from "react-hot-toast";

interface ProfileCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    image?: string;
    role?: string;
  };
}

interface FullProfile {
  name: string;
  email: string;
  image: string;
  role: string;
  nickname: string;
  studentId: string;
  phone: string;
  year: string;
  department: string;
  faculty: string;
  bio: string;
  customAvatar: string;
  rank: string; // admin-assigned rank from column M
}

export function ProfileCardModal({ isOpen, onClose, user }: ProfileCardModalProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Fetch full profile data when modal opens to get real studentId, customAvatar, etc.
  useEffect(() => {
    if (!isOpen || !mounted) return;
    setIsLoadingProfile(true);
    fetch("/api/profile")
      .then(res => res.json())
      .then((data: FullProfile) => setProfile(data))
      .catch(err => console.error("Failed to load profile for card", err))
      .finally(() => setIsLoadingProfile(false));
  }, [isOpen, mounted]);

  if (!isOpen || !mounted) return null;

  // Compose card data — prefer real profile data over session props
  const displayName = profile?.name || user.name || "Unknown User";
  const displayImage = profile?.customAvatar || profile?.image || user.image || "";
  const displayRole = profile?.role ?? user.role ?? "user";
  const studentId = profile?.studentId || "00000000";

  // Use admin-assigned rank; fallback to Diamond for admin, Member for others
  const validRanks: UserRank[] = ["Member", "Bronze", "Silver", "Gold", "Platinum", "Diamond"];
  const rawRank = profile?.rank || "";
  const rank: UserRank = validRanks.includes(rawRank as UserRank)
    ? (rawRank as UserRank)
    : (displayRole === "admin" ? "Diamond" : "Member");

  // Dates
  const today = new Date();
  const issueDate = today.toISOString().split("T")[0];
  const expiry = new Date(today);
  expiry.setFullYear(expiry.getFullYear() + 1);
  const expiryDate = expiry.toISOString().split("T")[0];

  const cardData = {
    name: displayName,
    studentId,
    image: displayImage,
    role: displayRole === "admin" ? "Admin" : (profile?.nickname || "Member"),
    points: undefined as number | undefined, // hide points on card for cleaner look
    rank,
    issueDate,
    expiryDate,
  };

  const captureFront = async (): Promise<string | null> => {
    if (!frontRef.current) return null;
    try {
      // Workaround for Safari/iOS: The first capture often fails to render external images.
      // We do a "dummy" capture first to force the browser to cache and load the assets into the canvas.
      await htmlToImage.toPng(frontRef.current, { 
        quality: 0.1, 
        pixelRatio: 1,
        fetchRequestInit: { mode: "cors", cache: "force-cache" },
      });
      
      // The real high-quality capture
      return await htmlToImage.toPng(frontRef.current, {
        quality: 1,
        pixelRatio: 3,
        fetchRequestInit: { mode: "cors", cache: "force-cache" },
      });
    } catch (err) {
      console.error("Capture failed", err);
      return null;
    }
  };

  const handleDownload = async () => {
    setIsCapturing(true);
    await new Promise(r => setTimeout(r, 300));
    const dataUrl = await captureFront();
    setIsCapturing(false);
    if (!dataUrl) { toast.error("เกิดข้อผิดพลาดในการสร้างรูปภาพ"); return; }
    const link = document.createElement("a");
    link.download = `robot-id-${studentId}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShareIG = async () => {
    setIsCapturing(true);
    await new Promise(r => setTimeout(r, 300));
    const dataUrl = await captureFront();
    setIsCapturing(false);
    if (!dataUrl) { toast.error("เกิดข้อผิดพลาดในการสร้างรูปภาพ"); return; }

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], "my-robot-id.png", { type: "image/png" });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: "My Robot Club ID",
          text: "Check out my NU Robot Club ID!",
          files: [file],
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      const link = document.createElement("a");
      link.download = `robot-id-${studentId}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("เบราว์เซอร์ของคุณไม่รองรับการแชร์ตรง ระบบดาวน์โหลดรูปให้แล้ว นำไปลง IG Story ได้เลยครับ");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex flex-col items-center max-w-[90vw]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-white text-2xl font-black mb-1 drop-shadow-md">บัตรประจำตัวของคุณ</h2>
          <p className="text-white/70 text-sm">ดับเบิ้ลคลิกที่บัตรเพื่อดู QR Code / วันหมดอายุ</p>
        </div>

        {/* Card or Loading */}
        <div className="w-[320px] max-w-[90vw]">
          {isLoadingProfile ? (
            <div className="flex flex-col items-center justify-center gap-3 h-[512px] bg-white/5 rounded-3xl">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <span className="text-white/70 text-sm font-medium">กำลังโหลดบัตร...</span>
            </div>
          ) : (
            <ProfileCard user={cardData} className="shadow-2xl" frontRef={frontRef} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={handleDownload}
            disabled={isCapturing || isLoadingProfile}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Download className="w-5 h-5" />
            {isCapturing ? "กำลังประมวลผล..." : "บันทึกรูปภาพ"}
          </button>

          <button
            onClick={handleShareIG}
            disabled={isCapturing || isLoadingProfile}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30"
          >
            <Share2 className="w-5 h-5" />
            แชร์ไปที่ IG
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
