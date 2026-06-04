import Link from "next/link";
import { Shield, ChevronLeft, Lock, Database, Eye, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | NU Robot Club",
  description: "นโยบายความเป็นส่วนตัวของชมรมหุ่นยนต์มหาวิทยาลัยนเรศวร",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center relative">
          <Link 
            href="/"
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-sm font-bold text-gray-500 hover:text-orange-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> กลับหน้าหลัก
          </Link>
          <div className="w-16 h-16 bg-orange-100 rounded-3xl mx-auto flex items-center justify-center mb-6 rotate-3">
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="text-gray-500 font-medium">
            (Privacy Policy) ฉบับล่าสุดแก้ไขเมื่อ: {new Date().toLocaleDateString("th-TH")}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-10">
          
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-black text-gray-900">1. ข้อมูลที่เราเก็บรวบรวม</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              เราเก็บรวบรวมข้อมูลส่วนบุคคลของคุณเพื่อให้สามารถให้บริการและปรับปรุงประสบการณ์การใช้งานระบบยืม-คืนอุปกรณ์ของชมรม โดยข้อมูลที่เราเก็บประกอบด้วย:
            </p>
            <ul className="space-y-3">
              {[
                "ชื่อ-นามสกุล, ชื่อเล่น และรหัสนิสิต",
                "คณะ สาขาวิชา และชั้นปี",
                "เบอร์โทรศัพท์มือถือ หรือข้อมูลติดต่อ (เช่น Instagram)",
                "ข้อมูลบัญชีอีเมล (สำหรับการเข้าสู่ระบบผ่าน Google)",
                "ประวัติการยืม-คืนอุปกรณ์"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-black text-gray-900">2. การนำข้อมูลไปใช้</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              เรานำข้อมูลของคุณไปใช้เพื่อวัตถุประสงค์ในการยืนยันตัวตนสำหรับสมาชิกระบบยืม-คืนอุปกรณ์ การติดต่อสื่อสารเมื่ออุปกรณ์ถึงกำหนดคืน และการแสดงผลบนหน้าบัตรประจำตัว (ID Card) ของชมรม โดยเราจะไม่มีการนำข้อมูลของคุณไปใช้เพื่อการโฆษณาหรือจำหน่ายให้แก่บุคคลที่สามโดยเด็ดขาด
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-black text-gray-900">3. การเก็บรักษาและคุกกี้ (Cookies)</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              ระบบใช้ คุกกี้ (Cookies) และ Local Storage เพื่อวัตถุประสงค์ดังต่อไปนี้:
            </p>
            <ul className="space-y-3 mb-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-gray-600"><strong className="text-gray-800">การเข้าสู่ระบบ (Authentication):</strong> เพื่อจดจำสถานะการล็อกอินของคุณ ทำให้ไม่ต้องล็อกอินใหม่ทุกครั้งที่ปิดเบราว์เซอร์ (เก็บรักษาเป็นเวลา 30 วัน)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-gray-600"><strong className="text-gray-800">การตั้งค่าผู้ใช้ (Preferences):</strong> เช่น การจดจำว่าคุณได้กดยอมรับนโยบายคุกกี้ไปแล้ว</span>
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              คุณสามารถล้างคุกกี้หรือข้อมูลเหล่านี้ได้ตลอดเวลาผ่านการตั้งค่าของเว็บเบราว์เซอร์
            </p>
          </section>

          <section className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <h2 className="text-lg font-black text-gray-900 mb-2">สิทธิ์ของคุณ</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              คุณมีสิทธิ์ในการเข้าถึง ขอแก้ไข หรือขอลบข้อมูลส่วนบุคคลของคุณได้ตลอดเวลา โดยสามารถแจ้งความประสงค์ผ่านทางแผงควบคุมส่วนตัว หรือติดต่อคณะกรรมการบริหารชมรมหุ่นยนต์ มหาวิทยาลัยนเรศวร
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
