import { Metadata } from "next";
import { Crown, Calendar, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "ทำเนียบประธานชมรม | NU Robot Club",
  description: "ทำเนียบรายชื่ออดีตประธานชมรมหุ่นยนต์ มหาวิทยาลัยนเรศวร",
};

interface President {
  id: string;
  name: string;
  year: string;
  imageUrl: string;
}

// Note: Use absolute URL for fetch in Server Components during build or fetch locally.
// For static generation without a running server, it's better to use the lib directly, 
// but since we're using app router, we can just call the google sheets function directly.
import { getSheetPresidents } from "@/lib/googleSheets";

export default async function HallOfFamePage() {
  let presidents: President[] = [];
  try {
    const data = await getSheetPresidents();
    presidents = data.sort((a, b) => Number(b.year) - Number(a.year));
  } catch (err) {
    console.error("Failed to load presidents:", err);
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-orange-400/20 to-transparent blur-[120px] -z-10 rounded-full opacity-60"></div>

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-20 relative">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl shadow-orange-500/10 mb-6 border border-orange-100 ring-4 ring-white">
          <Crown className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 mb-6">
          ทำเนียบ<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">ประธานชมรม</span>
        </h1>
        <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-xl mx-auto">
          รายนามผู้บริหารและผู้นำที่ร่วมสร้างสรรค์และขับเคลื่อนชมรมโรบอท <br />คณะวิศวกรรมศาสตร์ มหาวิทยาลัยนเรศวร จากอดีตจนถึงปัจจุบัน
        </p>
      </div>

      {/* Presidents Grid / Timeline */}
      {presidents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">อยู่ระหว่างการรวบรวมข้อมูล</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {presidents.map((president, idx) => (
            <div
              key={president.id}
              className="group relative flex flex-col items-center"
            >
              {/* Year Badge (Floating) */}
              <div className="absolute -top-4 z-10 bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-black shadow-lg flex items-center gap-2 transform transition-transform group-hover:-translate-y-1">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                ปีการศึกษา {president.year}
              </div>

              {/* Card */}
              <div className="w-full bg-white rounded-[2rem] p-4 pt-12 pb-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(249,115,22,0.1)] transition-all duration-500 group-hover:-translate-y-2 flex flex-col items-center relative overflow-hidden">

                {/* Subtle Background Accent */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-50/50 to-transparent"></div>

                {/* Image */}
                <div className="relative w-36 h-36 mb-6 z-10">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-amber-300 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                  {president.imageUrl ? (
                    <img
                      src={president.imageUrl}
                      alt={president.name}
                      className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 border-4 border-white shadow-xl relative z-10 flex items-center justify-center">
                      <Crown className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="text-center z-10">
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                    {president.name}
                  </h3>
                  <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">
                    President
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
