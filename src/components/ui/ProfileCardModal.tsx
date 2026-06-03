"use client";

import React, { useRef, useState } from "react";
import { X, Download, Share2 } from "lucide-react";
import { ProfileCard, UserRank } from "./ProfileCard";
import * as htmlToImage from "html-to-image";

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

export function ProfileCardModal({ isOpen, onClose, user }: ProfileCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  if (!isOpen) return null;

  // Extract student ID from email if possible, else generate one
  const studentIdMatch = user.email.match(/^(\d+)/);
  const studentId = studentIdMatch ? studentIdMatch[1] : "00000000";

  // Dummy logic for Rank based on email or fixed
  // For now, let's assign Diamond if admin, else Gold (just as an example)
  const rank: UserRank = user.role === "admin" ? "Diamond" : "Gold";

  const cardData = {
    name: user.name || "Unknown User",
    studentId: studentId,
    image: user.image,
    role: user.role === "admin" ? "Admin" : "Member",
    points: 1250, // Example static points
    rank: rank,
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsCapturing(true);
      // Wait for a short moment to ensure images are loaded
      await new Promise(r => setTimeout(r, 300));
      const dataUrl = await htmlToImage.toPng(cardRef.current, { 
        quality: 1, 
        pixelRatio: 2,
        useCORS: true, // Fix for Google profile images
        // We capture the front of the card only for sharing
        style: { transform: 'none' } 
      });
      
      const link = document.createElement("a");
      link.download = `robot-id-${studentId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
      alert("เกิดข้อผิดพลาดในการสร้างรูปภาพ (อาจติดปัญหาภาพโปรไฟล์ข้ามโดเมน)");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleShareIG = async () => {
    if (!cardRef.current) return;
    try {
      setIsCapturing(true);
      await new Promise(r => setTimeout(r, 300));
      const dataUrl = await htmlToImage.toBlob(cardRef.current, { 
        quality: 1, 
        pixelRatio: 2,
        useCORS: true, // Fix for Google profile images
        style: { transform: 'none' } 
      });

      if (!dataUrl) throw new Error("No image data");

      const file = new File([dataUrl], "my-robot-id.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My Robot Club ID",
          text: "Check out my NU Robot Club ID!",
          files: [file],
        });
      } else {
        // Fallback: Download image and show instructions
        handleDownload();
        alert("เบราว์เซอร์ของคุณไม่รองรับการแชร์รูปภาพโดยตรง ระบบได้ทำการดาวน์โหลดรูปภาพแทน คุณสามารถนำรูปนี้ไปลง Instagram Story ได้เลยครับ");
      }
    } catch (err) {
      console.error("Failed to share", err);
      alert("เกิดข้อผิดพลาดในการแชร์ (อาจติดปัญหาภาพโปรไฟล์ข้ามโดเมน)");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
      
      <div className="relative z-10 flex flex-col items-center max-w-[90vw]">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-8">
          <h2 className="text-white text-2xl font-black text-center mb-2 shadow-sm drop-shadow-md">บัตรประจำตัวของคุณ</h2>
          <p className="text-white/80 text-sm text-center">ดับเบิ้ลคลิกที่บัตรเพื่อดู QR Code</p>
        </div>

        {/* The Card to Capture (We wrap it to apply specific styles during capture if needed) */}
        <div ref={cardRef} className="bg-transparent rounded-3xl p-1">
          <ProfileCard user={cardData} className="shadow-2xl" />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 w-full">
          <button 
            onClick={handleDownload}
            disabled={isCapturing}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Download className="w-5 h-5" />
            {isCapturing ? "กำลังประมวลผล..." : "บันทึกรูปภาพ"}
          </button>
          
          <button 
            onClick={handleShareIG}
            disabled={isCapturing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30"
          >
            <Share2 className="w-5 h-5" />
            แชร์ไปที่ IG
          </button>
        </div>
      </div>
    </div>
  );
}
