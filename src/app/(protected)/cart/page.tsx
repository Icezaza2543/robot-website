"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/providers/CartProvider";
import { PartyPopper, ShoppingCart, AlertTriangle, Plug, Package, MapPin, Minus, Plus, Trash2, FileText, Save } from "lucide-react";

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  // Form States
  const [borrowerName, setBorrowerName] = useState(session?.user?.name || "");
  const [borrowerPhone, setBorrowerPhone] = useState("");
  const [note, setNote] = useState("");
  
  // Set default due date to 7 days from now
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split("T")[0];
  };
  const [dueDate, setDueDate] = useState(getDefaultDueDate());

  // UI Flow States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (cartItems.length === 0) {
      setErrorMsg("ไม่มีอุปกรณ์ในตะกร้า กรุณาเลือกของก่อนส่งคำขอยืม");
      return;
    }

    if (!borrowerName.trim() || !borrowerPhone.trim() || !dueDate) {
      setErrorMsg("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borrowerName,
          borrowerPhone,
          dueDate,
          note,
          items: cartItems,
        }),
      });

      if (res.ok) {
        const requestData = await res.json();
        setSubmittedRequest(requestData);
        clearCart(); // Clear cart items after successful submission
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.error || "เกิดข้อผิดพลาดในการส่งคำขอยืมอุปกรณ์");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (submittedRequest) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-20 sm:px-6 lg:px-8 text-center animate-in fade-in duration-300">
        <div className="rounded-3xl border border-green-100 bg-white p-8 md:p-12 shadow-xl shadow-gray-100/50 flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 shadow-sm mb-6 animate-bounce">
            <PartyPopper className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
            ส่งคำขอยืมสำเร็จแล้ว!
          </h2>
          <p className="text-sm font-semibold text-gray-400 mt-2 uppercase tracking-wider">
            รหัสอ้างอิงคำขอ: <span className="text-orange-500 font-black">{submittedRequest.id}</span>
          </p>

          <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-100 w-full text-left flex flex-col gap-3.5 text-sm font-semibold text-gray-600">
            <div>
              <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">ผู้ยื่นคำขอยืม</span>
              <span className="text-gray-800 font-extrabold text-[15px]">{submittedRequest.borrowerName}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">เบอร์โทรศัพท์</span>
                <span className="text-gray-800 font-extrabold">{submittedRequest.borrowerPhone}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">กำหนดคืน</span>
                <span className="text-gray-800 font-extrabold">{submittedRequest.dueDate}</span>
              </div>
            </div>
            <div className="border-t border-slate-200/60 pt-3">
              <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider mb-1.5">สถานะใบคำขอ</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-black bg-yellow-50 border border-yellow-200/50 text-yellow-600 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                รออนุมัติ (Pending)
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 font-bold mt-6 leading-relaxed max-w-sm">
            ระบบจัดเก็บประวัติและคลังข้อมูล Google Sheets ของคุณได้รับการบันทึกเรียบร้อย แอดมินหลักของชมรมจะเข้าตรวจสอบและส่งการอนุมัติต่อไปครับ!
          </p>

          <button
            onClick={() => router.push("/equipment")}
            className="w-full mt-8 rounded-2xl bg-gray-900 hover:bg-orange-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-gray-900/10 hover:shadow-orange-500/20 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            กลับสู่คลังเพื่อเลือกยืมอุปกรณ์เพิ่ม
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-8 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5">
          <ShoppingCart className="w-4 h-4" />
          <span>ตะกร้าสะสมรายการคลังอุปกรณ์</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">
          ตรวจสอบและยื่นคำขอยืม
        </h1>
        <p className="text-sm font-semibold text-gray-400 mt-1">
          ทบทวนจำนวนบอร์ดไมโครคอนโทรลเลอร์ ไอซี หรือเซนเซอร์ต่างๆ และกรอกข้อมูลติดต่อเพื่อยื่นคำขออนุมัติ
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50/50 p-4 text-sm font-bold text-red-600 flex items-center gap-2 animate-shake">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {cartItems.length === 0 ? (
        // Empty Cart State
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-24 text-center flex flex-col items-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 mb-5" />
          <h3 className="text-xl font-bold text-gray-700 mt-5">ตะกร้ายืมอุปกรณ์ยังว่างอยู่</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed font-semibold">
            คุณยังไม่ได้เลือกบอร์ดทดลองหรือโมดูลใดๆ เข้ารายการยื่นยืมคราวนี้เลยครับ
          </p>
          <Link
            href="/equipment"
            className="inline-flex mt-8 rounded-2xl bg-orange-500 hover:bg-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 active:scale-95 cursor-pointer items-center gap-2"
          >
            <Plug className="w-4 h-4" /> ไปเปิดดูคลังวัสดุอุปกรณ์
          </Link>
        </div>
      ) : (
        // Live Cart Content
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-gray-400" /> รายการที่คุณเลือกไว้ ({cartItems.length} ชิ้น)
            </h3>

            <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm flex flex-col divide-y divide-gray-100">
              {cartItems.map((item) => {
                const isMaxStock = item.quantity >= item.stock;
                const isMinStock = item.quantity <= 1;

                return (
                  <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50/30 transition-colors duration-200">
                    {/* Item Metadata */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-200/40 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">
                          ID: {item.id}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-gray-800 tracking-tight leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-400 font-bold mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" /> จัดเก็บ: {item.location}
                      </p>
                    </div>

                    {/* Quantity selectors and deletion */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-gray-50 pt-3 sm:border-0 sm:pt-0">
                      {/* Quantity selector buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isMinStock}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer active:scale-90"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <div className="w-10 text-center font-black text-gray-800 text-sm">
                          {item.quantity}
                        </div>

                        <button
                          type="button"
                          disabled={isMaxStock}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer active:scale-90"
                          title={isMaxStock ? "เลือกยืมได้ไม่เกินจำนวนที่เหลืออยู่ในคลัง" : "เพิ่มชิ้น"}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Delete item button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 active:scale-90 transition-all duration-200 cursor-pointer"
                        title="ลบสิ่งของออกจากตะกร้า"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Submission Details Form */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-gray-400" /> รายละเอียดและข้อมูลติดต่อผู้ยืม
            </h3>

            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xl shadow-gray-100/50 flex flex-col">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Borrower Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    ชื่อ-นามสกุลจริงผู้ยืม *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="กรอกชื่อ-นามสกุลจริงของคุณ"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                  />
                </div>

                {/* Borrower Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    เบอร์โทรศัพท์ติดต่อ *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="เช่น 089-XXXXXXX"
                    value={borrowerPhone}
                    onChange={(e) => setBorrowerPhone(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                  />
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    วันกำหนดส่งคืนอุปกรณ์ *
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                  />
                </div>

                {/* Optional Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    วัตถุประสงค์การยืม / บันทึกเพิ่มเติม
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ระบุว่ายืมไปทำโครงงานชิ้นไหน คอร์สอะไร หรือข้อมูลจำเพาะอื่นๆ"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition resize-none"
                  />
                </div>

                {/* Disclaimer */}
                <div className="rounded-2xl bg-orange-50/50 border border-orange-100 p-3 text-[10px] font-semibold text-gray-500 leading-relaxed">
                  <AlertTriangle className="w-3 h-3 shrink-0 inline mr-1 text-orange-500" /> **เงื่อนไขสำคัญ**: การส่งคำขอยืมนี้เป็นการแจ้งเรื่องบันทึกลงฐานข้อมูล Google Sheet เพื่อรอรับสิทธิ์ตรวจสอบและอนุมัติจากผู้รับผิดชอบคลังชมรม ขอให้ท่านตรวจสอบสิ่งของและดูแลรักษาให้อยู่ในสภาพดีเสมอครับ
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className="rounded-2xl bg-orange-500 hover:bg-orange-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>กำลังส่งคำขออนุมัติ...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>ยืนยันส่งคำขอยืมอุปกรณ์</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
