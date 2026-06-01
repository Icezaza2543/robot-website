"use client";

import Link from "next/link";

export default function NewsArticle1() {
  const post = {
    title: "เริ่มต้นพัฒนา IoT ด้วย ESP32 และ MicroPython สำหรับผู้เริ่มต้น",
    date: "27 พฤษภาคม 2026",
    summary: "เรียนรู้วิธีการติดตั้งตัวแปลภาษา MicroPython ลงบนบอร์ดควบคุมสุดฮิตอย่าง ESP32 พร้อมเขียนโค้ดสั้นๆ ควบคุมไฟ LED และอ่านค่าโมดูลวัดอุณหภูมิความชื้นง่ายๆ ใน 5 นาที",
    content: "บอร์ด ESP32 เป็นไมโครคอนโทรลเลอร์ขนาดจิ๋วที่มี Wi-Fi และ Bluetooth ในตัว ทำให้เหมาะสมอย่างยิ่งสำหรับงานประมวลผล IoT\n\nในบทความนี้ CPE Tech Team ขอเสนอแนวทางการเริ่มต้นใช้ภาษา Python แทนการเขียน C++ แบบเดิม ผ่านชุดแปลภาษา MicroPython ซึ่งช่วยให้อ่านโค้ดง่ายและพัฒนาโปรเจกต์เสร็จได้อย่างรวดเร็ว\n\nขั้นตอนหลักๆ ในการเริ่มต้น:\n- **ขั้นตอนที่ 1**: ทำการดาวน์โหลดเฟิร์มแวร์ MicroPython สำหรับ ESP32\n- **ขั้นตอนที่ 2**: ติดตั้งเครื่องมือ esptool.py ผ่าน Terminal เพื่อล้างหน่วยความจำและแฟลชไฟล์เฟิร์มแวร์ (.bin) ลงบอร์ด\n- **ขั้นตอนที่ 3**: ดาวน์โหลด Thonny IDE และเชื่อมต่อเข้ากับพอร์ตสื่อสารของบอร์ด\n- **ขั้นตอนที่ 4**: ทดลองสั่งให้บอร์ดกระพริบไฟ LED ออนบอร์ด (Pin 2) ด้วยคำสั่งสั้นๆ เพียงไม่กี่บรรทัด\n\nนอกจากนี้ เรายังสามารถต่อคอมโพเนนต์ย่อย เช่น เซนเซอร์วัดอุณหภูมิและความชื้นสัมพัทธ์ DHT22 เพื่ออ่านข้อมูลมาปริ้นต์แสดงผลเรียลไทม์ได้อีกด้วย สำหรับนิสิตที่สนใจอุปกรณ์ในคลาสนี้ สามารถลงทะเบียนขอยืมบอร์ด ESP32 และ DHT22 ผ่านระบบยืมของเว็บบล็อกได้ฟรีเลยครับ!",
    category: "Embedded & IoT",
    author: "CPE Tech Team",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
    imageSize: "800 x 450 px (16:9)",
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Navigation Header */}
      <div className="mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-500 transition shadow-xs cursor-pointer active:scale-95"
        >
          กลับหน้าหลัก
        </Link>
        <span className="text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1 rounded-full">
          {post.category}
        </span>
      </div>

      {/* Main Premium Reader Layout */}
      <div className="overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-md flex flex-col">
        {/* Full Bleed Cover Image with Blend */}
        <div className="relative h-64 sm:h-[400px] w-full overflow-hidden bg-gray-50 shrink-0">
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10" />
          
          {/* Floating Size Tag */}
          <div className="absolute bottom-5 right-6 sm:right-8">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider bg-black/60 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl border border-white/10 shadow-md">
              ขนาดแนะนำ: {post.imageSize}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 sm:px-12 py-10 space-y-6">
          {/* Author Card Banner */}
          <div className="flex flex-wrap gap-4 items-center justify-between py-4 border-y border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-orange-500/20">
                C
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-400 block uppercase tracking-widest">ผู้ประพันธ์</span>
                <span className="text-xs font-black text-gray-800 leading-none">{post.author}</span>
              </div>
            </div>
            <div className="text-[10px] font-bold text-gray-400">
              เผยแพร่เมื่อ: {post.date}
            </div>
          </div>

          {/* Title & Body content */}
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4.5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-950 via-slate-900 to-orange-600 leading-tight tracking-tight">
              {post.title}
            </h1>

            {/* Editorial summary box */}
            <p className="text-xs text-orange-900 leading-relaxed font-bold border-l-4 border-orange-500 pl-4 bg-orange-50/40 p-4 rounded-r-2xl border-y border-r border-orange-100/20">
              **บทสรุปสังเขป**: {post.summary}
            </p>

            {/* Structured paragraph rendering */}
            <div className="text-sm text-gray-600 leading-relaxed font-semibold space-y-4 pt-2">
              {post.content.split("\n\n").map((paragraph, index) => {
                if (paragraph.includes("\n- ")) {
                  const lines = paragraph.split("\n");
                  const intro = lines[0];
                  const listItems = lines.slice(1);
                  return (
                    <div key={index} className="space-y-2">
                      {intro && <p className="mb-2">{intro}</p>}
                      <ul className="space-y-2.5 pl-1.5">
                        {listItems.map((li, idx) => {
                          const cleanLi = li.replace("- ", "");
                          return (
                            <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-gray-600">
                              <span className="text-orange-500 text-sm leading-none mt-0.5"></span>
                              <span className="leading-relaxed">{cleanLi}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                }

                return (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer sticky back action */}
        <div className="px-6 sm:px-12 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-400 font-bold">© NU Robot Club Web Blog</span>
          <Link
            href="/"
            className="rounded-xl bg-gray-950 hover:bg-orange-500 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer active:scale-95"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
