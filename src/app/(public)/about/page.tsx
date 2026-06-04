"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, UserCheck, MapPin, Map, Image as ImageIcon, Lightbulb, DoorOpen, MessageCircle, Info, Target, History, ChevronLeft, ChevronRight, Contact } from "lucide-react";

interface AboutInfo {
  history: string;
  vision: string;
  contact: string;
  showHistory?: boolean;
  showVision?: boolean;
  presidentName?: string;
  presidentImage?: string;
  presidentMessage?: string;
  presidentPrefix?: string;
}

interface Advisor {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  prefix?: string;
}

export default function AboutPage() {
  const [info, setInfo] = useState<AboutInfo>({ history: "", vision: "", contact: "", showHistory: true, showVision: true });
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  useEffect(() => {
    fetch("/api/about").then(res => res.json()).then(data => setInfo(data));
    fetch("/api/advisors").then(res => res.json()).then(data => setAdvisors(data));
  }, []);

  const routeSteps = [
    {
      step: "STEP 01",
      title: "1. เดินทางมาตึก EE",
      desc: "เริ่มต้นเดินทางมาที่อาคารวิศวกรรมไฟฟ้าและคอมพิวเตอร์ (ตึก EE) คณะวิศวกรรมศาสตร์ มน.",
      icon: (
        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      step: "STEP 02",
      title: "2. เข้าสู่ตัวอาคาร",
      desc: "เดินผ่านประตูหลักทางเข้าด้านหน้าอาคาร (ตึกวิศวกรรมไฟฟ้าฯ) เข้ามาด้านในโถงแรก",
      icon: (
        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      )
    },
    {
      step: "STEP 03",
      title: "3. ตรงไปยังโถงลิฟต์",
      desc: "เดินตรงผ่านทางเดินกลางอาคารเข้ามาเรื่อยๆ จะพบโถงลิฟต์โดยสารหลักอยู่ตรงกลางตึก",
      icon: (
        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      step: "STEP 04",
      title: "4. กดลิฟต์โดยสาร",
      desc: "รอลิฟต์โดยสารหลักบริเวณโถงกลาง เพื่อเตรียมเดินทางขึ้นไปยังชั้นบนของตึก",
      icon: (
        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      )
    },
    {
      step: "STEP 05",
      title: "5. ขึ้นลิฟต์ไปชั้น 7",
      desc: "กดลิฟต์โดยสารและเดินทางขึ้นไปยังชั้น 7 ของตึก EE คณะวิศวกรรมศาสตร์",
      icon: (
        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      )
    },
    {
      step: "STEP 06",
      title: "6. ออกจากลิฟต์เลี้ยวขวา",
      desc: "เมื่อเดินทางถึงชั้น 7 แล้ว ทันทีที่ลิฟต์เปิดออกให้ก้าวออกมาแล้วเลี้ยวขวา",
      icon: (
        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      )
    },
    {
      step: "STEP 07",
      title: "7. เดินตรงตามโถงทางเดิน",
      desc: "เดินตรงไปเรื่อยๆ ตามแนวโถงทางเดินยาวของชั้น 7 อาคารวิศวกรรมไฟฟ้าฯ",
      icon: (
        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      )
    },
    {
      step: "STEP 08",
      title: "8. สังเกตห้องด้านซ้ายมือ",
      desc: "เมื่อเดินเกือบสุดโถงทางเดินฝั่งขวา ให้มองหาสังเกตห้องกระจกที่อยู่ทางด้านซ้ายมือ",
      icon: (
        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      step: "STEP 09",
      title: "9. พบป้ายห้อง EE701",
      desc: "คุณจะพบคลิกทางด้านซ้าย ประตูห้องวิชาการ EE701 พร้อมป้ายชมรม NU Robot Club",
      icon: (
        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      step: "STEP 10",
      title: "10. ยินดีต้อนรับสู่ชมรม",
      desc: "เคาะประตูเปิดเข้ามาพบปะ แลกเปลี่ยนเรียนรู้ไอเดีย ทำโปรเจกต์ต่อวงจรร่วมกันได้เลย!",
      icon: (
        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 md:py-24 md:px-8 flex flex-col gap-20">

      {/* 1. Header Section */}
      <section className="text-center max-w-3xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
          เกี่ยวกับชมรมโรบอท
        </h1>
        <p className="mt-6 text-base text-gray-500 font-medium leading-relaxed">
          ทำความรู้จักกับประวัติ วิสัยทัศน์ อาจารย์ที่ปรึกษา <br className="hidden sm:block" />
          และสถานที่ตั้งของพวกเรา มหาวิทยาลัยนเรศวร
        </p>
      </section>

      {/* 2. Core Information (History & Vision) */}
      {(info.showHistory === true || info.showVision === true) && (
        <section className={`grid grid-cols-1 ${info.showHistory === true && info.showVision === true ? 'md:grid-cols-2' : ''} gap-8 md:gap-12`}>
          {info.showHistory === true && (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10 shadow-sm flex flex-col gap-5 hover:border-orange-500/30 transition duration-300">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                  <History className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">ประวัติชมรม</h2>
              </div>
              <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-line text-sm md:text-base">
                {info.history || "กำลังอัปเดตประวัติชมรม..."}
              </p>
            </div>
          )}

          {info.showVision === true && (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-10 shadow-sm flex flex-col gap-5 hover:border-blue-500/30 transition duration-300">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">วิสัยทัศน์ & เป้าหมาย</h2>
              </div>
              <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-line text-sm md:text-base">
                {info.vision || "กำลังอัปเดตวิสัยทัศน์..."}
              </p>
            </div>
          )}
        </section>
      )}

      {/* 2.5 President Section */}
      {info.presidentName && (
        <section className="flex flex-col items-center gap-10 pt-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl flex items-center justify-center gap-3">
              <UserCheck className="w-8 h-8 text-orange-500" /> ประธานชมรม (ปัจจุบัน)
            </h2>
            <p className="text-sm text-gray-500 font-semibold mt-2">
              ประธานชมรมโรบอท มหาวิทยาลัยนเรศวร
            </p>
          </div>

          <div className="relative w-full max-w-5xl mx-auto group">
            {/* Soft shadow/glow behind */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-200 to-orange-100 rounded-[2.5rem] blur-lg opacity-40 group-hover:opacity-60 transition duration-500"></div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl shadow-gray-200/50 flex flex-col-reverse md:flex-row items-stretch transition-all duration-500 transform group-hover:-translate-y-1">

              {/* Text Section */}
              <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center relative z-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 font-extrabold text-[11px] rounded-full uppercase tracking-[0.2em] mb-6 w-max border border-orange-200/50 shadow-sm">
                  <Target className="w-3.5 h-3.5" /> ประธานชมรม
                </div>

                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-8">
                  {info.presidentPrefix && (
                    <span className="block text-xl md:text-2xl font-bold text-gray-400 mb-2">{info.presidentPrefix}</span>
                  )}
                  {info.presidentName}
                </h3>

                {info.presidentMessage && (
                  <div className="relative">
                    <div className="absolute -top-6 -left-4 text-7xl text-orange-100 font-serif leading-none select-none z-0">“</div>
                    <blockquote className="relative z-10 text-gray-600 font-medium leading-relaxed text-base md:text-lg border-l-2 border-orange-300 pl-5">
                      {info.presidentMessage}
                    </blockquote>
                  </div>
                )}
              </div>

              {/* Image Section */}
              <div className="w-full md:w-[45%] h-[350px] md:h-auto min-h-[400px] relative bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border-b md:border-b-0 md:border-l border-gray-100">
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-orange-50 to-transparent z-0"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-200/40 rounded-full blur-3xl z-0 transition-transform duration-700 group-hover:scale-110"></div>

                {info.presidentImage ? (
                  <div className="absolute inset-5 md:inset-8 rounded-[2rem] overflow-hidden shadow-lg border-4 border-white z-10 bg-gray-100 transform transition-transform duration-700 group-hover:scale-[1.02]">
                    <img
                      src={info.presidentImage}
                      alt="President"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative z-10">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center shadow-inner">
                      <UserCheck className="w-16 h-16 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Advisors Carousel Section */}
      <section className="flex flex-col items-center gap-10 pt-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl flex items-center justify-center gap-3">
            <Users className="w-8 h-8 text-orange-500" /> ทำเนียบที่ปรึกษาชมรม
          </h2>
          <p className="text-sm text-gray-500 font-semibold mt-2">
            คณาจารย์ผู้ดูแลและให้การสนับสนุนทางวิชาการ
          </p>
        </div>

        {advisors.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8 w-full max-w-7xl mx-auto px-4">
            {advisors.map((advisor, index) => (
              <div key={advisor.id || index} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] max-w-[320px] group relative bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center">

                {/* Image Section */}
                <div className="w-full h-[280px] sm:h-[320px] relative bg-gray-50 flex items-end justify-center overflow-hidden border-b border-gray-100">
                  {/* Decorative background circles */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100/50 rounded-full blur-2xl transition-all group-hover:scale-150"></div>
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-50/50 rounded-full blur-xl transition-all group-hover:scale-150"></div>

                  {advisor.imageUrl ? (
                    <img
                      src={advisor.imageUrl}
                      alt={advisor.name}
                      className="w-full h-full object-cover object-top relative z-10"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center relative z-10 bg-gray-100">
                      <UserCheck className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Text Section */}
                <div className="p-6 text-center w-full flex flex-col items-center bg-white z-20 relative">
                  <span className="inline-block px-4 py-1.5 bg-orange-50 text-orange-600 font-bold text-[11px] rounded-full uppercase tracking-wider mb-3">
                    {advisor.role}
                  </span>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">
                    {advisor.prefix && (
                      <span className="block text-sm font-bold text-gray-500 mb-1">{advisor.prefix}</span>
                    )}
                    {advisor.name}
                  </h3>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-lg rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-400 font-bold">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            ยังไม่มีข้อมูลที่ปรึกษาชมรม
          </div>
        )}
      </section>

      {/* 4. Location Section (ที่ตั้งชมรมพร้อมคู่มือเดินทาง) */}
      <section id="location" className="flex flex-col gap-12 border-t border-gray-100 pt-16 scroll-mt-24">

        {/* Section Heading */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
            <MapPin className="inline-block w-8 h-8 mr-2 text-gray-900" /> สถานที่ตั้งห้องชมรม NU Robot Club
          </h2>
          <p className="text-sm text-gray-400 font-semibold mt-1">
            แวะเข้ามาพบปะ แลกเปลี่ยนไอเดียต่อวงจร หรือปรึกษาโปรเจกต์ได้ที่ห้องชมรมของพวกเรา
          </p>
        </div>

        {/* Part 1: Main Address Card & Contacts */}
        <div className="rounded-3xl border border-gray-200/60 bg-white p-6 md:p-10 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center hover:shadow-md transition duration-300">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest block">
              CLUBHOUSE LOCATION
            </span>
            <h3 className="text-2xl font-black text-gray-900 leading-tight">
              ห้องชมรม NU Robot Club
            </h3>
            <p className="text-base text-gray-600 font-medium leading-relaxed mt-2 whitespace-pre-line">
              <DoorOpen className="inline w-4 h-4 text-gray-400 mr-1" /> ชั้น 7 ห้อง EE701 อาคารวิศกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ <br />
              มหาวิทยาลัยนเรศวร ต.ท่าโพธิ์ อ.เมือง จ.พิษณุโลก 65000
            </p>
          </div>

          <div className="flex flex-col gap-4 md:border-l md:border-gray-100 md:pl-8">
            <div className="text-gray-700 font-bold text-sm">
              <Contact className="inline w-4 h-4 text-gray-400 mr-1" /> ข้อมูลติดต่อเพิ่มเติม:
            </div>
            {info.contact ? (
              <p className="text-sm text-gray-600 whitespace-pre-line font-medium leading-relaxed">
                {info.contact}
              </p>
            ) : (
              <p className="text-sm text-gray-400 font-medium italic">ไม่มีข้อมูลการติดต่อเพิ่มเติม</p>
            )}

            <div className="text-gray-700 font-bold text-sm mt-2">
              <MessageCircle className="inline w-4 h-4 text-gray-400 mr-1" /> ช่องทางโซเชียล:
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.facebook.com/nurobot"
                className="flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50 active:translate-y-0 hover:text-blue-600 w-full sm:w-auto"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-5 w-5 fill-current text-blue-600" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
                <span>Facebook</span>
              </a>

              <a
                href="https://www.instagram.com/nurobotclub_official"
                className="flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50 active:translate-y-0 hover:text-pink-600 w-full sm:w-auto"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-5 w-5 text-pink-600 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Part 2: Step-by-Step Photo Navigation Guide */}
        <div className="flex flex-col gap-8 mt-4">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Map className="w-6 h-6 text-gray-900" /> คู่มือการเดินทางไปห้องชมรมทีละขั้นตอน
            </h3>
            <p className="text-sm text-gray-400 font-semibold mt-1">
              คำแนะนำพร้อมภาพประกอบสำหรับการเดินทางมายังห้อง EE701 ชั้น 7 (ทั้งหมด 10 ขั้นตอน)
            </p>
          </div>

          <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-5xl">
            {routeSteps.map((stepItem, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-4 group hover:border-orange-500/20 transition-all duration-300"
              >
                <div className="w-full aspect-[16/9] rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4 text-gray-400 font-bold text-[10px] gap-2.5 group-hover:bg-gray-100/50 transition-colors duration-200 relative overflow-hidden">
                  <span className="absolute top-3 left-3 bg-orange-500 text-white font-black text-[9px] px-2.5 py-1 rounded-md leading-none shadow-sm tracking-wider">
                    {stepItem.step}
                  </span>
                  {stepItem.icon}
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stepItem.title}</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-800 tracking-tight leading-snug group-hover:text-orange-500 transition-colors duration-200">
                    {stepItem.title}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-400 mt-2 font-medium leading-relaxed">
                    {stepItem.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  )
}
