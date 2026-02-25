"use client";
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, 
  FileText, 
  Trash2, 
  Plus, 
  Youtube,  
  FileIcon,
  Save,
  Loader2
} from 'lucide-react';

export default function CreateLessonPage() {
  const router = useRouter();
  const { courseId } = useParams();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'HIDE' // ซ่อน หรือ แสดง
  });

  // Mock data สำหรับส่วนเอกสารประกอบ
  const [attachments, setAttachments] = useState([
    { id: 1, name: 'พันธุ์ไม้', type: 'PDF' },
    { id: 2, name: 'จำแนกพันธุ์ไม้', type: 'PDF' },
  ]);

  const handleSave = async () => {
    if (!formData.title) return alert('กรุณาระบุชื่อบทเรียน');
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/admin/courses/${courseId}/lessons`);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7F4] p-4 md:p-8 font-kanit">
      {/* Header / Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors mb-6"
      >
        <ChevronLeft size={20} />
        <span className="font-medium">บทเรียนทั้งหมด</span>
      </button>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- ฝั่งซ้าย: ข้อมูลหลัก (Main Content) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ส่วนข้อมูลพื้นฐาน */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-blue-400/20">
            <h2 className="text-xl font-semibold text-[#14532D] mb-6">ข้อมูลพื้นฐาน</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อบทเรียน</label>
                <input 
                  type="text"
                  placeholder="เช่น บทที่ 1 - อบรมการจำแนกไม้เบื้องต้น"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เนื้อหาบทเรียน</label>
                {/* ในอนาคตสามารถนำ Rich Text Editor มาลงตรงนี้ได้ */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 border-b p-2 flex gap-2">
                    <button className="p-1 hover:bg-white rounded">B</button>
                    <button className="p-1 hover:bg-white rounded font-italic italic">I</button>
                    <button className="p-1 hover:bg-white rounded underline">U</button>
                  </div>
                  <textarea 
                    rows={10}
                    placeholder="กรอกเนื้อหาบทเรียน"
                    className="w-full px-4 py-3 outline-none resize-none"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ส่วนสื่อการเรียน */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#14532D] mb-6">สื่อการเรียน</h2>
            <div className="flex flex-wrap gap-4">
              <button className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all">
                <FileIcon size={24} />
              </button>
              <button className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all">
                <Youtube size={24} />
              </button>
              <button className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-400 rounded-full border-2 border-dashed border-gray-300 hover:bg-gray-200 transition-all">
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* --- ฝั่งขวา: Sidebar --- */}
        <div className="space-y-6">
          
          {/* เอกสารประกอบ */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-l-4 border-green-700">
            <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
              เอกสารประกอบ
            </h2>
            <div className="space-y-3">
              {attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-xl text-green-700">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{file.name}</p>
                      <p className="text-[10px] text-gray-400">{file.type}</p>
                    </div>
                  </div>
                  <button className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* การเผยแพร่ */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-l-4 border-green-700">
            <h2 className="text-lg font-semibold text-black mb-4">การเผยแพร่</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 font-medium">สถานะ:</label>
                <select 
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="HIDE">ซ่อน</option>
                  <option value="SHOW">แสดง</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 bg-[#D1FAE5] text-[#065F46] py-2.5 rounded-xl text-sm font-medium hover:bg-green-200 transition-all"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} className="hidden" />}
                  บันทึก
                </button>
                <button 
                  onClick={() => router.back()}
                  className="bg-red-50 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition-all"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// สร้างฟังก์ชัน Check เพื่อใช้ในปุ่มบันทึก
function Check({ size, className }: { size: number, className: string }) {
  return <Save size={size} className={className} />
}