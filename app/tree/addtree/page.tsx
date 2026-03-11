"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react"; // เพิ่มการดึง Session
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Upload, X, Save, Microscope,
  Info, Layers, Search, Image as ImageIcon,
  Ruler, ChevronRight, Loader2, ArrowLeft, Dna, MapPin, 
  Plus, UploadCloud, TextCursorInput, Palette, Droplets, Wind
} from 'lucide-react';

export default function AddWoodPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); // ดึงข้อมูล Session
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // --- ตรวจสอบสิทธิ์ (Role Protection) ---
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      const role = String((session?.user as any)?.role ?? "").toUpperCase();
      if (role !== "ADMIN" && role !== "INSTRUCTOR") {
        alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
        router.push("/tree/treesearch");
      }
    }
  }, [status, session, router]);

  // จัดการค่า Select ทั้งหมด
  const [selectValues, setSelectValues] = useState({
    wood_status: 'SHOW',
    wood_weight: 'MEDIUM',
    rays_per_mm: '',
    wood_origin: '',
    wood_colors: '',
    sapwood_heartwood_color_diff: '',
    wood_odor: 'ไม่มีกลิ่น',
    wood_taste: 'ไม่มีรส',
    wood_luster: '',
    wood_texture: '',
    wood_grain: '',
    growth_rings: '',
    vp_porosity: '',
    vp_vessel_arrangement: '',
    vp_vessel_grouping: '',
    vp_Pores_size: '',
    vp_Pores_frequency: '',
    vp_inclusions_in_Pores: '',
    ap_type: '',
    ap_apotracheal: '',
    ap_paratracheal: '',
    ap_banded: '',
    rays_width: '',
    vp_Pores_rays_ratio: '',
    rays_two_distinct_sizes: '',
    rays_aggregate: '',
    rays_storied_ripple_mark: '',
    rays_deposit_in_rays: '',
    included_phloem: '',
    intercellular_canals: ''
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
      Object.entries(selectValues).forEach(([key, value]) => {
        formData.set(key, value);
      });
      images.forEach((file) => formData.append('images', file));

      // หมายเหตุ: created_by จะถูกจัดการที่ฝั่ง API Route โดยดึงจาก Session 
      // เพื่อความปลอดภัยตามมาตรฐาน Server-side validation
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

  const menuItems = [
    { id: 'basic', label: 'ข้อมูลพื้นฐานและอัตลักษณ์', icon: <Info size={18} /> },
    { id: 'images', label: 'รูปภาพประกอบ', icon: <ImageIcon size={18} /> },
    { id: 'physical', label: 'ลักษณะกายภาพ', icon: <Ruler size={18} /> },
    { id: 'vessels', label: 'โครงสร้างเนื้อไม้ (Vessels)', icon: <Search size={18} /> },
    { id: 'rays-ap', label: 'เรย์และพาเรงคิมา', icon: <Layers size={18} /> },
    { id: 'others', label: 'องค์ประกอบอื่นๆ', icon: <Dna size={18} /> },
  ];

  // ถ้ากำลังโหลด Session ให้แสดง Loader กันหน้ากระพริบ
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#14532D]" /></div>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col text-slate-900 font-kanit">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">

        {/* --- Header --- */}
        <header className="flex-none bg-white border-b border-[#CDE3BD] sticky top-0 z-50 shadow-[0_2px_10px_-4px_rgba(202,224,188,0.5)]">
          <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-2 rounded-xl border border-[#CDE3BD] bg-white px-3 py-2 text-sm font-medium text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/50 transition hover:bg-[#F6FBF6] active:scale-[0.99]">
                <ArrowLeft size={18} /> กลับ
              </button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#14532D]">ลงทะเบียนข้อมูลพันธุ์ไม้</h1>
                <p className="text-sm text-[#6E8E59]">จัดหมวดหมู่ตามโครงสร้างพฤกษศาสตร์</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting} className="bg-[#14532D] hover:bg-[#0F3F22] text-white rounded-xl px-6 h-11 font-semibold shadow-[0_10px_30px_-18px_rgba(20,83,45,0.65)] transition-all">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* --- Sidebar Navigation --- */}
            <aside className="w-full lg:w-72 flex-none">
              <nav className="space-y-1.5 bg-white p-3 rounded-2xl border border-[#CDE3BD] shadow-[0_0_4px_0_#CAE0BC]/50 sticky top-28">
                <p className="px-4 py-2 text-[11px] font-bold text-[#6E8E59] uppercase tracking-widest opacity-80">หมวดหมู่ข้อมูล</p>
                {menuItems.map((item) => (
                  <button
                    key={item.id} type="button" onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === item.id ? 'bg-[#DCFCE7]/70 text-[#14532D] ring-1 ring-[#86EFAC] shadow-sm' : 'text-slate-500 hover:bg-[#F6FBF6]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={activeTab === item.id ? 'text-[#16A34A]' : 'text-[#86A97A]'}>{item.icon}</span>
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    {activeTab === item.id && <ChevronRight size={16} className="text-[#16A34A]" />}
                  </button>
                ))}
              </nav>
            </aside>

            {/* --- Main Content Area --- */}
            <div className="flex-1">
              <div className="rounded-2xl border border-[#CDE3BD] bg-white p-1 shadow-[0_0_4px_0_#CAE0BC]/50 overflow-hidden">
                
                {/* 1. Basic Info */}
                <div className={activeTab === 'basic' ? 'block p-6 animate-in fade-in duration-300' : 'hidden'}>
                  <div className="mb-6 flex items-center gap-3 border-b border-[#F0F7EB] pb-4">
                    <div className="bg-[#DCFCE7] p-2 rounded-lg text-[#16A34A]"><Info size={20} /></div>
                    <h2 className="text-lg font-bold text-[#14532D]">ข้อมูลพื้นฐานและอัตลักษณ์</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="ชื่อวิทยาศาสตร์" name="scientific_name" placeholder="เช่น Dalbergia oliveri" icon={Dna} required />
                    <Field label="ชื่อสามัญ" name="common_name" placeholder="เช่น ชิงชัน" icon={TextCursorInput} required />
                    <SelectField label="ถิ่นกำเนิดไม้ (Geographic distribution)" value={selectValues.wood_origin} onValueChange={(v: string)=>setSelectValues({...selectValues, wood_origin: v})} icon={MapPin}>
                        <SelectItem value="Europe and temperate Asia">Europe and temperate Asia</SelectItem>
                        <SelectItem value="Central South Asia">Central South Asia</SelectItem>
                        <SelectItem value="Southeast Asia and the Pacific">Southeast Asia and the Pacific</SelectItem>
                        <SelectItem value="Australia and New Zealand">Australia and New Zealand</SelectItem>
                        <SelectItem value="Tropical mainland Africa and adjacent islands">Tropical mainland Africa and adjacent islands</SelectItem>
                        <SelectItem value="Southern Africa">Southern Africa</SelectItem>
                        <SelectItem value="North America, north of Mexico">North America, north of Mexico</SelectItem>
                        <SelectItem value="Neotropics and temperate Brazil">Neotropics and temperate Brazil</SelectItem>
                        <SelectItem value="Temperate South America including Argentina, Chile, Uruguay, and S. Paraguay">Temperate South America including Argentina, Chile, Uruguay, and S. Paraguay</SelectItem>
                    </SelectField>
                    <SelectField label="วงเจริญเติบโต (Growth rings)" value={selectValues.growth_rings} onValueChange={(v: string)=>setSelectValues({...selectValues, growth_rings: v})} icon={Layers}>
                        <SelectItem value="มีเห็นได้อย่างชัดเจน">มีเห็นได้อย่างชัดเจน</SelectItem>
                        <SelectItem value="ไม่มีหรือเห็นไม่ชัดเจน">ไม่มีหรือเห็นไม่ชัดเจน</SelectItem>
                    </SelectField>
                    <SelectField label="สถานะการแสดงผล" value={selectValues.wood_status} onValueChange={(v: string)=>setSelectValues({...selectValues, wood_status: v})} icon={Plus}>
                        <SelectItem value="SHOW">SHOW</SelectItem>
                        <SelectItem value="HIDE">HIDE</SelectItem>
                    </SelectField>
                  </div>
                  <div className="mt-6">
                    <Label className="text-[#14532D] text-sm font-medium mb-2 block">รายละเอียดไม้ทั่วไป (Description)</Label>
                    <Textarea name="wood_description" rows={4} className="w-full rounded-xl border-[#CDE3BD] bg-white p-4 text-sm text-[#14532D] placeholder:text-[#93B08A] shadow-[0_0_4px_0_#CAE0BC]/50 focus:ring-2 focus:ring-[#4CA771]/25 focus:border-[#4CA771] outline-none transition-all" />
                  </div>
                </div>

                {/* 2. Images */}
                <div className={activeTab === 'images' ? 'block p-6 animate-in fade-in duration-300' : 'hidden'}>
                  <div className="mb-6 flex items-center gap-3 border-b border-[#F0F7EB] pb-4">
                    <div className="bg-[#DCFCE7] p-2 rounded-lg text-[#16A34A]"><ImageIcon size={20} /></div>
                    <h2 className="text-lg font-bold text-[#14532D]">รูปภาพเนื้อไม้</h2>
                  </div>
                  <label className="group relative flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#CDE3BD] bg-white px-4 py-8 text-center shadow-[0_0_4px_0_#CAE0BC]/50 transition hover:bg-[#F6FBF6] hover:border-[#4CA771] cursor-pointer">
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" />
                    <UploadCloud className="h-8 w-8 text-[#16A34A]" />
                    <span className="text-sm font-semibold text-[#14532D]">ลากรูปภาพมาวาง หรือคลิกเพื่อเลือกไฟล์</span>
                    <span className="text-xs text-[#6E8E59]">รองรับไฟล์ภาพหลายรูป ไม่เกิน 5MB ต่อไฟล์</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {previews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-[#CDE3BD] group shadow-sm">
                        <img src={src} className="w-full h-full object-cover" alt="preview" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Physical */}
                <div className={activeTab === 'physical' ? 'block p-6 animate-in fade-in duration-300' : 'hidden'}>
                  <div className="mb-6 flex items-center gap-3 border-b border-[#F0F7EB] pb-4">
                    <div className="bg-[#FFFBEB] p-2 rounded-lg text-amber-600"><Ruler size={20} /></div>
                    <h2 className="text-lg font-bold text-[#14532D]">Physical & Sensory Properties</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="สีของแก่นไม้ (Heartwood color)" value={selectValues.wood_colors} onValueChange={(v: string)=>setSelectValues({...selectValues, wood_colors: v})} icon={Palette}>
                      <SelectItem value="สีน้ำตาลหรือโทนสีน้ำตาล (Brown or shades of brown)">สีน้ำตาลหรือโทนสีน้ำตาล (Brown or shades of brown)</SelectItem>
                      <SelectItem value="สีแดงหรือโทนสีแดง (Red or shades of red)">สีแดงหรือโทนสีแดง (Red or shades of red)</SelectItem>
                      <SelectItem value="สีเหลืองหรือโทนสีเหลือง (Yellow or shades of yellow)">สีเหลืองหรือโทนสีเหลือง (Yellow or shades of yellow)</SelectItem>
                      <SelectItem value="สีขาวหรือเทา (White or Gray)">สีขาวหรือเทา (White or Gray)</SelectItem>
                      <SelectItem value="สีดำ (Black)">สีดำ (Black)</SelectItem>
                      <SelectItem value="สีม่วง (Purple)">สีม่วง (Purple)</SelectItem>
                      <SelectItem value="สีส้ม (Orange)">สีส้ม (Orange)</SelectItem>
                      <SelectItem value="สีเขียว (Green)">สีเขียว (Green)</SelectItem>
                    </SelectField>
                    <SelectField label="ความแตกต่างของสีกระพี้และสีแก่นไม้" value={selectValues.sapwood_heartwood_color_diff} onValueChange={(v: string)=>setSelectValues({...selectValues, sapwood_heartwood_color_diff: v})} icon={Layers}>
                        <SelectItem value="สีกระพี้และสีแก่นไม้แตกต่างกันอย่างชัดเจน">สีกระพี้และสีแก่นไม้แตกต่างกันอย่างชัดเจน</SelectItem>
                        <SelectItem value="สีกระพี้เหมือนหรือใกล้เคียงกับสีแก่นไม้">สีกระพี้เหมือนหรือใกล้เคียงกับสีแก่นไม้</SelectItem>
                    </SelectField>
                    <SelectField label="ความหยาบละเอียดของเนื้อไม้ (Texture)" value={selectValues.wood_texture} onValueChange={(v: string)=>setSelectValues({...selectValues, wood_texture: v})} icon={Droplets}>
                        <SelectItem value="เนื้อไม้หยาบ (Coarse texture)">เนื้อไม้หยาบ (Coarse texture)</SelectItem>
                        <SelectItem value="เนื้อไม้หยาบปานกลาง (Medium texture)">เนื้อไม้หยาบปานกลาง (Medium texture)</SelectItem>
                        <SelectItem value="เนื้อไม้ละเอียด (Fine texture)">เนื้อไม้ละเอียด (Fine texture)</SelectItem>
                    </SelectField>
                    <SelectField label="เสี้ยนเนื้อไม้ (Grain)" value={selectValues.wood_grain} onValueChange={(v: string)=>setSelectValues({...selectValues, wood_grain: v})} icon={Layers}>
                        <SelectItem value="เสี้ยนตรง (Straight grain)">เสี้ยนตรง (Straight grain)</SelectItem>
                        <SelectItem value="เสี้ยนบิด (Spiral gain)">เสี้ยนบิด (Spiral gain)</SelectItem>
                        <SelectItem value="เสี้ยนสน (Interlocked grain)">เสี้ยนสน (Interlocked grain)</SelectItem>
                    </SelectField>
                    <SelectField label="ความมันวาว (Luster)" value={selectValues.wood_luster} onValueChange={(v: string)=>setSelectValues({...selectValues, wood_luster: v})} icon={Palette}>
                        <SelectItem value="เป็นมันวาว (Lustrous)">เป็นมันวาว (Lustrous)</SelectItem>
                        <SelectItem value="ด้าน (Dull)">ด้าน (Dull)</SelectItem>
                    </SelectField>
                    <SelectField label="รส (Taste)" value={selectValues.wood_taste} onValueChange={(v: string)=>setSelectValues({...selectValues, wood_taste: v})} icon={Droplets}>
                        <SelectItem value="มีรส">มีรส</SelectItem>
                        <SelectItem value="ไม่มีรส">ไม่มีรส</SelectItem>
                    </SelectField>
                    <SelectField label="กลิ่น (Odor)" value={selectValues.wood_odor} onValueChange={(v: string)=>setSelectValues({...selectValues, wood_odor: v})} icon={Wind}>
                        <SelectItem value="มีกลิ่น">มีกลิ่น</SelectItem>
                        <SelectItem value="ไม่มีกลิ่น">ไม่มีกลิ่น</SelectItem>
                    </SelectField>
                    <SelectField label="น้ำหนัก (Weight)" value={selectValues.wood_weight} onValueChange={(v: string)=>setSelectValues({...selectValues, wood_weight: v})} icon={Wind}>
                        <SelectItem value="LIGHT">ต่ำ (น้ำหนัก ≤ 0.40)</SelectItem>
                        <SelectItem value="MEDIUM">กลาง (น้ำหนัก 0.40 - 0.75)</SelectItem>
                        <SelectItem value="HEAVY">สูง (น้ำหนัก ≥ 0.75)</SelectItem>
                    </SelectField>
                  </div>
                </div>

                {/* 4. Vessels */}
                <div className={activeTab === 'vessels' ? 'block p-6 animate-in fade-in duration-300' : 'hidden'}>
                  <div className="mb-6 flex items-center gap-3 border-b border-[#F0F7EB] pb-4">
                    <div className="bg-amber-50 p-2 rounded-lg text-amber-700"><Microscope size={20} /></div>
                    <h2 className="text-lg font-bold text-[#14532D]">3. Pores / Vessels Structure</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="การกระจายของพอร์ (Porosity)" value={selectValues.vp_porosity} onValueChange={(v: string)=>setSelectValues({...selectValues, vp_porosity: v})} icon={Search}>
                        <SelectItem value="ไม่พอร์วง (Ring-porous wood)">ไม้พอร์วง (Ring-porous wood)</SelectItem>
                        <SelectItem value="ไม้พอร์กระจาย (Diffuse-porous wood)">ไม้พอร์กระจาย (Diffuse-porous wood)</SelectItem>
                        <SelectItem value="ไม้พอร์กึ่งวง (Semi-ring-porous wood)">ไม้พอร์กึ่งวง (Semi-ring-porous wood)</SelectItem>
                    </SelectField>
                    <SelectField label="กลุ่มของพอร์ (Vessel grouping)" value={selectValues.vp_vessel_grouping} onValueChange={(v: string)=>setSelectValues({...selectValues, vp_vessel_grouping: v})} icon={Search}>
                        <SelectItem value="พอร์เดี่ยว">พอร์เดี่ยว</SelectItem>
                        <SelectItem value="พอร์แฝด">พอร์แฝด</SelectItem>
                        <SelectItem value="พอร์เรียงเป็นกลุ่ม">พอร์กลุ่ม</SelectItem>
                    </SelectField>
                    <SelectField label="การเรียงตัวของพอร์ (Vessel arrangement)" value={selectValues.vp_vessel_arrangement} onValueChange={(v: string)=>setSelectValues({...selectValues, vp_vessel_arrangement: v})} icon={Search}>
                        <SelectItem value="พอร์เรียงตัวเป็นแถบตามแนวด้านสัมผัส">พอร์เรียงตัวเป็นแถบตามแนวด้านสัมผัส</SelectItem>
                        <SelectItem value="พอร์เรียงตัวแนวเฉียง และ/หรือ เรียงตามแนวรัศมี">พอร์เรียงตัวแนวเฉียง และ/หรือ เรียงตามแนวรัศมี</SelectItem>
                        <SelectItem value="พอร์เรียงเป็นกลุ่ม">พอร์เรียงเป็นกลุ่ม</SelectItem>
                    </SelectField>
                    <SelectField label="จำนวนของพอร์" value={selectValues.vp_Pores_frequency} onValueChange={(v: string)=>setSelectValues({...selectValues, vp_Pores_frequency: v})} icon={Search}>
                        <SelectItem value="หนาแน่นน้อยมาก ( ≤ 5 vessels per square millimeter )">หนาแน่นน้อยมาก ( ≤ 5 vessels per square millimeter )</SelectItem>
                        <SelectItem value="หนาแน่นน้อย ( 5 - 20 vessels per square millimeter )">หนาแน่นน้อย ( 5 - 20 vessels per square millimeter )</SelectItem>
                        <SelectItem value="หนาแน่นปานกลาง ( 20 - 40 vessels per square millimeter )">หนาแน่นปานกลาง ( 20 - 40 vessels per square millimeter )</SelectItem>
                        <SelectItem value="หนาแน่นมาก ( 40 - 100 vessels per square millimeter )">หนาแน่นมาก ( 40 - 100 vessels per square millimeter )</SelectItem>
                        <SelectItem value="หนาแน่นสูงมาก ( ≥ 100 vessels per square millimeter )">หนาแน่นสูงมาก ( ≥ 100 vessels per square millimeter )</SelectItem>
                    </SelectField>
                    <SelectField label="ขนาดความโตของพอร์ (Pores size)" value={selectValues.vp_Pores_size} onValueChange={(v: string)=>setSelectValues({...selectValues, vp_Pores_size: v})} icon={Search}>
                        <SelectItem value="พอร์ขนาดใหญ่ ขนาดที่เห็นได้อย่างสบาย">พอร์ขนาดใหญ่ ขนาดที่เห็นได้อย่างสบาย</SelectItem>
                        <SelectItem value="พอร์ขนาดกลาง ขนาดที่พอเห็นได้">พอร์ขนาดกลาง ขนาดที่พอเห็นได้</SelectItem>
                        <SelectItem value="พอร์ขนาดเล็ก ขนาดที่เห็นได้ด้วยแว่นขยาย">พอร์ขนาดเล็ก ขนาดที่เห็นได้ด้วยแว่นขยาย</SelectItem>
                        <SelectItem value="พอร์ขนาดเล็กมาก ขนาดที่พอมองเห็นได้ต้องใช้แว่นขยาย 10 - 15 เท่า">พอร์ขนาดเล็กมาก ขนาดที่พอมองเห็นได้ต้องใช้แว่นขยาย 10 - 15 เท่า</SelectItem>
                    </SelectField>
                    <SelectField label="สิ่งที่อยู่ในพอร์ (Inclusions in pores)" value={selectValues.vp_inclusions_in_Pores} onValueChange={(v: string)=>setSelectValues({...selectValues, vp_inclusions_in_Pores: v})} icon={Search}>
                        <SelectItem value="ไทโลส ( Tyloses )">ไทโลส ( Tyloses )</SelectItem>
                        <SelectItem value="ดีพอซิท ( Deposit )">ดีพอซิท ( Deposit )</SelectItem>
                        <SelectItem value="ยางไม้ ( Gum )">ยางไม้ ( Gum )</SelectItem>
                    </SelectField>
                    <SelectField label="สัดส่วนเรย์กับพอร์" value={selectValues.vp_Pores_rays_ratio} onValueChange={(v: string)=>setSelectValues({...selectValues, vp_Pores_rays_ratio: v})} icon={Search}>
                        <SelectItem value="เรย์มีขนาดเล็กกว่าขนาดความกว้างของพอร์">เรย์มีขนาดเล็กกว่าความกว้างพอร์</SelectItem>
                        <SelectItem value="เรย์มีขนาดเท่ากับขนาดของพอร์">เรย์มีขนาดเท่ากับพอร์</SelectItem>
                        <SelectItem value="เรย์มีขนาดใหญ่กว่าพอร์">เรย์มีขนาดใหญ่กว่าพอร์</SelectItem>
                    </SelectField>
                  </div>
                </div>

                {/* 5. Rays & AP */}
                <div className={activeTab === 'rays-ap' ? 'block p-6 animate-in fade-in duration-300' : 'hidden'}>
                  <div className="mb-6 flex items-center gap-3 border-b border-[#F0F7EB] pb-4">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-700"><Layers size={20} /></div>
                    <h2 className="text-lg font-bold text-[#14532D]">4. Rays & Parenchyma</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider">Rays (เรย์)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectField label="จำนวนของเส้นเรย์" value={selectValues.rays_per_mm} onValueChange={(v: string)=>setSelectValues({...selectValues, rays_per_mm: v})} icon={Layers}>
                                <SelectItem value="LOW">น้อย (น้อยกว่า 4 เส้น/มม.)</SelectItem>
                                <SelectItem value="MEDIUM">ปานกลาง (4 - 12 เส้น/มม.)</SelectItem>
                                <SelectItem value="HIGH">มาก (มากกว่า 12 เส้น/มม.)</SelectItem>
                            </SelectField>
                            <SelectField label="ขนาดความกว้างของเส้นเรย์" value={selectValues.rays_width} onValueChange={(v: string)=>setSelectValues({...selectValues, rays_width: v})} icon={Layers}>
                                <SelectItem value="เล็กมาก คือ ขนาดที่พอเห็นได้ด้วยแว่นขยาย">เล็กมาก (พอเห็นได้ด้วยแว่นขยาย)</SelectItem>
                                <SelectItem value="เล็ก คือ ขนาดที่เห็นได้ด้วยแว่นขยาย">เล็ก (เห็นได้ด้วยแว่นขยาย)</SelectItem>
                                <SelectItem value="ปานกลาง คือ ขนาดที่พอเห็นได้ด้วยตา">ปานกลาง (พอเห็นได้ด้วยตาเปล่า)</SelectItem>
                                <SelectItem value="ใหญ่ คือ ขนาดที่เห็นอย่างสบาย ๆ ด้วยตาเปล่า">ใหญ่ (เห็นสบายๆ ด้วยตาเปล่า)</SelectItem>
                            </SelectField>
                            <SelectField label="เรย์มีสองขนาด" value={selectValues.rays_two_distinct_sizes} onValueChange={(v: string)=>setSelectValues({...selectValues, rays_two_distinct_sizes: v})} icon={Layers}>
                                <SelectItem value="มี">มี</SelectItem>
                                <SelectItem value="ไม่มี">ไม่มี</SelectItem>
                            </SelectField>
                            <SelectField label="ลักษณะเรย์รวม" value={selectValues.rays_aggregate} onValueChange={(v: string)=>setSelectValues({...selectValues, rays_aggregate: v})} icon={Layers}>
                                <SelectItem value="มี">มี</SelectItem>
                                <SelectItem value="ไม่มี">ไม่มี</SelectItem>
                            </SelectField>
                            <SelectField label="ลักษณะเรย์เป็นชั้นๆ หรือ ริ้วลาย" value={selectValues.rays_storied_ripple_mark} onValueChange={(v: string)=>setSelectValues({...selectValues, rays_storied_ripple_mark: v})} icon={Layers}>
                                <SelectItem value="มี">มี</SelectItem>
                                <SelectItem value="ไม่มี">ไม่มี</SelectItem>
                            </SelectField>
                            <SelectField label="ดีพอซิทในเส้นเรย์" value={selectValues.rays_deposit_in_rays} onValueChange={(v: string)=>setSelectValues({...selectValues, rays_deposit_in_rays: v})} icon={Layers}>
                                <SelectItem value="มีสี">มีสี</SelectItem>
                                <SelectItem value="ไม่มี">ไม่มี</SelectItem>
                            </SelectField>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#F0F7EB]">
                        <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider">Parenchyma (พาเรงคิมา)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectField label="ประเภทของพาเรงคิมา" value={selectValues.ap_type} onValueChange={(v: string)=>setSelectValues({...selectValues, ap_type: v})} icon={Layers}>
                                <SelectItem value="พาเรงคิมาแบบไม่ติดพอร์ ( Apotracheal axial parenchyma )">Apotracheal (ไม่ติดพอร์)</SelectItem>
                                <SelectItem value="พาเรงคิมาที่ติดพอร์ ( Paratracheal axial parenchyma )">Paratracheal (ติดพอร์)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบแถบ ( Banded parenchyma )">Banded (แบบแถบ)</SelectItem>
                            </SelectField>
                            <SelectField label="พาเรงคิมาที่ติดพอร์" value={selectValues.ap_paratracheal} onValueChange={(v: string)=>setSelectValues({...selectValues, ap_paratracheal: v})} icon={Layers}>
                                <SelectItem value="พาเรงคิมาแบบติดพอร์เป็นหย่อม (Axial parenchyma scanty)">Scanty (เป็นหย่อม)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบติดพอร์ด้านเดียว (Axial parenchyma unilateral)">Unilateral (ด้านเดียว)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบรอบพอร์ (Axial parenchyma vasicentric)">Vasicentric (รอบพอร์)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบปีก (Axial parenchyma aliform)">Aliform (แบบปีก)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบปีกสั้น (Axial parenchyma lozenge-aliform)">Lozenge-aliform (ปีกสั้น)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบปีกยาว (Axial parenchyma winged-aliform)">Winged-aliform (ปีกยาว)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบปีกต่อ (Axial parenchyma confluent)">Confluent (ปีกต่อ)</SelectItem>
                            </SelectField>
                            <SelectField label="พาเรงคิมาแบบไม่ติดพอร์" value={selectValues.ap_apotracheal} onValueChange={(v: string)=>setSelectValues({...selectValues, ap_apotracheal: v})} icon={Layers}>
                                <SelectItem value="พาเรงคิมาแบบกระจาย (diffuse parenchyma)">Diffuse (แบบกระจาย)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบกลุ่มกระจาย (diffuse-in-aggregates parenchyma)">Diffuse-in-aggregates</SelectItem>
                            </SelectField>
                            <SelectField label="พาเรงคิมาแบบแถบ" value={selectValues.ap_banded} onValueChange={(v: string)=>setSelectValues({...selectValues, ap_banded: v})} icon={Layers}>
                                <SelectItem value="พาเรงคิมาแบบแถบกว้าง">แบบแถบกว้าง</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบแถบแคบ">แบบแถบแคบ</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบตาข่าย (Axial parenchyma reticulate)">Reticulate (แบบตาข่าย)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบบันได (Axial parenchyma scalariform)">Scalariform (แบบบันได)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบขอบ">แบบขอบ</SelectItem>
                            </SelectField>
                        </div>
                    </div>
                  </div>
                </div>

                {/* 6. Others */}
                <div className={activeTab === 'others' ? 'block p-6 animate-in fade-in duration-300' : 'hidden'}>
                  <div className="mb-6 flex items-center gap-3 border-b border-[#F0F7EB] pb-4">
                    <div className="bg-purple-50 p-2 rounded-lg text-purple-700"><Dna size={20} /></div>
                    <h2 className="text-lg font-bold text-[#14532D]">5. Other Anatomical Features</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="โฟลเอ็มในไม้" value={selectValues.included_phloem} onValueChange={(v: string)=>setSelectValues({...selectValues, included_phloem: v})} icon={Layers}>
                        <SelectItem value="มี">มี</SelectItem>
                        <SelectItem value="ไม่มี">ไม่มี</SelectItem>
                    </SelectField>
                    <SelectField label="ท่อระหว่างเซลล์" value={selectValues.intercellular_canals} onValueChange={(v: string)=>setSelectValues({...selectValues, intercellular_canals: v})} icon={Layers}>
                        <SelectItem value="ท่อเรียงต่อกันเป็นเส้นยาว (Axial canals in long tangential lines)">เรียงต่อกันเป็นเส้นยาว (Long lines)</SelectItem>
                        <SelectItem value="ท่อเรียงต่อกันเป็นเส้นสั้น ๆ (Axial canals in short tangential lines)">เรียงต่อกันเป็นเส้นสั้นๆ (Short lines)</SelectItem>
                    </SelectField>
                  </div>
                </div>

              </div>
              <div className="h-20" />
            </div>
          </div>
        </main>
      </form>
    </div>
  );
}

// --- Helper Components ---

function Field({ label, name, placeholder, icon: Icon, required = false }: any) {
  return (
    <div className="space-y-2">
      <Label className="text-[#14532D] text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86A97A]" />
        <Input 
          name={name} 
          placeholder={placeholder} 
          required={required} 
          className="h-11 w-full rounded-xl border-[#CDE3BD] bg-white pl-9 pr-4 text-sm text-[#14532D] placeholder:text-[#93B08A] shadow-[0_0_4px_0_#CAE0BC]/50 outline-none focus:ring-2 focus:ring-[#4CA771]/25 focus:border-[#4CA771] transition-all" 
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onValueChange, icon: Icon, children, placeholder = "เลือกรายการ..." }: any) {
  return (
    <div className="space-y-2 font-kanit">
      <Label className="text-[#14532D] text-sm font-medium">{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86A97A] z-10" />
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="h-11 w-full rounded-xl border-[#CDE3BD] bg-white pl-9 pr-4 text-sm text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/50 outline-none focus:ring-2 focus:ring-[#4CA771]/25 focus:border-[#4CA771] transition-all text-left relative z-0">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          
          <SelectContent className="rounded-xl border-[#CDE3BD] bg-white shadow-2xl max-h-80 overflow-y-auto z-[9999] relative">
            <style jsx global>{`
              [data-radix-select-viewport] {
                background-color: white !important;
                border-radius: 12px;
              }
              
              [data-radix-select-viewport] [role="option"] {
                padding: 10px 12px 10px 32px;
                border-radius: 8px;
                margin: 2px 4px;
                font-size: 14px;
                color: #1e293b;
                background-color: white; 
                transition: all 0.2s;
                cursor: pointer;
                position: relative;
              }

              [data-radix-select-viewport] [role="option"]:hover,
              [data-radix-select-viewport] [role="option"][data-highlighted] {
                background-color: #DCFCE7 !important;
                color: #14532D !important;
                outline: none;
              }

              [data-radix-select-viewport] [role="option"][data-state="checked"] {
                background-color: #14532D !important;
                color: #ffffff !important;
              }

              .SelectContent {
                background-color: white !important;
              }
            `}</style>
            {children}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}