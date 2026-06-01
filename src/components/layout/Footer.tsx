import Link from "next/link"
import Image from "next/image"
import { MapPin, Heart } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-600">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 md:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">

          {/* Column 1: Brand & Socials */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Image
                src="/Robot.png"
                alt="NU Robot Club Logo"
                width={70}
                height={70}
                className="rounded-2xl shadow-md transition hover:scale-105"
              />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  NU Robot Club
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  Faculty of Engineering
                </p>
                <p className="text-sm font-medium text-gray-500">
                  Naresuan University
                </p>
              </div>
            </div>

            <p className="text-sm   leading-relaxed text-gray-500">
              ชมรมโรบอท มหาวิทยาลัยนเรศวร — แหล่งเรียนรู้ ฝึกฝน และพัฒนาระบบสมองกลฝังตัว เทคโนโลยี IoT และหุ่นยนต์เพื่ออนาคต
            </p>

            {/* Social Buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.facebook.com/nurobot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50 active:translate-y-0 hover:text-blue-600"
              >
                <svg className="h-5 w-5 fill-current text-blue-600" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
                <span>Facebook</span>
              </a>

              <a
                href="https://www.instagram.com/nurobotclub_official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50 active:translate-y-0 hover:text-pink-600"
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

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-4 md:pl-8">
            <h4 className="text-lg font-bold text-gray-800 tracking-wide">
              ลิงก์ด่วน
            </h4>
            <ul className="flex flex-col gap-3 text-sm font-medium">
              <li>
                <Link href="/" className="transition hover:text-orange-500">
                  หน้าหลัก
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition hover:text-orange-500">
                  เกี่ยวกับชมรม
                </Link>
              </li>
              <li>
                <Link href="/equipment" className="transition hover:text-orange-500">
                  ระบบยืมอุปกรณ์
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-orange-500">
                  เข้าสู่ระบบ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Location & Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-bold text-gray-800 tracking-wide">
              การติดต่อ & สถานที่
            </h4>
            <div className="flex flex-col gap-4">
              {/* Premium Styled Location Card */}
              <div className="flex items-start gap-3 rounded-2xl border border-gray-200/60 bg-white p-4 text-xs md:text-sm font-medium text-gray-500 shadow-sm leading-relaxed max-w-sm">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-gray-900 block mb-1 font-bold text-sm">ห้องชมรม NU Robot Club</strong>
                  <span className="block text-gray-500">
                    ชั้น 7 ห้อง EE701 อาคารวิศวกรรมไฟฟ้าและคอมพิวเตอร์ <br />
                    คณะวิศวกรรมศาสตร์ มหาวิทยาลัยนเรศวร <br />
                    ต.ท่าโพธิ์ อ.เมือง จ.พิษณุโลก 65000
                  </span>
                </div>
              </div>

              <Link
                href="/about#location"
                className="flex items-center gap-3 rounded-2xl border border-gray-200/60 bg-white p-4 text-xs md:text-sm font-bold text-orange-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-50/30 active:translate-y-0 active:scale-[0.98] max-w-sm hover:border-orange-500/20 group"
              >
                <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>คลิกดูที่ตั้งห้องชมรม</span>
              </Link>

            </div>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-400 font-medium">
          <p>
            &copy; {currentYear} NU Robot Club. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Handcrafted with <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> by <span className="font-semibold text-gray-600">NU Robot Club Dev Team</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
