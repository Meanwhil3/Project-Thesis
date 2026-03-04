"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ChevronLeft, FileText, Trash2, Plus, Youtube, 
  Save, Loader2, Link as LinkIcon, Video, FileUp 
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

export default function EditLessonPage() {
  const router = useRouter();
  const { courseId, lessonId } = useParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingVideo, setIsFetchingVideo] = useState(false);
  
  const [formData, setFormData] = useState({ title: '', content: '', status: 'HIDE' });
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [attachments, setAttachments] = useState<{ id: string, name: string, type: string, path?: string }[]>([]);

  // Config Quill ให้รองรับรูปภาพ
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

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
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    if (courseId && lessonId) fetchLessonData();
  }, [fetchLessonData, courseId, lessonId]);

  const addVideoToList = async () => {
    if (!currentVideoUrl.trim()) return;
    setIsFetchingVideo(true);
    try {
      const res = await fetch(`https://noembed.com/embed?url=${currentVideoUrl.trim()}`);
      const data = await res.json();
      setVideoList([...videoList, { url: currentVideoUrl.trim(), title: data.title || "ไม่ทราบชื่อคลิป" }]);
      setCurrentVideoUrl('');
    } catch {
      alert("ไม่สามารถดึงข้อมูลวิดีโอได้");
    } finally {
      setIsFetchingVideo(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.title) return alert('กรุณาระบุชื่อบทเรียน');
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          videoUrls: videoList,
          attachments 
        }),
      });
      if (response.ok) {
        router.refresh();
        router.back();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      }));
      setAttachments([...attachments, ...newFiles]);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-green-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-kanit">
      <div className="max-w-7xl mx-auto mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-green-600 transition-all">
          <ChevronLeft size={20} />
          <span className="font-medium text-lg">ย้อนกลับ</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* ฝั่งซ้าย (8 ส่วน) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 border-l-4 border-green-500 pl-4">แก้ไขข้อมูลบทเรียน</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">ชื่อหัวข้อบทเรียน</label>
                <input 
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-xl"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">เนื้อหาบทเรียน</label>
                <div className="editor-container bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <ReactQuill 
                    theme="snow" 
                    modules={quillModules}
                    value={formData.content} 
                    onChange={(val) => setFormData({...formData, content: val})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <Youtube className="text-red-500" size={30} /> วิดีโอสอน (YouTube)
            </h2>
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-400 outline-none"
                    placeholder="วางลิงก์ YouTube..."
                    value={currentVideoUrl}
                    onChange={(e) => setCurrentVideoUrl(e.target.value)}
                  />
                </div>
                <button onClick={addVideoToList} disabled={isFetchingVideo} className="px-8 bg-slate-900 text-white rounded-2xl font-bold hover:bg-red-600 transition-all flex items-center gap-2">
                  {isFetchingVideo ? <Loader2 className="animate-spin" /> : <Plus />} เพิ่มคลิป
                </button>
              </div>

              <div className="grid gap-3">
                {videoList.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group">
                    <div className="flex items-center gap-4 truncate">
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                        <Video size={20} />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-700 truncate">{item.title}</p>
                        <p className="text-xs text-slate-400 truncate">{item.url}</p>
                      </div>
                    </div>
                    <button onClick={() => setVideoList(videoList.filter((_, i) => i !== index))} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา (4 ส่วน) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">เอกสารประกอบ</h3>
              <label className="p-2 bg-green-50 text-green-600 rounded-xl cursor-pointer hover:bg-green-100 transition-all">
                <FileUp size={24} />
                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            <div className="space-y-3">
              {attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 truncate">
                    <FileText className="text-green-500 shrink-0" size={20} />
                    <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                  </div>
                  <button onClick={() => setAttachments(attachments.filter(a => a.id !== file.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 sticky top-10">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-300 uppercase tracking-widest mb-3 block">สถานะการแสดงผล</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="HIDE">เก็บเป็นฉบับร่าง (HIDE)</option>
                  <option value="SHOW">เผยแพร่ทันที (SHOW)</option>
                </select>
              </div>
              <button onClick={handleUpdate} disabled={isSubmitting} className="w-full bg-green-600 text-white py-5 rounded-[1.5rem] font-bold text-xl hover:bg-green-700 shadow-xl transition-all flex items-center justify-center gap-3 disabled:bg-slate-300">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .editor-container { min-height: 500px; display: flex; flex-direction: column; }
        .ql-container.ql-snow { flex: 1; border: none !important; font-family: 'Kanit', sans-serif; font-size: 1.1rem; }
        .ql-editor { min-height: 420px; padding: 30px !important; line-height: 1.9; }
        .ql-editor img { max-width: 100%; height: auto; border-radius: 1.5rem; margin: 1.5rem auto; display: block; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f1f5f9 !important; background: #f8fafc; padding: 15px !important; }
      `}</style>
    </div>
  );
}