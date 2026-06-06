"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Sponsor {
  id: string;
  url: string;
}

export default function SponsorMarquee() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await fetch("/api/sponsors");
        if (res.ok) {
          const data = await res.json();
          setSponsors(data);
        }
      } catch (error) {
        console.error("Failed to load sponsors", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  if (isLoading || sponsors.length === 0) return null;

  // Duplicate the array to create a seamless infinite scrolling effect
  const marqueeItems = [...sponsors, ...sponsors, ...sponsors, ...sponsors];

  return (
    // 1. เพิ่ม style block เพื่อกำหนด keyframes ให้กับตัว component โดยตรง
    <div className="w-full bg-white border-t border-gray-100 py-12 overflow-hidden relative">
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-6 md:px-8 text-center mb-8">
        <h1 className="text-lg font-black tracking-widest  uppercase">
          ได้รับการสนับสนุนโดย
        </h1>
      </div>

      {/* 2. ปรับ Container ให้เป็น flex ปกติ โดยไม่ต้องกำหนด w-[200%] */}
      <div className="flex overflow-hidden">
        <div className="flex animate-marquee shrink-0 gap-12 sm:gap-20 md:gap-32 px-6">
          {/* 3. ใช้ [...sponsors, ...sponsors] เพื่อให้ลูปเนียน */}
          {[...sponsors, ...sponsors].map((sponsor, idx) => (
            <div key={`${sponsor.id}-${idx}`} className="flex-shrink-0 hover:scale-105 transition-transform duration-300 w-32 h-16 md:w-48 md:h-24">
              <img
                src={sponsor.url}
                alt={`Sponsor ${idx}`}
                className="object-contain w-full h-full"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
