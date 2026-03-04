"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ChevronLeft, FileText, Youtube, 
  BookOpen, Download, Loader2, PlayCircle 
} from 'lucide-react';

// ป้องกันปัญหา Hydration ด้วยการใช้ dynamic import สำหรับ ReactPlayer
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

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
      } else {
        console.error("Failed to fetch lesson");
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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-green-600" size={40} />
    </div>
  );

  if (!lesson) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] font-kanit">
      <p className="text-xl text-slate-400 mb-4 font-medium">ไม่พบข้อมูลบทเรียนนี้</p>
      <button onClick={() => router.back()} className="text-green-600 font-bold hover:underline underline-offset-4 transition-all">
        กลับสู่หน้าหลัก
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-kanit text-slate-800">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-500 hover:text-green-600 transition-all font-medium group">
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span>ย้อนกลับ</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 mt-10 px-6">
        
        {/* คอลัมน์ซ้าย: เนื้อหา (8 ส่วน) */}
        <div className="col-span-12 lg:col-span-8 space-y-10">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-green-100 text-green-700 text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                {lesson.courseName}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-10 leading-[1.2]">
              {lesson.title}
            </h1>
            
            {/* พื้นที่แสดงเนื้อหา HTML จาก Editor */}
            <div 
              className="prose prose-slate max-w-none text-slate-600 leading-[1.8] text-lg lesson-content"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>

          {/* วิดีโอสอน */}
          {lesson.videos.length > 0 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-4 px-2">
                <div className="bg-red-500 p-3 rounded-2xl text-white shadow-lg shadow-red-100">
                  <Youtube size={24} />
                </div>
                วิดีโอเนื้อหาการเรียน
              </h2>
              <div className="grid gap-6">
                {lesson.videos.map((vid: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                    <p className="font-bold text-slate-700 mb-6 flex items-center gap-3 text-xl">
                      <PlayCircle size={24} className="text-red-500" /> {vid.title}
                    </p>
                    <div className="rounded-[2rem] overflow-hidden aspect-video bg-black shadow-inner">
                      <ReactPlayer 
                        url={vid.url} 
                        width="100%" 
                        height="100%" 
                        controls 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* คอลัมน์ขวา: Sidebar (4 ส่วน) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 sticky top-28">
            <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <BookOpen className="text-green-500" size={28} /> เอกสารประกอบ
            </h3>
            
            <div className="space-y-4">
              {lesson.documents.length > 0 ? (
                lesson.documents.map((doc: any) => (
                  <a 
                    key={doc.id}
                    href={doc.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-green-300 hover:bg-green-50 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-4 truncate">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-green-600 transition-colors shadow-inner">
                        <FileText size={24} />
                      </div>
                      <div className="truncate">
                        <p className="text-base font-bold text-slate-700 truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{doc.type}</p>
                      </div>
                    </div>
                    <Download size={20} className="text-slate-300 group-hover:text-green-600 transition-transform group-hover:scale-110" />
                  </a>
                ))
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                   <p className="text-slate-400 font-medium italic">ไม่มีไฟล์แนบเพิ่มเติม</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .lesson-content img {
          max-width: 100%;
          height: auto !important;
          border-radius: 2rem;
          margin: 3rem auto;
          display: block;
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
        }
        .lesson-content h2 {
          font-size: 2rem;
          font-weight: 900;
          color: #1e293b;
          margin: 4rem 0 2rem 0;
          border-left: 6px solid #22c55e;
          padding-left: 1.5rem;
          line-height: 1.2;
        }
      `}</style>
    </div>
  );
}