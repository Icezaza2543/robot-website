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
  returnFocusRef?: React.RefObject<HTMLElement | null>;
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

export function ProfileCardModal({ isOpen, onClose, user, returnFocusRef }: ProfileCardModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !mounted || !dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      // The dropdown item is unmounted; prefer the persistent account trigger.
      const target = returnFocusRef?.current ?? previousFocus;
      if (target instanceof HTMLElement && target.isConnected) target.focus({ preventScroll: true });
    };
  }, [isOpen, mounted, returnFocusRef]);

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
    <dialog
      ref={dialogRef}
      aria-labelledby="profile-card-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") { event.stopPropagation(); return; }
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
          "button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), iframe, [tabindex]:not([tabindex='-1'])"
        )).filter((element) => element.getClientRects().length > 0 && !element.closest('[hidden], [inert], [aria-hidden="true"]'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-2 text-inherit backdrop:bg-black/80 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center"
    >
      <div className="relative flex max-h-full w-full max-w-sm flex-col items-center overflow-y-auto overscroll-contain pb-4 pt-14">
        {/* Close button */}
        <button
          type="button"
          autoFocus
          aria-label="ปิดบัตรประจำตัว"
          onClick={onClose}
          className="absolute top-1 right-1 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6 text-center">
          <h2 id="profile-card-title" className="text-white text-2xl font-black mb-1 drop-shadow-md">บัตรประจำตัวของคุณ</h2>
          <p className="text-white/70 text-sm">กดปุ่มใต้บัตรเพื่อดู QR Code</p>
        </div>

        {/* Card or Loading */}
        <div className="w-[300px] shrink-0">
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
        <div className="mt-8 flex shrink-0 flex-wrap justify-center gap-4">
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
    </dialog>,
    document.body
  );
}
