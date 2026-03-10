"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  ArrowLeft, Trash2, Plus, Youtube,
  Save, Loader2, Link as LinkIcon, Video,
  UploadCloud, MonitorPlay, FileArchive, BookOpen
} from 'lucide-react';
import FilterSelect from '@/components/ui/FilterSelect';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl border border-[#CDE3BD] bg-[#F8FFF9]" />
});
import 'react-quill-new/dist/quill.snow.css';

interface VideoItem {
  url: string;
  title: string;
}

export default function EditLessonPage() {
  const router = useRouter();
  const { courseId, lessonId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingVideo, setIsFetchingVideo] = useState(false);

  const [formData, setFormData] = useState({ title: '', content: '', status: 'HIDE' });
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [attachments, setAttachments] = useState<{ id: string, name: string, type: string, path?: string, size?: string, file?: File }[]>([]);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  // --- ดึงข้อมูลเดิมจาก API ---
  const fetchLessonData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.lesson_title,
          content: data.lesson_content,
          status: data.lesson_status
        });
        setVideoList(data.video_list || []);
        setAttachments(data.attachments || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    if (courseId && lessonId) fetchLessonData();
  }, [fetchLessonData, courseId, lessonId]);

  // --- จัดการวิดีโอ ---
  const addVideoToList = async () => {
    if (!currentVideoUrl.trim()) return;
    setIsFetchingVideo(true);
    try {
      const res = await fetch(`https://noembed.com/embed?url=${currentVideoUrl.trim()}`);
      const data = await res.json();
      setVideoList([...videoList, { url: currentVideoUrl.trim(), title: data.title || "Untitled Video" }]);
      setCurrentVideoUrl('');
    } catch {
      alert("ไม่สามารถดึงข้อมูลวิดีโอได้");
    } finally {
      setIsFetchingVideo(false);
    }
  };

  // --- จัดการไฟล์ ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        file,
      }));
      setAttachments([...attachments, ...newFiles]);
    }
  };

  // --- บันทึกการแก้ไข ---
  const handleUpdate = async () => {
    if (!formData.title.trim()) return alert('กรุณาระบุชื่อบทเรียน');
    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('content', formData.content);
      body.append('status', formData.status);
      body.append('videoUrls', JSON.stringify(videoList));

      // แยกไฟล์เดิม (มี path) กับไฟล์ใหม่ (มี file)
      const existing = attachments.filter(at => at.path && !at.file);
      existing.forEach(at => body.append('existingPaths', JSON.stringify({ name: at.name, type: at.type, path: at.path })));

      const newFiles = attachments.filter(at => at.file);
      newFiles.forEach(at => body.append('files', at.file!, at.name));

      const response = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PUT',
        body,
      });
      if (response.ok) {
        alert("อัปเดตข้อมูลสำเร็จ");
        router.refresh();
        router.back();
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-[#14532D]" size={40} />
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
            แก้ไขบทเรียน
          </h1>
          <p className="text-sm text-[#6E8E59]">แก้ไขเนื้อหาบทเรียนสำหรับคอร์สอบรม</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main Content */}
          <div className="min-w-0 space-y-6">
            {/* Lesson Info */}
            <SectionCard title="ข้อมูลหลักของบทเรียน" icon={BookOpen}>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#14532D]">ชื่อบทเรียน</label>
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-[#CDE3BD] bg-white px-4 text-sm text-[#14532D] placeholder:text-[#93B08A] shadow-[0_0_4px_0_#CAE0BC]/50 outline-none focus:ring-2 focus:ring-[#4CA771]/25 focus:border-[#4CA771] transition-all"
                    placeholder="เช่น บทนำพื้นฐานและการจำแนกไม้..."
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#14532D]">เนื้อหาบทเรียน</label>
                  <div className="overflow-hidden rounded-xl border border-[#CDE3BD] bg-white shadow-[0_0_4px_0_#CAE0BC]/50">
                    <ReactQuill
                      theme="snow"
                      modules={modules}
                      value={formData.content}
                      onChange={(val) => setFormData({...formData, content: val})}
                      placeholder="เขียนรายละเอียดความรู้ หรือวางรูปภาพลงที่นี่..."
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* YouTube Videos */}
            <SectionCard title="วิดีโอ YouTube ที่เกี่ยวข้อง" icon={MonitorPlay}>
              <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                  <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86A97A]" />
                  <input
                    type="text"
                    className="h-11 w-full rounded-xl border border-[#CDE3BD] bg-white pl-9 pr-4 text-sm text-[#14532D] placeholder:text-[#93B08A] shadow-[0_0_4px_0_#CAE0BC]/50 outline-none focus:ring-2 focus:ring-[#4CA771]/25 focus:border-[#4CA771] transition-all"
                    placeholder="วางลิงก์ YouTube ที่นี่..."
                    value={currentVideoUrl}
                    onChange={(e) => setCurrentVideoUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addVideoToList()}
                  />
                </div>
                <button
                  onClick={addVideoToList}
                  disabled={isFetchingVideo || !currentVideoUrl}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#14532D] px-5 text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(20,83,45,0.65)] transition hover:bg-[#0F3F22] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFetchingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  เพิ่ม
                </button>
              </div>

              <div className="space-y-3">
                {videoList.map((item, index) => {
                  const isYoutube = item.url.includes('youtube.com') || item.url.includes('youtu.be');
                  return (
                    <div key={index} className="flex items-center justify-between rounded-xl border border-[#CDE3BD] bg-white p-3 shadow-sm transition hover:shadow-md">
                      <div className="flex items-center gap-3 truncate">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isYoutube ? 'bg-red-50 text-red-500' : 'bg-[#DCFCE7] text-[#14532D]'}`}>
                          {isYoutube ? <Youtube className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-[#14532D] truncate">{item.title}</p>
                          <p className="text-xs text-[#6E8E59] truncate">{item.url}</p>
                        </div>
                      </div>
                      <button onClick={() => setVideoList(videoList.filter((_, i) => i !== index))} className="ml-2 p-2 text-gray-300 transition hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
                {videoList.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[#CDE3BD] bg-[#F8FFF9] py-6 text-center text-sm text-[#6E8E59]">
                    ยังไม่ได้เพิ่มวิดีโอประกอบ
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attachments */}
            <SectionCard title="เอกสารประกอบ" icon={FileArchive}>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#CDE3BD] bg-white px-4 py-6 text-center transition hover:border-[#4CA771] hover:bg-[#F6FBF6]"
              >
                <UploadCloud className="h-6 w-6 text-[#86A97A] transition group-hover:text-[#16A34A]" />
                <span className="text-sm font-semibold text-[#14532D]">คลิกเพื่ออัปโหลดไฟล์</span>
                <span className="text-xs text-[#6E8E59]">PDF, PNG, JPG (ไม่เกิน 5MB)</span>
                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              </div>

              <div className="mt-4 space-y-2">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between rounded-xl border border-[#CDE3BD] bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-3 truncate">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7] text-[10px] font-bold text-[#14532D]">
                        {file.type}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-[#14532D] truncate">{file.name}</p>
                        {file.size && <p className="text-[11px] text-[#6E8E59]">{file.size}</p>}
                      </div>
                    </div>
                    <button onClick={() => setAttachments(attachments.filter(a => a.id !== file.id))} className="ml-2 p-1 text-gray-300 transition hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Publish */}
            <div className="sticky top-8 rounded-2xl border border-[#CDE3BD] bg-white p-6 shadow-[0_0_4px_0_#CAE0BC]/50 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#14532D]">สถานะการเผยแพร่</label>
                <FilterSelect
                  value={formData.status}
                  onValueChange={(v) => setFormData({...formData, status: v})}
                  placeholder="เลือกสถานะ"
                  options={[
                    { value: 'HIDE', label: 'ฉบับร่าง (HIDE)' },
                    { value: 'SHOW', label: 'เผยแพร่ (SHOW)' },
                  ]}
                />
              </div>

              <button
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#14532D] text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(20,83,45,0.65)] transition hover:bg-[#0F3F22] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    บันทึกการแก้ไข
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .ql-container.ql-snow { border: none !important; font-family: 'Kanit', sans-serif; }
        .ql-editor { min-height: 320px; padding: 20px !important; line-height: 1.8; font-size: 15px; color: #14532D; }
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #CDE3BD !important; background: #F8FFF9; padding: 10px !important; }
        .ql-editor.ql-blank::before { color: #93B08A; font-style: normal; }
      `}</style>
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
