"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ChevronLeft, FileText, Trash2, Plus, Youtube, 
  Save, Loader2, Link as LinkIcon, Video, 
  UploadCloud, FileArchive, BookOpen, MonitorPlay
} from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-80 bg-white/50 animate-pulse rounded-[2.5rem] border border-[#CDE3BD]/30" />
});
import 'react-quill-new/dist/quill.snow.css';

interface VideoItem {
  url: string;
  title: string;
}

// Reusable Section Shell (Mood & Tone เดียวกับหน้าสร้างและแสดงผล)
function EditSection({
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
  const [attachments, setAttachments] = useState<{ id: string, name: string, type: string, path?: string, size?: string }[]>([]);

  const quillModules = useMemo(() => ({
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
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      }));
      setAttachments([...attachments, ...newFiles]);
    }
  };

  // --- บันทึกการแก้ไข ---
  const handleUpdate = async () => {
    if (!formData.title.trim()) return alert('กรุณาระบุชื่อบทเรียน');
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: formData.title,
          content: formData.content,
          status: formData.status,
          videoUrls: videoList, // ส่งเป็น Object {url, title} ตามโครงสร้าง API
          attachments: attachments.map(at => ({
            name: at.name,
            type: at.type,
            path: at.path // ส่ง path เดิมไปด้วยสำหรับไฟล์ที่ไม่ได้อัปโหลดใหม่
          }))
        }),
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
    <div className="min-h-screen font-kanit text-[#14532D] p-4 md:p-8">
      
      {/* Header Area */}
      <div className="max-w-[1400px] mx-auto mb-8 flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:bg-[#F6FBF6] hover:text-[#14532D]"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">แก้ไขบทเรียน</h1>
          <nav className="flex items-center gap-2 text-sm text-[#6E8E59]">
            <span>Admin</span>
            <span className="text-[#CDE3BD]">/</span>
            <span className="text-[#14532D]">Edit Lesson</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8 items-start">
        
        {/* ฝั่งซ้าย (Main Content) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          <EditSection title="รายละเอียดเนื้อหา" icon={BookOpen}>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#6E8E59] ml-1">ชื่อหัวข้อบทเรียน</label>
                <input 
                  type="text"
                  className="w-full px-6 py-4 bg-[#F8FFF9] border border-[#CDE3BD] rounded-2xl focus:ring-4 focus:ring-[#DCFCE7] focus:border-[#22C55E] outline-none transition-all text-lg font-medium"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#6E8E59] ml-1">เนื้อหาบทเรียน</label>
                <div className="editor-container bg-white rounded-2xl border border-[#CDE3BD] overflow-hidden shadow-inner">
                  <ReactQuill 
                    theme="snow" 
                    modules={quillModules}
                    value={formData.content} 
                    onChange={(val) => setFormData({...formData, content: val})}
                  />
                </div>
              </div>
            </div>
          </EditSection>

          <EditSection title="จัดการวิดีโอ (YouTube)" icon={MonitorPlay}>
            <div className="flex gap-3 mb-8">
              <div className="relative flex-1 group">
                <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[#CDE3BD] group-focus-within:text-[#22C55E]" size={18} />
                <input 
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-[#F8FFF9] border border-[#CDE3BD] rounded-2xl focus:ring-4 focus:ring-[#DCFCE7] outline-none transition-all font-medium"
                  placeholder="วางลิงก์ YouTube ใหม่..."
                  value={currentVideoUrl}
                  onChange={(e) => setCurrentVideoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addVideoToList()}
                />
              </div>
              <button 
                onClick={addVideoToList} 
                disabled={isFetchingVideo} 
                className="px-8 bg-[#14532D] text-white rounded-2xl font-bold hover:bg-[#1a6336] transition-all flex items-center gap-2"
              >
                {isFetchingVideo ? <Loader2 className="animate-spin" /> : <Plus size={20} />} เพิ่ม
              </button>
            </div>

            <div className="grid gap-3">
              {videoList.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/50 border border-[#CDE3BD] rounded-2xl group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 truncate">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-red-50 text-red-500">
                      <Video size={24} />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-[#14532D] truncate">{item.title}</p>
                      <p className="text-xs text-[#6E8E59] truncate font-medium">{item.url}</p>
                    </div>
                  </div>
                  <button onClick={() => setVideoList(videoList.filter((_, i) => i !== index))} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </EditSection>
        </div>

        {/* ฝั่งขวา (Sidebar) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          <EditSection title="ไฟล์แนบ" icon={FileArchive}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CDE3BD] rounded-2xl p-8 text-center hover:bg-[#F8FFF9] hover:border-[#22C55E] transition-all cursor-pointer group"
            >
              <UploadCloud className="mx-auto mb-3 text-[#CDE3BD] group-hover:text-[#22C55E] group-hover:scale-110 transition-all" size={40} />
              <p className="font-bold text-[#14532D] text-sm">อัปโหลดเอกสารเพิ่ม</p>
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            </div>

            <div className="mt-6 space-y-3">
              {attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-[#CDE3BD]/50 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 truncate">
                    <div className="h-10 w-10 bg-[#DCFCE7] text-[#14532D] rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">
                      {file.type}
                    </div>
                    <p className="text-sm font-bold text-[#14532D] truncate">{file.name}</p>
                  </div>
                  <button onClick={() => setAttachments(attachments.filter(a => a.id !== file.id))} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </EditSection>

          <div className="bg-white/90 rounded-3xl p-7 shadow-[0_0_12px_#CAE0BC] ring-1 ring-black/5 sticky top-8 space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#6E8E59] ml-1 uppercase tracking-widest">สถานะปัจจุบัน</label>
              <select 
                className="w-full p-4 bg-[#F8FFF9] border border-[#CDE3BD] rounded-2xl font-bold text-[#14532D] outline-none cursor-pointer focus:ring-4 focus:ring-[#DCFCE7] transition-all"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="HIDE">ฉบับร่าง (HIDE)</option>
                <option value="SHOW">เผยแพร่ (SHOW)</option>
              </select>
            </div>

            <button 
              onClick={handleUpdate} 
              disabled={isSubmitting}
              className="w-full bg-[#14532D] text-white py-5 rounded-2xl font-bold text-lg hover:bg-[#1a6336] shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Save size={22} />
                  บันทึกการแก้ไข
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .ql-container.ql-snow { border: none !important; font-family: 'Kanit', sans-serif; }
        .ql-editor { min-height: 400px; padding: 25px !important; line-height: 1.8; font-size: 16px; color: #14532D; }
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #CDE3BD !important; background: #F8FFF9; padding: 12px !important; }
        .ql-editor.ql-blank::before { color: #CDE3BD; font-style: normal; }
      `}</style>
    </div>
  );
}