"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Upload, X, Save, Microscope, TreeDeciduous, 
  Info, Layers, Search, Image as ImageIcon,
  Dna, Ruler, ChevronRight, Loader2
} from 'lucide-react';

export default function AddWoodPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // เพิ่มรูปภาพจาก State
      images.forEach((file) => {
        formData.append('images', file);
      });

      // หมายเหตุ: อย่าลืมส่ง user_id ของผู้ใช้ที่ Login มาใน 'created_by' ด้วยหากต้องการบันทึกข้อมูลผู้สร้าง
      // ตัวอย่าง: formData.append('created_by', session.user.id);

      const response = await fetch('/api/woods/create', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to save');

      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
      router.push('/tree/treesearch');
    } catch (error: any) {
      console.error(error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItems = [
    { id: 'info', label: 'ข้อมูลพื้นฐาน', icon: <Info size={18} /> },
    { id: 'images', label: 'รูปภาพเนื้อไม้', icon: <ImageIcon size={18} /> },
    { id: 'physical', label: 'ลักษณะกายภาพ', icon: <Ruler size={18} /> },
    { id: 'vessels', label: 'ลักษณะรู (Vessels)', icon: <Search size={18} /> },
    { id: 'rays-ap', label: 'รังสีและเนื้อเยื่อพื้น', icon: <Layers size={18} /> },
  ];

  return (
    <div className="bg-[#FBFBFB] h-screen w-full flex flex-col overflow-hidden text-slate-900">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        
        <header className="flex-none bg-white border-b z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#14532D] p-2 rounded-lg">
                <TreeDeciduous className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold">ลงทะเบียนข้อมูลพันธุ์ไม้ใหม่</h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>ยกเลิก</Button>
              <Button type="submit" className="bg-[#14532D] hover:bg-[#0f3d21]" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                บันทึกทั้งหมด
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 h-full py-8">
            <div className="flex flex-col lg:flex-row gap-8 h-full">
              
              <aside className="w-full lg:w-72 flex-none">
                <nav className="space-y-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        activeTab === item.id ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      {activeTab === item.id && <ChevronRight size={16} />}
                    </button>
                  ))}
                </nav>
              </aside>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Section 1: ข้อมูลพื้นฐาน */}
                <div className={activeTab === 'info' ? 'block' : 'hidden'}>
                  <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardHeader className="bg-slate-50/50 border-b"><CardTitle className="text-[#14532D] flex items-center gap-2 text-lg"><Info className="w-5 h-5"/> ข้อมูลพื้นฐาน</CardTitle></CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label>ชื่อวิทยาศาสตร์</Label><Input name="scientific_name" placeholder="Dalbergia oliveri" required /></div>
                      <div className="space-y-2"><Label>ชื่อพื้นเมือง</Label><Input name="common_name" placeholder="ชิงชัน" required /></div>
                      <div className="space-y-2"><Label>ถิ่นกำเนิด</Label><Input name="wood_origin" /></div>
                      <div className="space-y-2">
                        <Label>สถานะการแสดงผล (WoodStatus)</Label>
                        <Select name="wood_status" defaultValue="SHOW">
                          <SelectTrigger><SelectValue placeholder="เลือกสถานะ..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SHOW">SHOW (แสดงผล)</SelectItem>
                            <SelectItem value="HIDE">HIDE (ซ่อน)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-2"><Label>คำอธิบาย</Label><Textarea name="wood_description" rows={5} /></div>
                    </CardContent>
                  </Card>
                </div>

                {/* Section 2: รูปภาพ */}
                <div className={activeTab === 'images' ? 'block' : 'hidden'}>
                  <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardHeader className="bg-slate-50/50 border-b"><CardTitle className="text-[#14532D] flex items-center gap-2 text-lg"><ImageIcon className="w-5 h-5"/> รูปภาพเนื้อไม้</CardTitle></CardHeader>
                    <CardContent className="p-6">
                      <label className="border-2 border-dashed border-slate-200 rounded-2xl p-12 bg-slate-50 hover:bg-emerald-50/50 cursor-pointer flex flex-col items-center transition-colors">
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" />
                        <Upload className="text-emerald-600 mb-2" size={32} />
                        <span className="font-medium text-slate-600">คลิกเพื่อเพิ่มรูปภาพเนื้อไม้</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {previews.map((src, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border group shadow-sm">
                            <img src={src} className="w-full h-full object-cover" alt="preview" />
                            <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Section 3: ลักษณะกายภาพ */}
                <div className={activeTab === 'physical' ? 'block' : 'hidden'}>
                  <Card className="border-l-4 border-l-emerald-600 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardHeader className="border-b"><CardTitle className="text-emerald-800 text-sm font-bold uppercase tracking-widest">Physical Characteristics</CardTitle></CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>น้ำหนักเนื้อไม้ (WoodWeight)</Label>
                        <Select name="wood_weight" defaultValue="MEDIUM">
                          <SelectTrigger><SelectValue placeholder="เลือกน้ำหนัก..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LIGHT">LIGHT (เบา)</SelectItem>
                            <SelectItem value="MEDIUM">MEDIUM (ปานกลาง)</SelectItem>
                            <SelectItem value="HEAVY">HEAVY (หนัก)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label>รสชาติ</Label><Input name="wood_taste" /></div>
                      <div className="space-y-2"><Label>กลิ่น</Label><Input name="wood_odor" /></div>
                      <div className="space-y-2"><Label>เนื้อสัมผัส</Label><Input name="wood_Texture" /></div>
                      <div className="space-y-2"><Label>ความเงา</Label><Input name="wood_luster" /></div>
                      <div className="space-y-2"><Label>เสี้ยนไม้</Label><Input name="wood_grain" /></div>
                      <div className="space-y-2"><Label>สีเนื้อไม้</Label><Input name="wood_colors" /></div>
                      <div className="space-y-2"><Label>ต่างสีแก่น/กระพี้</Label><Input name="sapwood_heartwood_color_diff" /></div>
                      <div className="space-y-2"><Label>วงปี</Label><Input name="growth_rings" /></div>
                      <div className="space-y-2"><Label>Included phloem</Label><Input name="included_phloem" /></div>
                      <div className="space-y-2"><Label>ท่อ (Canals)</Label><Input name="intercellular_canals" /></div>
                    </CardContent>
                  </Card>
                </div>

                {/* Section 4: Vessels */}
                <div className={activeTab === 'vessels' ? 'block' : 'hidden'}>
                  <Card className="border-l-4 border-l-amber-500 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardHeader className="border-b"><CardTitle className="text-amber-800 flex items-center gap-2"><Microscope size={20} /> ลักษณะรู (Vessels)</CardTitle></CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {['vp_porosity', 'vp_vessel_arrangement', 'vp_vessel_grouping', 'vp_inclusions_in_Pores', 'vp_Pores_frequency', 'vp_Pores_size', 'vp_Pores_rays_ratio'].map(field => (
                        <div key={field} className="space-y-2"><Label>{field}</Label><Input name={field} /></div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Section 5: Rays & AP */}
                <div className={activeTab === 'rays-ap' ? 'block' : 'hidden'}>
                  <Card className="border-l-4 border-l-blue-500 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardHeader className="border-b"><CardTitle className="text-blue-800 flex items-center gap-2"><Layers size={20} /> รังสีและเนื้อเยื่อพื้น</CardTitle></CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>ความถี่รังสี (RaysPerMm)</Label>
                        <Select name="rays_per_mm" defaultValue="MEDIUM">
                          <SelectTrigger><SelectValue placeholder="เลือกความถี่..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">LOW (ต่ำ)</SelectItem>
                            <SelectItem value="MEDIUM">MEDIUM (กลาง)</SelectItem>
                            <SelectItem value="HIGH">HIGH (สูง)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {['rays_width', 'rays_two_distinct_sizes', 'rays_aggregate', 'rays_storied_ripple_mark', 'rays_deposit_in_rays', 'ap_type', 'ap_paratracheal', 'ap_apotracheal', 'ap_banded'].map(field => (
                        <div key={field} className="space-y-2"><Label>{field}</Label><Input name={field} /></div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="pb-10"></div>
              </div>
            </div>
          </div>
        </main>
      </form>
    </div>
  );
}