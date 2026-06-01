import Link from "next/link"
import { Users, UserCheck, MapPin, Map, Image as ImageIcon, Lightbulb, DoorOpen, MessageCircle } from "lucide-react"

export default function AboutPage() {
  // Clean Data Array for 10 Route Steps (ง่ายต่อการแก้ไขและดูแลรักษา)
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
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 md:py-24 md:px-8 flex flex-col gap-20">

      {/* 1. Header Section */}
      <section className="text-center max-w-3xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
          เกี่ยวกับชมรมโรบอท
        </h1>
        <p className="mt-6 text-base text-gray-500 font-medium leading-relaxed">
          ทำความรู้จักกับอาจารย์ที่ปรึกษา ทีมงานคณะกรรมการบริหาร และสถานที่ตั้งของพวกเรา <br />
          คณะวิศวกรรมศาสตร์ มหาวิทยาลัยนเรศวร
        </p>
      </section>

      {/* 2. Advisors Poster Section (โปสเตอร์คณะอาจารย์ที่ปรึกษา) */}
      <section className="flex flex-col items-center gap-10 border-t border-gray-100 pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
            <Users className="inline-block w-8 h-8 mr-2 text-gray-900" /> คณะอาจารย์ที่ปรึกษาชมรม
          </h2>
          <p className="text-sm text-gray-400 font-semibold mt-1">
            โปสเตอร์รวมทำเนียบอาจารย์ผู้ดูแลและให้การสนับสนุนทางวิชาการ
          </p>
        </div>

        {/* Advisor Poster Placeholder (Landscape / standard ratio) */}
        <div className="w-full max-w-4xl rounded-3xl border border-gray-200 bg-white p-6 shadow-md flex flex-col items-center text-center group">
          <div className="w-full aspect-[4/3] rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-gray-400 font-bold text-sm gap-4 group-hover:bg-gray-100/50 transition-colors duration-200">
            <svg className="h-14 w-14 text-gray-300 transition-transform duration-300 group-hover:scale-105" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11l3 3m0 0l-3 3m3-3H8" />
            </svg>

            <div className="flex flex-col gap-1.5">
              <span className="text-base md:text-lg text-gray-700 flex items-center justify-center gap-1.5"><ImageIcon className="w-5 h-5" /> โปสเตอร์คณะอาจารย์ที่ปรึกษาชมรม</span>
              <span className="text-xs text-gray-400 font-semibold leading-relaxed">
                (คณาจารย์ผู้ดูแลชมรมโรบอท คณะวิศวกรรมศาสตร์)
              </span>
            </div>

            <span className="bg-gray-200/70 text-gray-600 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 shrink-0" /> ขนาดแนะนำ: อัตราส่วนแนวนอน 4:3 (เช่น 1200 x 900 px) หรือสัดส่วน 16:9
            </span>
          </div>
        </div>
      </section>

      {/* 3. Executive Board Poster Section (โปสเตอร์คณะกรรมการบริหารชมรม) */}
      <section className="flex flex-col items-center gap-10 border-t border-gray-100 pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
            <UserCheck className="inline-block w-8 h-8 mr-2 text-gray-900" /> ทีมบริหารชมรม
          </h2>
          <p className="text-sm text-gray-400 font-semibold mt-1">
            โปสเตอร์ผังโครงสร้างคณะทำงานหลักและฝ่ายปฏิบัติการของนิสิตชมรม
          </p>
        </div>

        {/* Board Poster Placeholder (Portrait / A4 ratio) */}
        <div className="w-full max-w-4xl rounded-3xl border border-gray-200 bg-white p-6 shadow-md flex flex-col items-center text-center group">
          <div className="w-full aspect-[1/1.414] rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-gray-400 font-bold text-sm gap-4 group-hover:bg-gray-100/50 transition-colors duration-200">
            <svg className="h-14 w-14 text-gray-300 transition-transform duration-300 group-hover:scale-105" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-3c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-3c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>

            <div className="flex flex-col gap-1.5">
              <span className="text-base md:text-lg text-gray-700 flex items-center justify-center gap-1.5"><ImageIcon className="w-5 h-5" /> โปสเตอร์ผังโครงสร้างคณะกรรมการบริหารชมรม</span>
              <span className="text-xs text-gray-400 font-semibold leading-relaxed">
                (ฝ่ายบริหาร ฝ่ายวิชาการ ฝ่ายพัสดุ ฝ่ายประชาสัมพันธ์ และทีมงานนิสิต)
              </span>
            </div>

            <span className="bg-gray-200/70 text-gray-600 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 shrink-0" /> ขนาดแนะนำ: อัตราส่วน A4 แนวตั้ง (1 : 1.414) หรือสัดส่วน 3:4 (เช่น 1200 x 1700 px)
            </span>
          </div>
        </div>
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
        <div className="rounded-3xl border border-gray-200/60 bg-white p-6 md:p-10 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

          {/* Left Block: Text Address details */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest block">
              CLUBHOUSE LOCATION
            </span>
            <h3 className="text-2xl font-black text-gray-900 leading-tight">
              ห้องชมรม NU Robot Club
            </h3>
            <p className="text-base text-gray-600 font-medium leading-relaxed mt-2">
              <DoorOpen className="inline w-4 h-4 text-gray-400 mr-1" /> ชั้น 7 ห้อง EE701 อาคารวิศกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ <br />
              มหาวิทยาลัยนเรศวร ต.ท่าโพธิ์ อ.เมือง จ.พิษณุโลก 65000
            </p>
          </div>

          {/* Right Block: Contacts & Social buttons */}
          <div className="flex flex-col gap-4 md:border-l md:border-gray-100 md:pl-8">
            <div className="text-gray-700 font-bold text-sm">
              <MessageCircle className="inline w-4 h-4 text-gray-400 mr-1" /> ช่องทางการติดต่อชมรม:
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Facebook Link */}
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

              {/* Instagram Link */}
              <a
                href="https://www.instagram.com/nurobotclub_official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
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
        <div className="flex flex-col gap-8">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Map className="w-6 h-6 text-gray-900" /> คู่มือการเดินทางไปห้องชมรมทีละขั้นตอน
            </h3>
            <p className="text-sm text-gray-400 font-semibold mt-1">
              คำแนะนำพร้อมภาพประกอบสำหรับการเดินทางมายังห้อง EE701 ชั้น 7 (ทั้งหมด 10 ขั้นตอน)
            </p>
          </div>

          {/* Responsive grid that displays cards in 3 columns for huge visual clarity */}
          <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-5xl">
            {routeSteps.map((stepItem, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-4 group hover:border-orange-500/20 transition-all duration-300"
              >
                {/* 16:9 Image Placeholder (Wider & Proportional taller) */}
                <div className="w-full aspect-[16/9] rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4 text-gray-400 font-bold text-[10px] gap-2.5 group-hover:bg-gray-100/50 transition-colors duration-200 relative overflow-hidden">
                  {/* Step Orange Badge */}
                  <span className="absolute top-3 left-3 bg-orange-500 text-white font-black text-[9px] px-2.5 py-1 rounded-md leading-none shadow-sm tracking-wider">
                    {stepItem.step}
                  </span>

                  {stepItem.icon}

                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stepItem.title}</span>
                  <span className="bg-gray-200/60 text-gray-600 px-2 py-0.5 rounded text-[8px] font-medium leading-none">
                    แนะนำ: 800 x 450 px
                  </span>
                </div>

                {/* Description details */}
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
