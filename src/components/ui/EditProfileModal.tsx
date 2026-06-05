"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X, Save, User, Phone, GraduationCap, BookOpen, FileText,
  Loader2, CheckCircle, UploadCloud, Link as LinkIcon, Camera,
} from "lucide-react";
import toast from "react-hot-toast";

interface ProfileData {
  name: string;
  email: string;
  image: string;
  role?: string;
  nickname: string;
  studentId: string;
  phone: string;
  year: string;
  department: string;
  faculty: string;
  bio: string;
  customAvatar: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (data: Partial<ProfileData>) => void;
}

const YEARS = ["1", "2", "3", "4", "5", "Alumni"];
const FACULTIES = [
  "วิศวกรรมศาสตร์",
  "วิทยาศาสตร์",
  "เทคโนโลยีสารสนเทศและดิจิทัล",
  "สถาปัตยกรรมศาสตร์",
  "อื่นๆ",
];

export function EditProfileModal({ isOpen, onClose, onSaved }: EditProfileModalProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarUrlInput, setAvatarUrlInput] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen || !mounted) return;
    setIsLoading(true);
    setSaved(false);
    setAvatarUrlInput("");
    fetch("/api/profile")
      .then(res => res.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setAvatarPreview(data.customAvatar || data.image || "");
      })
      .catch(err => console.error("Failed to load profile", err))
      .finally(() => setIsLoading(false));
  }, [isOpen, mounted]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setAvatarPreview(url);
        setProfile({ ...profile, customAvatar: url });
        setAvatarUrlInput("");
      } else {
        const err = await res.json();
        toast.error(`อัปโหลดไม่สำเร็จ: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAvatarUrlApply = () => {
    if (!avatarUrlInput.trim() || !profile) return;
    setAvatarPreview(avatarUrlInput.trim());
    setProfile({ ...profile, customAvatar: avatarUrlInput.trim() });
  };

  const handleResetAvatar = () => {
    if (!profile) return;
    setAvatarPreview(profile.image || "");
    setProfile({ ...profile, customAvatar: "" });
    setAvatarUrlInput("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: profile.nickname,
          studentId: profile.studentId,
          phone: profile.phone,
          year: profile.year,
          department: profile.department,
          faculty: profile.faculty,
          bio: profile.bio,
          customAvatar: profile.customAvatar,
        }),
      });
      if (res.ok) {
        setSaved(true);
        toast.success("บันทึกข้อมูลสำเร็จ");
        onSaved?.({ ...profile });
        setTimeout(() => {
          setSaved(false);
          onClose();
        }, 1500);
      } else {
        toast.error("บันทึกไม่สำเร็จ กรุณาลองใหม่");
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const displayAvatar = avatarPreview;
  const nameInitial = profile?.name?.charAt(0)?.toUpperCase() ?? "?";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <User className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">แก้ไขข้อมูลโปรไฟล์</h2>
              <p className="text-xs text-gray-400 font-medium">ข้อมูลจะปรากฏบน ID Card ของคุณ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-medium">กำลังโหลดข้อมูล...</span>
            </div>
          ) : profile ? (
            <form id="edit-profile-form" onSubmit={handleSave} className="flex flex-col gap-5">

              {/* ── Avatar Editor ── */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Camera className="w-3 h-3" /> รูปโปรไฟล์
                </p>
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="shrink-0 relative group">
                    <div
                      className="w-20 h-20 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-orange-100 flex items-center justify-center"
                      style={displayAvatar ? {
                        backgroundImage: `url('${displayAvatar}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      } : {}}
                    >
                      {!displayAvatar && (
                        <span className="text-2xl font-black text-orange-400">{nameInitial}</span>
                      )}
                    </div>
                    {/* Click overlay to trigger file */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      title="คลิกเพื่ออัปโหลดรูป"
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploadingAvatar} />
                  </div>

                  {/* Upload & URL */}
                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    {/* Upload button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-2.5 text-sm font-bold text-gray-500 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingAvatar ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> กำลังอัปโหลด...</>
                      ) : (
                        <><UploadCloud className="w-4 h-4" /> อัปโหลดรูปจากเครื่อง</>
                      )}
                    </button>

                    {/* URL input */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="หรือวางลิงก์รูปภาพ (URL)"
                          value={avatarUrlInput}
                          onChange={e => setAvatarUrlInput(e.target.value)}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAvatarUrlApply}
                        className="px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-orange-500 transition cursor-pointer whitespace-nowrap"
                      >
                        ใช้งาน
                      </button>
                    </div>

                    {/* Reset */}
                    {profile.customAvatar && (
                      <button
                        type="button"
                        onClick={handleResetAvatar}
                        className="text-xs text-gray-400 hover:text-red-500 transition font-bold text-left cursor-pointer"
                      >
                        ↩ คืนค่ารูปจาก Google
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Read-only identity */}
              <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 flex flex-col gap-0.5">
                <p className="font-black text-gray-900">{profile.name}</p>
                <p className="text-xs text-gray-400">{profile.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md w-max">
                  {profile.role === "admin" ? "ผู้ดูแลระบบ" : "สมาชิกชมรม"}
                </span>
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Instagram
                  </label>
                  <input type="text" placeholder="IG ของคุณ" value={profile.nickname}
                    onChange={e => setProfile({ ...profile, nickname: e.target.value })}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3 h-3" /> รหัสนักศึกษา
                  </label>
                  <input type="text" placeholder="66XXXXXXX" value={profile.studentId} maxLength={10}
                    onChange={e => setProfile({ ...profile, studentId: e.target.value })}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition font-mono tracking-wider" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> เบอร์โทรศัพท์
                  </label>
                  <input type="tel" placeholder="0XX-XXX-XXXX" value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> ชั้นปี
                  </label>
                  <select value={profile.year} onChange={e => setProfile({ ...profile, year: e.target.value })}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition bg-white">
                    <option value="">-- เลือกชั้นปี --</option>
                    {YEARS.map(y => <option key={y} value={y}>ปี {y}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3 h-3" /> สาขาวิชา
                  </label>
                  <input type="text" placeholder="สาขาวิชา" value={profile.department || "วิศวกรรมคอมพิวเตอร์"}
                    onChange={e => setProfile({ ...profile, department: e.target.value })}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition" />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">คณะ</label>
                  <select value={profile.faculty} onChange={e => setProfile({ ...profile, faculty: e.target.value })}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition bg-white">
                    <option value="">-- เลือกคณะ --</option>
                    {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> แนะนำตัว / สนใจด้าน
                  </label>
                  <textarea rows={3} maxLength={200} placeholder="เช่น ชอบทำ Robot ประเภท Autonomous..." value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition resize-none" />
                  <span className="text-[10px] text-gray-300 text-right font-medium">{profile.bio.length}/200</span>
                </div>
              </div>
            </form>
          ) : (
            <div className="py-16 text-center text-gray-400 text-sm">โหลดข้อมูลไม่สำเร็จ</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex gap-3 justify-end shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition cursor-pointer">
            ยกเลิก
          </button>
          <button type="submit" form="edit-profile-form" disabled={isSaving || isLoading || !profile}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-orange-500/20 cursor-pointer">
            {saved ? (
              <><CheckCircle className="w-4 h-4" /> บันทึกแล้ว!</>
            ) : isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
            ) : (
              <><Save className="w-4 h-4" /> บันทึกข้อมูล</>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
