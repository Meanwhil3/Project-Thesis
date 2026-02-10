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
  Upload, X, Save, Microscope, 
  Info, Layers, Search, Image as ImageIcon,
  Ruler, ChevronRight, Loader2, ArrowLeft, Dna
} from 'lucide-react';

export default function AddWoodPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [selectValues, setSelectValues] = useState({
    wood_status: 'SHOW',
    wood_weight: 'MEDIUM',
    rays_per_mm: 'MEDIUM'
  });

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set('wood_status', selectValues.wood_status);
      formData.set('wood_weight', selectValues.wood_weight);
      formData.set('rays_per_mm', selectValues.rays_per_mm);
      images.forEach((file) => formData.append('images', file));

      const response = await fetch('/api/woods/create', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to save');
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
      router.push('/tree/treesearch');
    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // หมวดหมู่เมนูใหม่ตามที่กำหนด
  const menuItems = [
    { id: 'basic', label: '1. ข้อมูลพื้นฐานและอัตลักษณ์', icon: <Info size={18} /> },
    { id: 'images', label: 'รูปภาพประกอบ', icon: <ImageIcon size={18} /> },
    { id: 'physical', label: '2. ลักษณะกายภาพและประสาทสัมผัส', icon: <Ruler size={18} /> },
    { id: 'vessels', label: '3. โครงสร้างภายในและพอร์', icon: <Search size={18} /> },
    { id: 'rays-ap', label: '4. เรย์และพาเรงคิมา', icon: <Layers size={18} /> },
    { id: 'others', label: '5. องค์ประกอบโครงสร้างอื่นๆ', icon: <Dna size={18} /> },
  ];

  return (
    <div className="bg-[#FBFBFB] min-h-screen w-full flex flex-col text-slate-900 font-kanit">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        
        {/* Header */}
        <header className="flex-none bg-white border-b border-[#CDE3BD] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => router.back()} className="p-2 rounded-xl border border-[#CDE3BD] text-[#14532D] hover:bg-[#F6FBF6]"><ArrowLeft size={20} /></button>
              <div>
                <h1 className="text-xl font-bold text-[#14532D]">ลงทะเบียนข้อมูลพันธุ์ไม้</h1>
                <p className="text-xs text-[#6E8E59]">จัดหมวดหมู่ตามโครงสร้างพฤกษศาสตร์ไม้</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="bg-[#14532D] hover:bg-[#0F3F22] text-white rounded-xl px-8 h-11 shadow-lg transition-all">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-80 flex-none">
              <nav className="space-y-1 bg-white p-3 rounded-2xl border border-[#CDE3BD] shadow-sm sticky top-24">
                <p className="px-4 py-2 text-[11px] font-bold text-[#6E8E59] uppercase tracking-widest">หมวดหมู่ข้อมูล</p>
                {menuItems.map((item) => (
                  <button
                    key={item.id} type="button" onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id ? 'bg-[#DCFCE7]/70 text-[#14532D] ring-1 ring-[#86EFAC]' : 'text-slate-500 hover:bg-[#F6FBF6]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={activeTab === item.id ? 'text-[#16A34A]' : 'text-slate-400'}>{item.icon}</span>
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    {activeTab === item.id && <ChevronRight size={16} className="text-[#16A34A]" />}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Form Content */}
            <div className="flex-1 min-h-[600px]">
              
              {/* 1. ข้อมูลพื้นฐานและอัตลักษณ์ */}
              <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] shadow-sm animate-in fade-in duration-300">
                  <CardHeader className="bg-[#F6FBF6] border-b border-[#CDE3BD] py-4">
                    <CardTitle className="text-[#14532D] flex items-center gap-2 text-lg"><Info className="w-5 h-5"/> 1. ข้อมูลพื้นฐานและอัตลักษณ์</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="ชื่อวิทยาศาสตร์ (Scientific Name)" name="scientific_name" placeholder="Dalbergia oliveri" required />
                    <FormField label="ชื่อสามัญ (Common Name)" name="common_name" placeholder="ชิงชัน" required />
                    <FormField label="แหล่งกำเนิด (Wood Origin)" name="wood_origin" />
                    <FormField label="วงปี (Growth Rings)" name="growth_rings" />
                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">สถานะการแสดงผล</Label>
                      <Select value={selectValues.wood_status} onValueChange={(v) => setSelectValues({...selectValues, wood_status: v})}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="SHOW">SHOW</SelectItem><SelectItem value="HIDE">HIDE</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">รายละเอียดไม้ทั่วไป (Description)</Label>
                      <Textarea name="wood_description" rows={4} className="rounded-xl border-[#CDE3BD]" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* รูปภาพ (คงไว้เป็นส่วนเสริม) */}
              <div className={activeTab === 'images' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] shadow-sm animate-in fade-in duration-300">
                  <CardHeader className="bg-[#F6FBF6] border-b border-[#CDE3BD] py-4">
                    <CardTitle className="text-[#14532D] flex items-center gap-2 text-lg"><ImageIcon className="w-5 h-5"/> รูปภาพเนื้อไม้</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <label className="group border-2 border-dashed border-[#CDE3BD] rounded-2xl p-12 bg-[#FBFBFB] hover:bg-[#F6FBF6] cursor-pointer flex flex-col items-center transition-all">
                      <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" />
                      <Upload className="text-[#16A34A]" size={32} />
                      <span className="mt-4 font-semibold text-[#14532D]">อัปโหลดรูปภาพเนื้อไม้</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                      {previews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-[#CDE3BD] group">
                          <img src={src} className="w-full h-full object-cover" alt="preview" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100"><X size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 2. ลักษณะทางกายภาพและประสาทสัมผัส */}
              <div className={activeTab === 'physical' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] border-l-4 border-l-[#16A34A] animate-in fade-in duration-300">
                  <CardHeader className="bg-[#F6FBF6]/50 border-b border-[#CDE3BD]/50">
                    <CardTitle className="text-[#14532D] text-sm font-bold uppercase flex items-center gap-2"><Ruler className="w-4 h-4" /> Physical & Sensory Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="สีของไม้ (Colors)" name="wood_colors" />
                    <FormField label="ความต่างสีแก่น/กระพี้" name="sapwood_heartwood_color_diff" />
                    <FormField label="เนื้อไม้/พื้นผิว (Texture)" name="wood_texture" />
                    <FormField label="ลายเสี้ยน (Grain)" name="wood_grain" />
                    <FormField label="ความมันวาว (Luster)" name="wood_luster" />
                    <FormField label="รสชาติ (Taste)" name="wood_taste" />
                    <FormField label="กลิ่น (Odor)" name="wood_odor" />
                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">น้ำหนัก (Weight Enum)</Label>
                      <Select value={selectValues.wood_weight} onValueChange={(v) => setSelectValues({...selectValues, wood_weight: v})}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="LIGHT">LIGHT</SelectItem><SelectItem value="MEDIUM">MEDIUM</SelectItem><SelectItem value="HEAVY">HEAVY</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 3. ลักษณะโครงสร้างภายในและพอร์ */}
              <div className={activeTab === 'vessels' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] border-l-4 border-l-amber-500 animate-in fade-in duration-300">
                  <CardHeader className="bg-amber-50/30 border-b border-[#CDE3BD]/50">
                    <CardTitle className="text-amber-800 flex items-center gap-2 text-lg"><Microscope size={20} /> 3. Pores / Vessels Structure</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="การกระจายพอร์ (Porosity)" name="vp_porosity" />
                    <FormField label="การจัดกลุ่ม (Grouping)" name="vp_vessel_grouping" />
                    <FormField label="การเรียงตัว (Arrangement)" name="vp_vessel_arrangement" />
                    <FormField label="ความถี่พอร์ (Frequency)" name="vp_Pores_frequency" />
                    <FormField label="ขนาดพอร์ (Size)" name="vp_Pores_size" />
                    <FormField label="สิ่งที่อยู่ในพอร์ (Inclusions)" name="vp_inclusions_in_Pores" />
                    <FormField label="สัดส่วนเรย์/พอร์" name="vp_Pores_rays_ratio" />
                  </CardContent>
                </Card>
              </div>

              {/* 4. ลักษณะของเรย์และเนื้อเยื่อพาราเรงคิมา */}
              <div className={activeTab === 'rays-ap' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] border-l-4 border-l-blue-500 animate-in fade-in duration-300">
                  <CardHeader className="bg-blue-50/30 border-b border-[#CDE3BD]/50">
                    <CardTitle className="text-blue-800 flex items-center gap-2 text-lg"><Layers size={20} /> 4. Rays & Parenchyma</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Rays Section */}
                      <div className="md:col-span-3 border-b pb-2 mb-2"><h4 className="text-sm font-bold text-blue-700">Rays (เรย์)</h4></div>
                      <div className="space-y-2">
                        <Label className="text-[#14532D] text-sm font-medium">จำนวนเรย์ต่อมม. (Enum)</Label>
                        <Select value={selectValues.rays_per_mm} onValueChange={(v) => setSelectValues({...selectValues, rays_per_mm: v})}>
                          <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="LOW">LOW</SelectItem><SelectItem value="MEDIUM">MEDIUM</SelectItem><SelectItem value="HIGH">HIGH</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <FormField label="ความกว้างเรย์" name="rays_width" />
                      <FormField label="ความต่างขนาดเรย์" name="rays_two_distinct_sizes" />
                      <FormField label="ลักษณะเรย์รวม" name="rays_aggregate" />
                      <FormField label="ลายริ้ว/เป็นชั้น" name="rays_storied_ripple_mark" />
                      <FormField label="สิ่งสะสมในเรย์" name="rays_deposit_in_rays" />

                      {/* Parenchyma Section */}
                      <div className="md:col-span-3 border-b pb-2 mb-2 mt-4"><h4 className="text-sm font-bold text-blue-700">Parenchyma (พาเรงคิมา)</h4></div>
                      <FormField label="ชนิดพาเรงคิมา" name="ap_type" />
                      <FormField label="แบบติดพอร์" name="ap_paratracheal" />
                      <FormField label="แบบไม่ติดพอร์" name="ap_apotracheal" />
                      <FormField label="แบบเป็นแถบ" name="ap_banded" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 5. องค์ประกอบโครงสร้างอื่นๆ */}
              <div className={activeTab === 'others' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] border-l-4 border-l-purple-500 animate-in fade-in duration-300">
                  <CardHeader className="bg-purple-50/30 border-b border-[#CDE3BD]/50">
                    <CardTitle className="text-purple-800 flex items-center gap-2 text-lg"><Dna size={20} /> 5. Other Anatomical Features</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="โฟลเอ็มในไม้ (Included Phloem)" name="included_phloem" />
                    <FormField label="ท่อระหว่างเซลล์ (Intercellular Canals)" name="intercellular_canals" />
                  </CardContent>
                </Card>
              </div>

              <div className="h-20" />
            </div>
          </div>
        </main>
      </form>
    </div>
  );
}

function FormField({ label, name, placeholder, required = false }: { label: string, name: string, placeholder?: string, required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label className="text-[#14532D] text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</Label>
      <Input name={name} placeholder={placeholder || `ระบุ ${label}...`} required={required} className="h-11 rounded-xl border-[#CDE3BD] focus:ring-[#4CA771]/25 transition-all" />
    </div>
  );
}