"use client";
import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ChevronLeft, FileText, Trash2, Plus, Youtube, 
  Save, Loader2, Link as LinkIcon, Video, FileUp, X, Image as ImageIcon
} from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-80 bg-gray-50 animate-pulse rounded-[2rem] border border-slate-200" />
});
import 'react-quill-new/dist/quill.snow.css';

interface VideoItem {
  url: string;
  title: string;
}

export default function CreateLessonPage() {
  const router = useRouter();
  const { courseId } = useParams();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingVideo, setIsFetchingVideo] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', status: 'HIDE' });
  
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [attachments, setAttachments] = useState<{ id: string, name: string, type: string, size: string }[]>([]);

  // --- Quill Modules Configuration ---
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'], // เพิ่มปุ่มรูปภาพ
      ['clean']
    ],
  }), []);

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

  const handleSave = async () => {
    if (!formData.title) return alert('กรุณาระบุชื่อบทเรียน');
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          videoUrls: videoList.map(v => v.url),
          attachments 
        }),
      });
      if (response.ok) {
        router.push(`/courses/${courseId}/lessons`);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-kanit text-slate-800">
      {/* Header Navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-green-600 transition-all group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-lg text-slate-500">ย้อนกลับ</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        
        {/* ฝั่งซ้าย (8 ส่วน): ข้อมูลและวิดีโอ */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Editor Block */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 border-l-4 border-green-500 pl-5">เขียนเนื้อหาบทเรียน</h2>
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">ชื่อบทเรียน</label>
                <input 
                  type="text"
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-xl font-medium"
                  placeholder="เช่น พื้นฐานและโครงสร้างไม้ Cell Wall..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">เนื้อหาหลัก</label>
                <div className="editor-wrapper bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <ReactQuill 
                    theme="snow" 
                    modules={modules}
                    value={formData.content} 
                    onChange={(val) => setFormData({...formData, content: val})}
                    placeholder="แชร์ความรู้ของคุณที่นี่... (คุณสามารถวางรูปภาพลงในนี้ได้ทันที)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Video Block */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <Youtube className="text-red-500" size={32} /> วิดีโอ YouTube ที่เกี่ยวข้อง
            </h2>
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text"
                    className="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 outline-none"
                    placeholder="วางลิงก์ YouTube..."
                    value={currentVideoUrl}
                    onChange={(e) => setCurrentVideoUrl(e.target.value)}
                  />
                </div>
                <button onClick={addVideoToList} disabled={isFetchingVideo} className="px-10 bg-slate-900 text-white rounded-2xl font-bold hover:bg-red-600 transition-all flex items-center gap-2 disabled:bg-slate-300">
                  {isFetchingVideo ? <Loader2 className="animate-spin" /> : <Plus />} เพิ่มวิดีโอ
                </button>
              </div>

              <div className="grid gap-3">
                {videoList.length > 0 ? (
                  videoList.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center gap-4 truncate">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                          <Video size={24} />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-slate-700 truncate text-lg">{item.title}</p>
                          <p className="text-xs text-slate-400 truncate font-medium uppercase">{item.url}</p>
                        </div>
                      </div>
                      <button onClick={() => setVideoList(videoList.filter((_, i) => i !== index))} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={22} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300">ยังไม่ได้ระบุวิดีโอ</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา (4 ส่วน): เอกสารและการบันทึก */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* Attachment Sidebar */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-800">เอกสารประกอบ</h3>
              <label className="p-3 bg-green-50 text-green-600 rounded-2xl cursor-pointer hover:bg-green-100 transition-all">
                <FileUp size={24} />
                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            <div className="space-y-3">
              {attachments.length > 0 ? (
                attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="text-green-500 shrink-0" size={20} />
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{file.type} • {file.size}</p>
                      </div>
                    </div>
                    <button onClick={() => setAttachments(attachments.filter(a => a.id !== file.id))} className="text-slate-300 hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 text-sm">ไม่มีไฟล์แนบ</div>
              )}
            </div>
          </div>

          {/* Action Box */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 sticky top-10">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4 block italic">การเผยแพร่บทเรียน</label>
                <select 
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="HIDE">เก็บไว้เป็นฉบับร่าง (HIDE)</option>
                  <option value="SHOW">เปิดให้เข้าชมทันที (SHOW)</option>
                </select>
              </div>

              <button 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-5 rounded-[1.8rem] font-bold text-xl hover:bg-green-700 shadow-2xl shadow-green-200 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} บันทึกข้อมูล
              </button>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .editor-wrapper {
          min-height: 500px;
          display: flex;
          flex-direction: column;
        }
        .ql-container.ql-snow {
          flex: 1;
          border: none !important;
          font-family: 'Kanit', sans-serif;
        }
        .ql-editor {
          min-height: 420px;
          padding: 35px !important;
          line-height: 1.9;
          font-size: 1.15rem;
        }
        /* ระบบ Auto-Resize รูปภาพผ่าน CSS */
        .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 1.5rem;
          margin: 1.5rem auto;
          display: block;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          background: #fdfdfd;
          padding: 18px !important;
        }
        .ql-editor.ql-blank::before {
          color: #cbd5e1;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}