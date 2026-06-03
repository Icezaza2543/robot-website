"use client";

import { ProfileCard, UserRank } from "@/components/ui/ProfileCard";

export default function CardDemoPage() {
  const ranks: UserRank[] = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center py-16">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Profile Card Ranks</h1>
        <p className="text-gray-500 mb-10">ตัวอย่างการ์ดโปรไฟล์แต่ละระดับ (ยึดตาม Design System ที่เน้นความสว่างและสะอาดตา)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ranks.map((rank, i) => (
            <ProfileCard
              key={rank}
              user={{
                name: "Nicky Supanat",
                studentId: "6536000" + (i + 1),
                rank: rank,
                role: "Software Engineering Student",
                points: 2500 * (i + 1),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
