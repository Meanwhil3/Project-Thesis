"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ChevronLeft,
  FileText,
  Youtube,
  Download,
  Loader2,
  PlayCircle,
  FileCheck,
  FolderOpen,
  Sparkles,
  Clock,
  Layers,
  CheckCircle2,
} from "lucide-react";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function LessonDetailPage() {
  const router = useRouter();
  const { courseId, lessonId } = useParams();

  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd]">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600 animate-pulse" size={32} />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fcfcfd] font-kanit">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 inline-flex p-6 bg-red-50 text-red-500 rounded-3xl">
            <FileText size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">ไม่พบเนื้อหา</h2>
          <p className="text-slate-500 mb-8">บทเรียนที่คุณต้องการอาจถูกลบหรือย้ายที่อยู่แล้ว</p>
          <button onClick={() => router.back()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
            กลับไปที่หลักสูตร
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-kanit text-slate-900 selection:bg-green-100 selection:text-green-700">
      {/* --- Sticky Header --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-[1440px] mx-auto px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-900"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />
            <nav className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-slate-400">Courses</span>
              <ChevronLeft size={14} className="rotate-180 text-slate-300" />
              <span className="font-semibold text-slate-700 truncate max-w-[200px]">{lesson.courseName}</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden lg:flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold border border-green-100">
                <Sparkles size={14} />
                <span>Premium Lesson</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="grid grid-cols-12 gap-8 items-start"> {/* เพิ่ม items-start เพื่อให้ sticky ทำงานได้ดีขึ้น */}
          
          {/* --- Main Content (Left) --- */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            
            {/* Hero Section */}
            <article className="bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                   <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                     Chapter 01
                   </div>
                   <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                     <Clock size={14} />
                     <span>อ่านประมาณ 15 นาที</span>
                   </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight leading-tight">
                  {lesson.title}
                </h1>

                <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed
                  prose-headings:text-slate-900 prose-headings:font-bold prose-strong:text-slate-900 prose-strong:font-bold
                  prose-img:rounded-3xl prose-a:text-green-600">
                  <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </div>
              </div>
            </article>

            {/* Video Playlist Section */}
            {lesson.videos?.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-end justify-between px-2">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                        <Youtube size={24} />
                      </div>
                      วิดีโอบทเรียน
                    </h2>
                    <p className="text-slate-500 mt-1">เจาะลึกเนื้อหาผ่านคลิปวิดีโอคุณภาพสูง</p>
                  </div>
                  <span className="text-sm font-bold text-slate-400">{lesson.videos.length} Videos</span>
                </div>

                <div className="grid gap-6">
                  {lesson.videos.map((vid: any, idx: number) => (
                    <div key={idx} className="group bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                      <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6">
                        <div className="md:w-2/5 aspect-video rounded-2xl overflow-hidden relative shadow-inner bg-slate-100">
                           <ReactPlayer url={vid.url} width="100%" height="100%" controls />
                        </div>
                        <div className="md:w-3/5 flex flex-col justify-center">
                          <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-green-600 transition-colors">
                            {vid.title}
                          </h3>
                          <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                            วิดีโอนี้จะช่วยให้คุณเข้าใจพื้นฐานและการประยุกต์ใช้งานในบทเรียนนี้ได้อย่างละเอียด...
                          </p>
                          <div className="flex items-center gap-2 mt-auto">
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                               <PlayCircle size={18} />
                             </div>
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Now Playing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --- Sidebar (Right) - แก้ไขส่วน Sticky ตรงนี้ --- */}
          <aside className="col-span-12 lg:col-span-4 h-full">
            <div className="sticky top-24 space-y-6"> {/* top-24 เพื่อหลบ Header */}
              
              {/* Action Card: เอกสารดาวน์โหลด */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-800">เอกสารประกอบ</h3>
                  <Layers className="text-slate-300" size={20} />
                </div>

                <div className="space-y-3">
                  {lesson.documents?.length > 0 ? (
                    lesson.documents.map((doc: any) => (
                      <a
                        key={doc.id}
                        href={doc.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-green-200 hover:bg-green-50/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-green-600 transition-colors">
                            <FileCheck size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 truncate max-w-[140px] uppercase">{doc.name}</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase">{doc.type}</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm">
                          <Download size={16} />
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <FolderOpen className="mx-auto mb-4 text-slate-200" size={40} />
                      <p className="text-slate-400 text-sm italic font-medium">ยังไม่มีเอกสารในบทนี้</p>
                    </div>
                  )}
                </div>
              </div>

              

            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}