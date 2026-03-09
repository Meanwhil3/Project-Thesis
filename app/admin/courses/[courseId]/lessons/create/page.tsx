"use client";
import React, { useState, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ChevronLeft, FileText, Trash2, Plus, Youtube, 
  Save, Loader2, Link as LinkIcon, Video, 
  UploadCloud, MonitorPlay, FileArchive, BookOpen
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

function CreateSection({
  title,
  icon: Icon,
  children,
  right,
  className = "",
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl bg-white/85 shadow-[0_0_12px_#CAE0BC] ring-1 ring-black/5 backdrop-blur ${className}`}>
      <div className="flex items-center justify-between gap-3 px-7 py-5 sm:px-8 border-b border-[#CDE3BD]/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DCFCE7] ring-1 ring-black/5">
            <Icon className="h-5 w-5 text-[#14532D]" />
          </div>
          <h2 className="font-kanit text-[20px] font-medium text-[#14532D]">
            {title}
          </h2>
        </div>
        {right}
      </div>
      <div className="px-7 py-7 sm:px-8">{children}</div>
    </section>
  );
}

export default function CreateLessonPage() {
  const router = useRouter();
  const { courseId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingVideo, setIsFetchingVideo] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', status: 'HIDE' });
  
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [attachments, setAttachments] = useState<{ id: string, name: string, type: string, size: string }[]>([]);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

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

  // --- ส่วนที่แก้ไข: ฟังก์ชันส่งข้อมูลไปยัง API ---
  const handleSave = async () => {
    // 1. Validation เบื้องต้น
    if (!formData.title.trim()) return alert('กรุณาระบุชื่อบทเรียน');
    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      return alert('กรุณาระบุเนื้อหาบทเรียน');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        status: formData.status, // "SHOW" หรือ "HIDE"
        videoUrls: videoList.map(v => v.url), // ส่งเฉพาะ Array ของ String URL ตาม API
        attachments: attachments.map(at => ({
          name: at.name,
          type: at.type
        }))
      };

      const response = await fetch(`/api/admin/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("บันทึกบทเรียนเรียบร้อยแล้ว");
        // ย้อนกลับไปยังหน้ารายการบทเรียน หรือหน้า Course
        router.push(`/courses/${courseId}`);
        router.refresh();
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.error || 'ไม่สามารถบันทึกได้'}`);
      }
    } catch (error) {
      console.error("SAVE_ERROR:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-kanit text-[#14532D] p-4 md:p-8 selection:bg-[#DCFCE7] selection:text-[#14532D]">
      
      {/* Header Area */}
      <div className="max-w-[1400px] mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:bg-[#F6FBF6] hover:text-[#14532D]"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-[#14532D]">เพิ่มบทเรียนใหม่</h1>
            <nav className="flex items-center gap-2 text-sm text-[#6E8E59]">
              <span>คอร์สทั้งหมด</span>
              <span className="text-[#CDE3BD]">/</span>
              <span className="text-[#14532D]">สร้างเนื้อหา</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8 items-start">
        
        {/* ฝั่งซ้าย (Main Content) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          <CreateSection title="ข้อมูลหลักของบทเรียน" icon={BookOpen}>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#6E8E59] ml-1">ชื่อบทเรียน</label>
                <input 
                  type="text"
                  className="w-full px-6 py-4 bg-[#F8FFF9] border border-[#CDE3BD] rounded-2xl focus:ring-4 focus:ring-[#DCFCE7] focus:border-[#22C55E] outline-none transition-all text-lg font-medium placeholder:text-[#CDE3BD]"
                  placeholder="เช่น บทนำพื้นฐานและการจำแนกไม้..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#6E8E59] ml-1">เนื้อหาบทเรียน</label>
                <div className="editor-container bg-white rounded-2xl border border-[#CDE3BD] overflow-hidden shadow-inner">
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
          </CreateSection>

          <CreateSection title="วิดีโอ YouTube ที่เกี่ยวข้อง" icon={MonitorPlay}>
            <div className="flex gap-3 mb-8">
              <div className="relative flex-1 group">
                <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[#CDE3BD] group-focus-within:text-[#22C55E] transition-colors" size={18} />
                <input 
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-[#F8FFF9] border border-[#CDE3BD] rounded-2xl focus:ring-4 focus:ring-[#DCFCE7] outline-none transition-all font-medium"
                  placeholder="วางลิงก์ YouTube ที่นี่..."
                  value={currentVideoUrl}
                  onChange={(e) => setCurrentVideoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addVideoToList()}
                />
              </div>
              <button 
                onClick={addVideoToList} 
                disabled={isFetchingVideo || !currentVideoUrl} 
                className="px-8 bg-[#14532D] text-white rounded-2xl font-bold hover:bg-[#1a6336] transition-all flex items-center gap-2 disabled:bg-slate-200"
              >
                {isFetchingVideo ? <Loader2 className="animate-spin" /> : <Plus size={20} />} เพิ่ม
              </button>
            </div>

            <div className="grid gap-3">
              {videoList.map((item, index) => {
                const isYoutube = item.url.includes('youtube.com') || item.url.includes('youtu.be');
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/50 border border-[#CDE3BD] rounded-2xl group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 truncate">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isYoutube ? 'bg-red-50 text-red-500' : 'bg-[#DCFCE7] text-[#14532D]'}`}>
                        {isYoutube ? <Youtube size={24} /> : <Video size={24} />}
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
                );
              })}
              {videoList.length === 0 && (
                <div className="text-center py-8 bg-[#F8FFF9]/50 border border-dashed border-[#CDE3BD] rounded-2xl text-[#6E8E59] text-sm">
                  ยังไม่ได้เพิ่มวิดีโอประกอบ
                </div>
              )}
            </div>
          </CreateSection>
        </div>

        {/* ฝั่งขวา (Sidebar) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          <CreateSection title="เอกสารประกอบ" icon={FileArchive}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CDE3BD] rounded-2xl p-8 text-center hover:bg-[#F8FFF9] hover:border-[#22C55E] transition-all cursor-pointer group"
            >
              <UploadCloud className="mx-auto mb-3 text-[#CDE3BD] group-hover:text-[#22C55E] group-hover:scale-110 transition-all" size={40} />
              <p className="font-bold text-[#14532D] text-sm">คลิกเพื่ออัปโหลดไฟล์</p>
              <p className="text-[11px] text-[#6E8E59] mt-1 italic">PDF, PNG, JPG (ไม่เกิน 5MB)</p>
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            </div>

            <div className="mt-6 space-y-3">
              {attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-[#CDE3BD]/50 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 truncate">
                    <div className="h-10 w-10 bg-[#DCFCE7] text-[#14532D] rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">
                      {file.type}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-[#14532D] truncate">{file.name}</p>
                      <p className="text-[10px] text-[#6E8E59]">{file.size}</p>
                    </div>
                  </div>
                  <button onClick={() => setAttachments(attachments.filter(a => a.id !== file.id))} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </CreateSection>

          <div className="bg-white/90 rounded-3xl p-7 shadow-[0_0_12px_#CAE0BC] ring-1 ring-black/5 sticky top-8 space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#6E8E59] ml-1 uppercase tracking-widest">สถานะการเผยแพร่</label>
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
              onClick={handleSave} 
              disabled={isSubmitting}
              className="w-full bg-[#14532D] text-white py-5 rounded-2xl font-bold text-lg hover:bg-[#1a6336] shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Save size={22} />
                  บันทึกบทเรียน
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