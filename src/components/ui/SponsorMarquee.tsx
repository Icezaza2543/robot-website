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
    <div className="w-full bg-white border-t border-gray-100 py-12 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-6 md:px-8 text-center mb-8">
        <h3 className="text-sm font-black tracking-widest text-gray-400 uppercase">
          ได้รับการสนับสนุนโดย
        </h3>
      </div>
      
      {/* Marquee Container - no fade overlays */}
      <div className="flex w-[200%] sm:w-[150%] md:w-[100%] animate-marquee">
        <div className="flex shrink-0 items-center justify-around gap-12 sm:gap-20 md:gap-32 w-full">
          {marqueeItems.map((sponsor, idx) => (
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
