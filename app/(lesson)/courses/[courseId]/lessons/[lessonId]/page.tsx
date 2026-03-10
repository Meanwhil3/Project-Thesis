"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Download,
  Loader2,
  User,
  Calendar,
  BookOpen,
  Video,
  ExternalLink,
  Youtube,
  FileArchive,
  MonitorPlay,
} from "lucide-react";

export default function LessonDetailPage() {
  const router = useRouter();
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#14532D]" size={40} />
      </div>
    );

  if (!lesson)
    return (
      <div className="p-10 text-center font-kanit text-[#14532D]">
        ไม่พบบทเรียน
      </div>
    );

  return (
    <div className="min-h-screen font-kanit">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        {/* Header */}
        <div className="mb-7">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-[#CDE3BD] bg-white px-3 py-2 text-sm font-medium text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/50 transition hover:bg-[#F6FBF6] active:scale-[0.99]"
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </button>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#14532D]">
            {lesson.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#6E8E59]">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{lesson.authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatDateThai(lesson.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main Content */}
          <div className="min-w-0 space-y-6">
            {/* Lesson Content */}
            <SectionCard title="เนื้อหาบทเรียน" icon={BookOpen}>
              <div
                className="prose prose-slate max-w-none
                  prose-p:text-[#3A532D] prose-p:leading-8 prose-p:text-[15px]
                  prose-headings:text-[#14532D] prose-headings:font-bold
                  prose-strong:text-[#14532D] prose-strong:font-bold
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-a:text-[#0C6E30] prose-a:font-semibold prose-a:underline-offset-4"
              >
                <div
                  className="lesson-content"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </div>
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Videos */}
            <SectionCard title="วิดีโอบทเรียน" icon={MonitorPlay}>
              <div className="space-y-3">
                {lesson.videos?.length > 0 ? (
                  lesson.videos.map((vid: any, idx: number) => {
                    const isYT = isYoutubeLink(vid.url);
                    return (
                      <a
                        key={idx}
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl border border-[#CDE3BD] bg-white p-3 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              isYT
                                ? "bg-red-50 text-red-500"
                                : "bg-[#DCFCE7] text-[#14532D]"
                            }`}
                          >
                            {isYT ? (
                              <Youtube className="h-5 w-5" />
                            ) : (
                              <Video className="h-5 w-5" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-[#14532D] truncate">
                              {vid.title}
                            </p>
                            <p className="text-xs text-[#6E8E59] truncate">
                              {vid.url}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#CDE3BD] text-[#6E8E59] transition hover:text-[#14532D]">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      </a>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-[#CDE3BD] bg-[#F8FFF9] py-6 text-center text-sm text-[#6E8E59]">
                    ไม่มีวิดีโอสำหรับบทเรียนนี้
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Documents */}
            <SectionCard title="เอกสารประกอบ" icon={FileArchive}>
              <div className="space-y-2">
                {lesson.documents?.length > 0 ? (
                  lesson.documents.map((doc: any) => (
                    <a
                      key={doc.id}
                      href={doc.path}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-[#CDE3BD] bg-white p-3 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7] text-[10px] font-bold text-[#14532D]">
                          {doc.type}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-[#14532D] truncate">
                            {doc.name}
                          </p>
                          <p className="text-[11px] text-[#6E8E59]">
                            {doc.type} FILE
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#CDE3BD] text-[#6E8E59] transition hover:text-[#14532D]">
                        <Download className="h-4 w-4" />
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-[#CDE3BD] bg-[#F8FFF9] py-6 text-center text-sm text-[#6E8E59]">
                    ยังไม่มีเอกสารในบทเรียนนี้
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#CDE3BD] bg-white shadow-[0_0_4px_0_#CAE0BC]/50">
      <div className="flex items-center gap-3 border-b border-[#CDE3BD]/50 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DCFCE7] ring-1 ring-black/5">
          <Icon className="h-4 w-4 text-[#14532D]" />
        </div>
        <h2 className="text-[16px] font-semibold text-[#14532D]">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}
