"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Newspaper, Lightbulb, Inbox, Camera, PenLine, Calendar, Zap, ExternalLink } from "lucide-react";
import SponsorMarquee from "@/components/ui/SponsorMarquee";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  imageUrl: string;
  igLink: string;
}

export default function HomePage() {
  const [selectedPost, setSelectedPost] = useState<NewsItem | null>(null);
  const [blogPosts, setBlogPosts] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBlogPosts(data);
        setIsLoadingNews(false);
      })
      .catch(err => {
        console.error("Failed to fetch news", err);
        setIsLoadingNews(false);
      });
  }, []);

  return (
    <div className="flex flex-col gap-24 pb-24 relative">
      {/* 1. Hero Section (100% Focused on NU Robot Club Web Blog) */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8 text-center relative z-10 flex flex-col items-center">
          {/* Heading */}
          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-6xl max-w-5xl leading-tight">
            NU Robot Club <br className="hidden sm:inline" />
            <span className="text-orange-500">Web Blog</span> & News Update
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-lg md:text-xl font-medium text-gray-500 max-w-2xl leading-relaxed">
            บันทึกเรื่องราวการเรียนรู้ แชร์ไอเดียทำโปรเจกต์ และอัปเดตกิจกรรมสนุกๆ <br className="hidden sm:inline" />
            ของพวกเรานิสิตชมรมโรบอท คณะวิศวกรรมศาสตร์ มหาวิทยาลัยนเรศวร
          </p>

          {/* Action CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <a
              href="#blog-posts"
              className="w-full sm:w-auto rounded bg-gray-900 hover:bg-orange-500 px-8 py-4 text-lg font-bold text-white shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Newspaper className="w-5 h-5" />
              อ่านบทความล่าสุด
            </a>

            <Link
              href="/about"
              className="w-full sm:w-auto rounded border border-gray-200 bg-white hover:bg-gray-50 px-8 py-4 text-lg font-bold text-gray-700 shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Lightbulb className="w-5 h-5" />
              ทำความรู้จักกับชมรม
            </Link>
          </div>
        </div>


      </section>

      {/* 2. Blog Posts & Announcements Section */}
      <section id="blog-posts" className="mx-auto w-full max-w-7xl px-6 md:px-8 scroll-mt-24">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-100 pb-6 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Newspaper className="w-8 h-8 text-orange-500" />
                บทความ ข่าวสาร และกิจกรรมล่าสุด
              </h2>
              <p className="text-gray-500 text-sm mt-2 font-medium">
                ร่วมศึกษาองค์ความรู้เทคโนโลยีทางวิศวกรรม ติดตามกิจกรรมอบรมความรู้ และโปรเจกต์นวัตกรรมจากชมรม
              </p>
            </div>
            <span className="text-xs text-gray-400 font-bold self-start sm:self-center bg-gray-100 px-3 py-1 rounded-full">
              อัปเดตล่าสุด: {blogPosts.length > 0 ? blogPosts[0].date : "ไม่มีบทความใหม่"}
            </span>
          </div>

          {/* Render Active News Grid dynamically imported from src/constants/news.ts */}
          {blogPosts.length === 0 ? (
            <div className="rounded border border-dashed border-gray-200 bg-white py-20 text-center flex flex-col items-center">
              <Inbox className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700">ขณะนี้ยังไม่มีบทความหรือข่าวสารประชาสัมพันธ์</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-sm leading-relaxed font-semibold">
                ติดตามข่าวคราว กิจกรรมอบรมเชิงปฏิบัติการ และความเคลื่อนไหวโปรเจกต์ IoT/Embedded นวัตกรรมของชมรมได้ที่นี่เร็ว ๆ นี้ครับ!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {blogPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="flex flex-col justify-between rounded border border-gray-200 bg-white hover:border-gray-300 transition-colors cursor-pointer overflow-hidden"
                >
                  {/* Post Banner Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100 border-b border-gray-100">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="h-full w-full object-contain" />
                    ) : post.igLink ? (
                      <div className="w-full h-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center">
                         <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm shadow-lg">
                           <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                             <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                           </svg>
                         </div>
                      </div>
                    ) : (
                      <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60" alt={post.title} className="h-full w-full object-cover" />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-xs border border-gray-200/50 text-orange-600 px-3 py-1.5 rounded-full shadow-xs">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-gray-800 leading-snug group-hover:text-orange-500 transition-colors duration-200">
                        {post.title}
                      </h3>

                      <p className="text-xs text-gray-500 mt-3 leading-relaxed line-clamp-3 font-semibold">
                        {post.summary}
                      </p>
                    </div>

                    <div className="border-t border-gray-50 pt-4 mt-6 flex items-center justify-between text-[11px] text-gray-400 font-bold">
                      <div className="flex items-center gap-1"><PenLine className="w-3 h-3" /> โดย: <span className="text-gray-600">{post.author}</span></div>
                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Sponsor Marquee Section */}
      <SponsorMarquee />

      {/* 4. Article Reader Modal Popup */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[90vh] rounded-lg border border-gray-200 bg-white shadow-xl flex flex-col overflow-hidden relative transition-all duration-200 animate-in zoom-in-95">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 right-5 z-20 flex h-8 w-8 items-center justify-center rounded bg-white/90 border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-xl font-bold"
              title="ปิดหน้าต่างอ่านบทความ"
            >
              &times;
            </button>

            {/* Scrollable Container */}
            <div className="overflow-y-auto flex-1 scrollbar-thin">
              
              {/* Image Banner Header with soft fading blend */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-gray-100 shrink-0">
                {selectedPost.imageUrl ? (
                  <img src={selectedPost.imageUrl} alt={selectedPost.title} className="h-full w-full object-contain" />
                ) : selectedPost.igLink ? (
                  <div className="w-full h-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex flex-col items-center justify-center gap-4">
                     <div className="bg-white/20 p-5 rounded-full backdrop-blur-sm shadow-xl">
                       <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                       </svg>
                     </div>
                     <span className="text-white font-black uppercase tracking-widest text-sm bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">Instagram Post</span>
                  </div>
                ) : (
                  <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60" alt={selectedPost.title} className="h-full w-full object-cover" />
                )}
                {/* Dynamic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-transparent to-black/10" />
                
                {/* Floating Tag */}
                <div className="absolute bottom-5 left-6 sm:left-8">
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white px-3.5 py-1.5 rounded-xl shadow-lg shadow-orange-500/20">
                    {selectedPost.category}
                  </span>
                </div>
              </div>

              {/* Modal Body Container */}
              <div className="px-6 sm:px-8 pb-8 pt-2 space-y-6">
                
                {/* Premium Author & Meta Banner */}
                <div className="flex flex-wrap gap-4 items-center justify-between py-4 border-y border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-orange-500/20">
                      {selectedPost.author.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-gray-400 block uppercase tracking-widest">ผู้ประพันธ์</span>
                      <span className="text-xs font-black text-gray-800 leading-none">{selectedPost.author}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-[10px] font-bold text-gray-400">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> วันเผยแพร่: {selectedPost.date}</span>
                  </div>
                </div>

                {/* Article Content Layout */}
                <div className="space-y-5">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug tracking-tight">
                    {selectedPost.title}
                  </h3>

                  {/* Summary Callout Box */}
                  <p className="text-xs text-orange-900 leading-relaxed font-bold border-l-4 border-orange-500 pl-4 bg-orange-50/40 p-4 rounded-r-2xl border-y border-r border-orange-100/20 flex gap-2">
                    <Lightbulb className="w-4 h-4 shrink-0 text-orange-500 mt-0.5" />
                    <span>**บทสรุปสังเขป**: {selectedPost.summary}</span>
                  </p>

                  {/* Main Rich Text Content */}
                  <div className="text-sm text-gray-600 leading-relaxed font-semibold space-y-4 pt-2">
                    {selectedPost.content.split("\n\n").map((paragraph, index) => {
                      // Check if it represents a custom bullet point list
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
                                    <Zap className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
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

                  {/* Instagram Embed (If available) */}
                  {selectedPost.igLink && (
                    <div className="pt-6 border-t border-gray-100 flex flex-col items-center">
                      <a href={selectedPost.igLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 mb-4 text-xs font-bold text-orange-500 hover:text-orange-600">
                        <ExternalLink className="w-4 h-4" /> ดูโพสต์บน Instagram ต้นฉบับ
                      </a>
                      <iframe 
                        src={(() => {
                          try {
                            const url = new URL(selectedPost.igLink);
                            url.search = '';
                            let pathname = url.pathname;
                            if (!pathname.endsWith('/')) pathname += '/';
                            return `${url.origin}${pathname}embed`;
                          } catch (e) {
                            return selectedPost.igLink;
                          }
                        })()} 
                        width="100%" 
                        height="550" 
                        frameBorder="0" 
                        scrolling="no" 
                        allowTransparency={true}
                        className="rounded-xl border border-gray-200 max-w-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="px-6 sm:px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedPost(null)}
                className="rounded-2xl bg-gray-950 hover:bg-orange-500 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer active:scale-95"
              >
                เสร็จสิ้นการอ่านข่าวสาร
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
