"use client";
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ChevronLeft, FileText, Trash2, Plus, Youtube, 
  FileIcon, Save, Loader2 
} from 'lucide-react';

// 1. ใช้ react-quill-new แทน เพื่อรองรับ React 19
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-xl border border-gray-200" />
});
import 'react-quill-new/dist/quill.snow.css';

// 2. ใช้ ReactPlayer แบบ Dynamic และไม่ระบุ /youtube ต่อท้าย
const ReactPlayer = dynamic(() => import('react-player'), { 
  ssr: false,
  loading: () => <div className="aspect-video bg-gray-100 animate-pulse rounded-2xl" />
});

export default function CreateLessonPage() {
  const router = useRouter();
  const { courseId } = useParams();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'HIDE',
    videoUrl: ''
  });

  // State สำหรับเก็บไฟล์ที่อัปโหลด
  const [attachments, setAttachments] = useState<{ id: string, name: string, type: string, file?: File }[]>([]);

  // --- Functions จัดการไฟล์ ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        file: file
      }));
      setAttachments(prev => [...prev, ...newFiles]);
    }
    // ล้างค่าเพื่อให้เลือกไฟล์เดิมซ้ำได้ถ้าจำเป็น
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // --- Function บันทึกข้อมูล ---
  const handleSave = async () => {
    if (!formData.title) return alert('กรุณาระบุชื่อบทเรียน');
    
    setIsSubmitting(true);
    try {
      // หมายเหตุ: ในการใช้งานจริงที่มีการอัปโหลดไฟล์ ต้องใช้ FormData
      const response = await fetch(`/api/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          // ส่งแค่ชื่อไฟล์จำลองไปก่อนสำหรับการทดสอบ UI
          attachments: attachments.map(a => ({ name: a.name, type: a.type })) 
        }),
      });

      if (response.ok) {
        router.push(`/admin/courses/${courseId}/lessons`);
        router.refresh();
      } else {
        alert('ไม่สามารถบันทึกข้อมูลได้');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean'],
    ],
  };

  return (
    <div className="min-h-screen bg-[#F0F7F4] p-4 md:p-8 font-kanit text-slate-800">
      {/* ย้อนกลับ */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors mb-6 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">ย้อนกลับ</span>
      </button>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ฝั่งซ้าย: ข้อมูลหลัก */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-green-100">
            <h2 className="text-xl font-semibold text-green-900 mb-6">ข้อมูลบทเรียน</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">ชื่อบทเรียน</label>
                <input 
                  type="text"
                  placeholder="ใส่หัวข้อบทเรียน..."
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">เนื้อหาบทเรียน</label>
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200 editor-container">
                  <ReactQuill 
                    theme="snow"
                    value={formData.content}
                    onChange={(val) => setFormData({...formData, content: val})}
                    modules={modules}
                    placeholder="พิมพ์เนื้อหาการสอนที่นี่..."
                    className="min-h-[300px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* สื่อการเรียน (วิดีโอ) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-green-100">
            <h2 className="text-xl font-semibold text-green-900 mb-6 flex items-center gap-2">
              <Youtube className="text-red-500" /> วิดีโอสอน (YouTube)
            </h2>
            <div className="space-y-4">
              <input 
                type="text"
                placeholder="วาง Link YouTube เช่น https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 outline-none"
                value={formData.videoUrl}
                onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
              />

              {formData.videoUrl && (
                <div className="rounded-2xl overflow-hidden aspect-video bg-black shadow-lg border-2 border-white">
                  <ReactPlayer 
                    url={formData.videoUrl}
                    width="100%"
                    height="100%"
                    controls
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ฝั่งขวา: Sidebar */}
        <div className="space-y-6">
          {/* เอกสารประกอบ */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-t-4 border-green-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">เอกสารประกอบ</h2>
              <label className="cursor-pointer p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-all">
                <Plus size={20} />
                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            
            <div className="space-y-3">
              {attachments.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6 border-2 border-dashed border-gray-50 rounded-2xl italic">
                  ยังไม่มีไฟล์เอกสาร
                </p>
              ) : (
                attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-3 truncate">
                      <div className="bg-green-600 p-2 rounded-lg text-white shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-green-600 font-bold uppercase">{file.type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeAttachment(file.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* การเผยแพร่ */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-t-4 border-green-600">
            <h2 className="font-semibold text-lg mb-4 text-slate-800">การเผยแพร่</h2>
            <div className="space-y-4">
              <select 
                className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none text-sm font-medium cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="HIDE">ซ่อนบทเรียน (ร่าง)</option>
                <option value="SHOW">แสดงต่อผู้เรียน</option>
              </select>
              
              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-green-800 shadow-lg shadow-green-100 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  บันทึกบทเรียน
                </button>
                <button 
                  onClick={() => router.back()}
                  className="w-full bg-gray-100 text-gray-500 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* เพิ่ม CSS ปรับแต่ง Quill เล็กน้อย */}
      <style jsx global>{`
        .editor-container .ql-editor {
          min-height: 250px;
          font-family: inherit;
          font-size: 1rem;
        }
        .editor-container .ql-toolbar.ql-snow {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .editor-container .ql-container.ql-snow {
          border: none;
        }
      `}</style>
    </div>
  );
}