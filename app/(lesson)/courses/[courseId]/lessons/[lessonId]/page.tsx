"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  Download,
  Loader2,
  Layers,
  User,
  Calendar,
  BookOpen,
  Video,
  ExternalLink,
  Youtube, // เพิ่ม Youtube icon
} from "lucide-react";

// Reusable Section Shell
function ContentCard({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl bg-white/85 shadow-[0_0_12px_#CAE0BC] ring-1 ring-black/5 backdrop-blur ${className}`}>
      <div className="flex items-center gap-3 px-7 py-5 sm:px-8 border-b border-[#CDE3BD]/30">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DCFCE7] ring-1 ring-black/5">
          <Icon className="h-5 w-5 text-[#14532D]" />
        </div>
        <h2 className="font-kanit text-[20px] font-medium text-[#14532D]">
          {title}
        </h2>
      </div>
      <div className="px-7 py-7 sm:px-8">{children}</div>
    </section>
  );
}

export default function LessonDetailPage() {
  const router = useRouter();
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันเช็คว่าเป็น YouTube Link หรือไม่
  const isYoutubeLink = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const formatDateThai = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("th-TH", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const fetchLesson = useCallback(async () => {
    if (!courseId || !lessonId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setLesson(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  if (isLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center ">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#DCFCE7] border-t-[#14532D] rounded-full animate-spin"></div>
          <Loader2 className="absolute text-[#14532D] animate-pulse" size={24} />
        </div>
        <p className="mt-4 font-kanit text-[#6E8E59] animate-pulse">กำลังเตรียมบทเรียน...</p>
      </div>
    );

  if (!lesson) return <div className="p-10 text-center font-kanit text-[#14532D]">ไม่พบบทเรียน</div>;

  return (
    <div className="min-h-screen font-kanit text-[#14532D] selection:bg-[#DCFCE7] selection:text-[#14532D]">
      <div className="max-w-[1400px] mx-auto px-4 pt-8 pb-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="flex items-center gap-3 text-sm text-[#6E8E59] mb-6">
          <button
            onClick={() => router.back()}
            className="group flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:bg-[#F6FBF6] hover:text-[#14532D]"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 font-medium">
            <span>คอร์สทั้งหมด</span>
            <span className="text-[#CDE3BD]">/</span>
            <span className="text-[#14532D] truncate max-w-[200px]">{lesson.courseName}</span>
          </div>
        </nav>

        <main className="grid grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <article className="rounded-[32px] bg-white/90 shadow-[0_8px_30px_rgb(202,224,188,0.3)] ring-1 ring-black/5 backdrop-blur-sm overflow-hidden border border-white">
              <div className="p-8 sm:p-12">
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#14532D] text-xs font-bold mb-4 ring-1 ring-[#14532D]/10">
                    <BookOpen size={14} />
                    <span>เนื้อหาบทเรียน</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#14532D] leading-[1.2] tracking-tight mb-1">
                    {lesson.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-[14px] text-[#6E8E59] border-b border-[#CDE3BD]/40 pt-1 pb-5">
                    <div className="flex items-center gap-2 bg-[#F8FFF9] px-3 py-1.5 rounded-xl ring-1 ring-[#CDE3BD]/50">
                      <User size={16} className="text-[#14532D]" />
                      <span className="font-semibold text-[#14532D]">{lesson.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{formatDateThai(lesson.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none 
                    prose-p:text-[#3A532D] prose-p:leading-8 prose-p:text-[17px]
                    prose-headings:text-[#14532D] prose-headings:font-bold
                    prose-strong:text-[#14532D] prose-strong:font-bold
                    prose-img:rounded-3xl prose-img:shadow-lg
                    prose-a:text-[#0C6E30] prose-a:font-semibold prose-a:underline-offset-4">
                  <div 
                    className="lesson-content"
                    dangerouslySetInnerHTML={{ __html: lesson.content }} 
                  />
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-8">
            
            {/* เอกสารประกอบ */}
            <ContentCard title="เอกสารประกอบ" icon={Layers}>
              <div className="grid gap-3">
                {lesson.documents?.length > 0 ? (
                  lesson.documents.map((doc: any) => (
                    <a
                      key={doc.id}
                      href={doc.path}
                      download // เพิ่มเพื่อให้ Browser สั่ง Download แทนการเปิดเฉยๆ ในบางประเภทไฟล์
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-22px_rgba(20,83,45,0.45)] hover:bg-[#F6FBF6]"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#14532D] ring-1 ring-black/5 transition-colors group-hover:bg-[#14532D] group-hover:text-white">
                          <FileText size={22} />
                        </div>
                        <div className="min-w-0 font-kanit">
                          <p className="truncate text-[15px] font-semibold text-[#14532D] uppercase">
                            {doc.name}
                          </p>
                          <p className="text-[11px] font-bold text-[#6E8E59] tracking-widest mt-0.5 uppercase">
                            {doc.type} FILE
                          </p>
                        </div>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#CDE3BD] bg-white text-[#14532D] shadow-sm transition group-hover:bg-[#14532D] group-hover:text-white group-hover:border-[#14532D]">
                        <Download size={18} />
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#CDE3BD] bg-white/50 p-8 text-center text-sm text-[#6E8E59]">
                    ยังไม่มีเอกสารในบทเรียนนี้
                  </div>
                )}
              </div>
            </ContentCard>

            {/* วิดีโอบทเรียน */}
            <ContentCard title="วิดีโอบทเรียน" icon={Video}>
              <div className="grid gap-3">
                {lesson.videos?.length > 0 ? (
                  lesson.videos.map((vid: any, idx: number) => {
                    const isYT = isYoutubeLink(vid.url);
                    return (
                      <a
                        key={idx}
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-22px_rgba(20,83,45,0.45)] hover:bg-[#F8FFF9]"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* เปลี่ยน Icon ตามแหล่งที่มา */}
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 transition-colors ${
                            isYT 
                              ? "bg-red-50 text-red-600 ring-red-100 group-hover:bg-red-600 group-hover:text-white group-hover:ring-red-600" 
                              : "bg-blue-50 text-blue-600 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600"
                          }`}>
                            {isYT ? <Youtube size={22} /> : <Video size={22} />}
                          </div>
                          <div className="min-w-0 font-kanit">
                            <p className="truncate text-[15px] font-semibold text-[#14532D]">
                              {vid.title}
                            </p>
                            <p className={`text-[11px] font-bold tracking-widest mt-0.5 uppercase ${isYT ? "text-red-500" : "text-blue-500"}`}>
                              {isYT ? "Youtube Video" : "Video Lesson"}
                            </p>
                          </div>
                        </div>
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white shadow-sm transition group-hover:bg-white/10 ${
                          isYT ? "border-red-100 text-red-500" : "border-blue-100 text-blue-500"
                        }`}>
                          <ExternalLink size={18} />
                        </div>
                      </a>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#CDE3BD] bg-white/50 p-8 text-center text-sm text-[#6E8E59]">
                    ไม่มีวิดีโอสำหรับบทเรียนนี้
                  </div>
                )}
              </div>
            </ContentCard>

          </aside>
        </main>
      </div>
    </div>
  );
}