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
  Ruler, ChevronRight, Loader2, ArrowLeft, Dna, MapPin
} from 'lucide-react';

export default function AddWoodPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // จัดการค่า Select ทั้งหมดที่นี่
  const [selectValues, setSelectValues] = useState({
    wood_status: 'SHOW',
    wood_weight: 'MEDIUM',
    rays_per_mm: 'MEDIUM',
    wood_origin: '', // เพิ่มตัวแปรสำหรับถิ่นกำเนิดไม้
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
    // เพิ่มตัวแปรสำหรับถิ่นกำเนิดไม้
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

      // แทรกค่าจาก Select states เข้าไปใน FormData
      formData.set('wood_status', selectValues.wood_status);
      formData.set('wood_weight', selectValues.wood_weight);
      formData.set('rays_per_mm', selectValues.rays_per_mm);
      formData.set('wood_origin', selectValues.wood_origin);
      formData.set('wood_colors', selectValues.wood_colors);
      formData.set('sapwood_heartwood_color_diff', selectValues.sapwood_heartwood_color_diff);
      formData.set('wood_odor', selectValues.wood_odor);
      formData.set('wood_taste', selectValues.wood_taste);
      formData.set('wood_luster', selectValues.wood_luster);
      formData.set('wood_texture', selectValues.wood_texture);
      formData.set('wood_grain', selectValues.wood_grain);
      formData.set('growth_rings', selectValues.growth_rings);
      formData.set('vp_porosity', selectValues.vp_porosity);
      formData.set('vp_vessel_arrangement', selectValues.vp_vessel_arrangement);
      formData.set('vp_vessel_grouping', selectValues.vp_vessel_grouping);
      formData.set('vp_Pores_size', selectValues.vp_Pores_size);
      formData.set('vp_Pores_frequency', selectValues.vp_Pores_frequency);
      formData.set('vp_inclusions_in_Pores', selectValues.vp_inclusions_in_Pores);
      formData.set('ap_type', selectValues.ap_type);
      formData.set('ap_apotracheal', selectValues.ap_apotracheal);
      formData.set('ap_paratracheal', selectValues.ap_paratracheal);
      formData.set('ap_banded', selectValues.ap_banded);
      formData.set('rays_width', selectValues.rays_width);
      formData.set('vp_Pores_rays_ratio', selectValues.vp_Pores_rays_ratio);
      formData.set('rays_two_distinct_sizes', selectValues.rays_two_distinct_sizes);
      formData.set('rays_aggregate', selectValues.rays_aggregate);
      formData.set('rays_storied_ripple_mark', selectValues.rays_storied_ripple_mark);
      formData.set('rays_deposit_in_rays', selectValues.rays_deposit_in_rays);
      formData.set('included_phloem', selectValues.included_phloem);
      formData.set('intercellular_canals', selectValues.intercellular_canals);



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

  const menuItems = [
    { id: 'basic', label: 'ข้อมูลพื้นฐานและอัตลักษณ์', icon: <Info size={18} /> },
    { id: 'images', label: 'รูปภาพประกอบ', icon: <ImageIcon size={18} /> },
    { id: 'physical', label: 'ลักษณะกายภาพ', icon: <Ruler size={18} /> },
    { id: 'vessels', label: 'ลักษณะโครงสร้างของเนื้อไม้', icon: <Search size={18} /> },
    { id: 'rays-ap', label: 'เรย์และพาเรงคิมา', icon: <Layers size={18} /> },
    { id: 'others', label: 'องค์ประกอบโครงสร้างอื่นๆ', icon: <Dna size={18} /> },
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
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#DCFCE7]/70 text-[#14532D] ring-1 ring-[#86EFAC]' : 'text-slate-500 hover:bg-[#F6FBF6]'
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
                    <CardTitle className="text-[#14532D] flex items-center gap-2 text-lg"><Info className="w-5 h-5" /> 1. ข้อมูลพื้นฐานและอัตลักษณ์</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="ชื่อวิทยาศาสตร์ (Scientific Name)" name="scientific_name" placeholder="Dalbergia oliveri" required />
                    <FormField label="ชื่อสามัญ (Common Name)" name="common_name" placeholder="ชิงชัน" required />

                    {/* DROPDOWN ถิ่นกำเนิดไม้ (แก้ไขใหม่) */}
                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium flex items-center gap-1">
                        <MapPin size={14} className="text-[#6E8E59]" /> ถิ่นกำเนิดไม้ (Geographic distribution)
                      </Label>
                      <Select
                        value={selectValues.wood_origin}
                        onValueChange={(v) => setSelectValues({ ...selectValues, wood_origin: v })}
                      >
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11 text-left">
                          <SelectValue placeholder="เลือกถิ่นกำเนิดไม้" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe and temperate Asia">Europe and temperate Asia</SelectItem>
                          <SelectItem value="Central South Asia">Central South Asia</SelectItem>
                          <SelectItem value="Southeast Asia and the Pacific">Southeast Asia and the Pacific</SelectItem>
                          <SelectItem value="Australia and New Zealand">Australia and New Zealand</SelectItem>
                          <SelectItem value="Tropical mainland Africa and adjacent islands">Tropical mainland Africa and adjacent islands</SelectItem>
                          <SelectItem value="Southern Africa">Southern Africa</SelectItem>
                          <SelectItem value="North America, north of Mexico">North America, north of Mexico</SelectItem>
                          <SelectItem value="Neotropics and temperate Brazil">Neotropics and temperate Brazil</SelectItem>
                          <SelectItem value="Temperate South America including Argentina, Chile, Uruguay, and S. Paraguay">Temperate South America including Argentina, Chile, Uruguay, and S. Paraguay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>



                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">วงเจริญเติบโต (Growth rings)</Label>
                      <Select
                        value={selectValues.growth_rings}
                        onValueChange={(v) => setSelectValues({ ...selectValues, growth_rings: v })}
                      >
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11 text-left">
                          <SelectValue placeholder="เลือกความชัดเจน" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="มีเห็นได้อย่างชัดเจน">มีเห็นได้อย่างชัดเจน</SelectItem>
                          <SelectItem value="ไม่มีหรือเห็นไม่ชัดเจน">ไม่มีหรือเห็นไม่ชัดเจน</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">สถานะการแสดงผล</Label>
                      <Select value={selectValues.wood_status} onValueChange={(v) => setSelectValues({ ...selectValues, wood_status: v })}>
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

              {/* ส่วนอื่นๆ ของ Code ยังคงเดิมตามโครงสร้างของคุณ */}
              {/* 2. Physical, 3. Vessels, 4. Rays, 5. Others... */}

              {/* รูปภาพ */}
              <div className={activeTab === 'images' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] shadow-sm animate-in fade-in duration-300">
                  <CardHeader className="bg-[#F6FBF6] border-b border-[#CDE3BD] py-4">
                    <CardTitle className="text-[#14532D] flex items-center gap-2 text-lg"><ImageIcon className="w-5 h-5" /> รูปภาพเนื้อไม้</CardTitle>
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
                          <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className={activeTab === 'physical' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] border-l-4 border-l-[#16A34A] animate-in fade-in duration-300">
                  <CardHeader className="bg-[#F6FBF6]/50 border-b border-[#CDE3BD]/50">
                    <CardTitle className="text-[#14532D] text-sm font-bold uppercase flex items-center gap-2"><Ruler className="w-4 h-4" /> Physical & Sensory Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">


                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">สีของแก่นไม้ (Heartwood color)</Label>
                      <Select
                        value={selectValues.wood_colors}
                        onValueChange={(v) => setSelectValues({ ...selectValues, wood_colors: v })}
                      >
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11 text-left">
                          <SelectValue placeholder="เลือกสีของแก่นไม้" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="สีน้ำตาลหรือโทนสีน้ำตาล (Brown or shades of brown)">สีน้ำตาลหรือโทนสีน้ำตาล (Brown or shades of brown)</SelectItem>
                          <SelectItem value="สีแดงหรือโทนสีแดง (Red or shades of red)">สีแดงหรือโทนสีแดง (Red or shades of red)</SelectItem>
                          <SelectItem value="สีเหลืองหรือโทนสีเหลือง (Yellow or shades of yellow)">สีเหลืองหรือโทนสีเหลือง (Yellow or shades of yellow)</SelectItem>
                          <SelectItem value="สีขาวหรือเทา (White or Gray)">สีขาวหรือเทา (White or Gray)</SelectItem>
                          <SelectItem value="สีดำ (Black)">สีดำ (Black)</SelectItem>
                          <SelectItem value="สีม่วง (Purple)">สีม่วง (Purple)</SelectItem>
                          <SelectItem value="สีส้ม (Orange)">สีส้ม (Orange)</SelectItem>
                          <SelectItem value="สีเขียว (Green)">สีเขียว (Green)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>


                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">ความแตกต่างของสีกระพี้และสีแก่นไม้</Label>
                      <Select
                        value={selectValues.sapwood_heartwood_color_diff}
                        onValueChange={(v) => setSelectValues({ ...selectValues, sapwood_heartwood_color_diff: v })}
                      >
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11 text-left">
                          <SelectValue placeholder="เลือกความแตกต่างของสี" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="สีกระพี้และสีแก่นไม้แตกต่างกันอย่างชัดเจน">สีกระพี้และสีแก่นไม้แตกต่างกันอย่างชัดเจน</SelectItem>
                          <SelectItem value="สีกระพี้เหมือนหรือใกล้เคียงกับสีแก่นไม้">สีกระพี้เหมือนหรือใกล้เคียงกับสีแก่นไม้</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>






                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">ความหยาบละเอียดของเนื้อไม้ (Texture)</Label>
                      <Select value={selectValues.wood_texture} onValueChange={(v) => setSelectValues({ ...selectValues, wood_texture: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="เลือกความหยาบของเนื้อไม้" />
                        </SelectTrigger>
                        <SelectContent>

                          <SelectItem value="เนื้อไม้หยาบ (Coarse texture)">เนื้อไม้หยาบ (Coarse texture)</SelectItem>
                          <SelectItem value="เนื้อไม้หยาบปานกลาง (Medium texture)">เนื้อไม้หยาบปานกลาง (Medium texture)</SelectItem>
                          <SelectItem value="เนื้อไม้ละเอียด (Fine texture)">เนื้อไม้ละเอียด (Fine texture)</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>






                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">เสี้ยนเนื้อไม้ (Grain)</Label>
                      <Select value={selectValues.wood_grain} onValueChange={(v) => setSelectValues({ ...selectValues, wood_grain: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="เลือกเสี้ยนเนื้อไม้" />
                        </SelectTrigger>
                        <SelectContent>

                          <SelectItem value="เสี้ยนตรง (Straight grain)">เสี้ยนตรง (Straight grain)</SelectItem>
                          <SelectItem value="เสี้ยนบิด (Spiral gain)">เสี้ยนบิด (Spiral gain)</SelectItem>
                          <SelectItem value="เสี้ยนสน (Interlocked grain)">เสี้ยนสน (Interlocked grain)</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>


                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">ความมันวาว (Luster)</Label>
                      <Select value={selectValues.wood_luster} onValueChange={(v) => setSelectValues({ ...selectValues, wood_luster: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="เลือกความมันวาว" />
                        </SelectTrigger>
                        <SelectContent>

                          <SelectItem value="เป็นมันวาว (Lustrous)">เป็นมันวาว (Lustrous)</SelectItem>
                          <SelectItem value="ด้าน (Dull)">ด้าน (Dull)</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>


                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">รส (Taste)</Label>
                      <Select value={selectValues.wood_taste} onValueChange={(v) => setSelectValues({ ...selectValues, wood_taste: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="ไม่มีรส" />
                        </SelectTrigger>
                        <SelectContent>

                          <SelectItem value="มีรส">มีรส</SelectItem>
                          <SelectItem value="ไม่มีรส">ไม่มีรส</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>


                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">กลิ่น (Odor)</Label>
                      <Select value={selectValues.wood_odor} onValueChange={(v) => setSelectValues({ ...selectValues, wood_odor: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="ไม่มีกลิ่น" />
                        </SelectTrigger>
                        <SelectContent>

                          <SelectItem value="มีกลิ่น">มีกลิ่น</SelectItem>
                          <SelectItem value="ไม่มีกลิ่น">ไม่มีกลิ่น</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>


                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">น้ำหนัก (Weight)</Label>
                      <Select value={selectValues.wood_weight} onValueChange={(v) => setSelectValues({ ...selectValues, wood_weight: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="เลือกน้ำหนักไม้" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                          <SelectItem value="LIGHT">ต่ำ (น้ำหนัก ≤ 0.40)</SelectItem>
                          <SelectItem value="MEDIUM">กลาง (น้ำหนัก 0.40 - 0.75)</SelectItem>
                          <SelectItem value="HEAVY">สูง (น้ำหนัก ≥ 0.75)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className={activeTab === 'vessels' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] border-l-4 border-l-amber-500 animate-in fade-in duration-300">
                  <CardHeader className="bg-amber-50/30 border-b border-[#CDE3BD]/50">
                    <CardTitle className="text-amber-800 flex items-center gap-2 text-lg"><Microscope size={20} /> 3. Pores / Vessels Structure</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">



                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">การกระจายของพอร์ (Porosity)</Label>
                      <Select value={selectValues.vp_porosity} onValueChange={(v) => setSelectValues({ ...selectValues, vp_porosity: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                          <SelectItem value="ไม่พอร์วง (Ring-porous wood)">ไม้พอร์วง (Ring-porous wood)</SelectItem>
                          <SelectItem value="ไม้พอร์กระจาย (Diffuse-porous wood)">ไม้พอร์กระจาย (Diffuse-porous wood)</SelectItem>
                          <SelectItem value="ไม้พอร์กึ่งวง (Semi-ring-porous wood)">ไม้พอร์กึ่งวง (Semi-ring-porous wood)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>




                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">กลุ่มของพอร์ (Vessel grouping)</Label>
                      <Select value={selectValues.vp_vessel_grouping} onValueChange={(v) => setSelectValues({ ...selectValues, vp_vessel_grouping: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                          <SelectItem value="พอร์เดี่ยว">พอร์เดี่ยว</SelectItem>
                          <SelectItem value="พอร์แฝด">พอร์แฝด</SelectItem>
                          <SelectItem value="พอร์เรียงเป็นกลุ่ม">พอร์กลุ่ม</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>


                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">การเรียงตัวของพอร์ (Vessel arrangement)</Label>
                      <Select value={selectValues.vp_vessel_arrangement} onValueChange={(v) => setSelectValues({ ...selectValues, vp_vessel_arrangement: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                          <SelectItem value="พอร์เรียงตัวเป็นแถบตามแนวด้านสัมผัส">พอร์เรียงตัวเป็นแถบตามแนวด้านสัมผัส</SelectItem>
                          <SelectItem value="พอร์เรียงตัวแนวเฉียง และ/หรือ เรียงตามแนวรัศมี">พอร์เรียงตัวแนวเฉียง และ/หรือ เรียงตามแนวรัศมี</SelectItem>
                          <SelectItem value="พอร์เรียงเป็นกลุ่ม">พอร์เรียงเป็นกลุ่ม</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>



                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">จำนวนของพอร์</Label>
                      <Select value={selectValues.vp_Pores_frequency} onValueChange={(v) => setSelectValues({ ...selectValues, vp_Pores_frequency: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                          <SelectItem value="หนาแน่นน้อยมาก ( ≤ 5 vessels per square millimeter )">หนาแน่นน้อยมาก ( ≤ 5 vessels per square millimeter )</SelectItem>
                          <SelectItem value="หนาแน่นน้อย ( 5 - 20 vessels per square millimeter )">หนาแน่นน้อย ( 5 - 20 vessels per square millimeter )</SelectItem>
                          <SelectItem value="หนาแน่นปานกลาง ( 20 - 40 vessels per square millimeter )">หนาแน่นปานกลาง ( 20 - 40 vessels per square millimeter )</SelectItem>
                          <SelectItem value="หนาแน่นมาก ( 40 - 100 vessels per square millimeter )">หนาแน่นมาก ( 40 - 100 vessels per square millimeter )</SelectItem>
                          <SelectItem value="หนาแน่นสูงมาก ( ≥ 100 vessels per square millimeter )">หนาแน่นสูงมาก ( ≥ 100 vessels per square millimeter )</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">ขนาดความโตของพอร์ (Pores size)</Label>
                      <Select value={selectValues.vp_Pores_size} onValueChange={(v) => setSelectValues({ ...selectValues, vp_Pores_size: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                          <SelectItem value="พอร์ขนาดใหญ่ ขนาดที่เห็นได้อย่างสบาย">พอร์ขนาดใหญ่ ขนาดที่เห็นได้อย่างสบาย</SelectItem>
                          <SelectItem value="พอร์ขนาดกลาง ขนาดที่พอเห็นได้">พอร์ขนาดกลาง ขนาดที่พอเห็นได้</SelectItem>
                          <SelectItem value="พอร์ขนาดเล็ก ขนาดที่เห็นได้ด้วยแว่นขยาย">พอร์ขนาดเล็ก ขนาดที่เห็นได้ด้วยแว่นขยาย</SelectItem>
                          <SelectItem value="พอร์ขนาดเล็กมาก ขนาดที่พอมองเห็นได้ต้องใช้แว่นขยาย 10 - 15 เท่า">พอร์ขนาดเล็กมาก ขนาดที่พอมองเห็นได้ต้องใช้แว่นขยาย 10 - 15 เท่า</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>


                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">สิ่งที่อยู่ในพอร์ (Inclusions in pores)</Label>
                      <Select value={selectValues.vp_inclusions_in_Pores} onValueChange={(v) => setSelectValues({ ...selectValues, vp_inclusions_in_Pores: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                          <SelectItem value="ไทโลส ( Tyloses )">ไทโลส ( Tyloses )</SelectItem>
                          <SelectItem value="ดีพอซิท ( Deposit )">ดีพอซิท ( Deposit )</SelectItem>
                          <SelectItem value="ยางไม้ ( Gum )">ยางไม้ ( Gum )</SelectItem>


                        </SelectContent>
                      </Select>
                    </div>



                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">สัดส่วนของขนาดของเรย์กับขนาดของพอร์</Label>
                      <Select value={selectValues.vp_Pores_rays_ratio} onValueChange={(v) => setSelectValues({ ...selectValues, vp_Pores_rays_ratio: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                          <SelectItem value="เรย์มีขนาดเล็กกว่าขนาดความกว้างของพอร์">เรย์มีขนาดเล็กกว่าขนาดความกว้างของพอร์</SelectItem>
                          <SelectItem value="เรย์มีขนาดเท่ากับขนาดของพอร์">เรย์มีขนาดเท่ากับขนาดของพอร์</SelectItem>
                          <SelectItem value="เรย์มีขนาดใหญ่กว่าพอร์">เรย์มีขนาดใหญ่กว่าพอร์</SelectItem>


                        </SelectContent>
                      </Select>
                    </div>

                  </CardContent>
                </Card>
              </div>

              <div className={activeTab === 'rays-ap' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] border-l-4 border-l-blue-500 animate-in fade-in duration-300">
                  <CardHeader className="bg-blue-50/30 border-b border-[#CDE3BD]/50">
                    <CardTitle className="text-blue-800 flex items-center gap-2 text-lg"><Layers size={20} /> 4. Rays & Parenchyma</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-3 border-b pb-2 mb-2"><h4 className="text-sm font-bold text-blue-700">Rays (เรย์)</h4></div>
                      <div className="space-y-2">
                        <Label className="text-[#14532D] text-sm font-medium">จำนวนของเส้นเรย์</Label>
                        <Select value={selectValues.rays_per_mm} onValueChange={(v) => setSelectValues({ ...selectValues, rays_per_mm: v })}>
                          <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11"><SelectValue placeholder='เลือกจำนวนของเส้นเรย์' /></SelectTrigger>
                          <SelectContent><SelectItem value="LOW">น้อย (มีจำนวนเส้นเรย์น้อยกว่า 4 เส้นต่อมิลลิเมตร)</SelectItem><SelectItem value="MEDIUM">ปานกลาง (มีจำนวนเส้นเรย์ 4 - 12 เส้นต่อมิลลิเมตร)</SelectItem><SelectItem value="HIGH">มาก (มีจำนวนเส้นเรย์มากกว่า 12 เส้นต่อมิลลิเมตร)</SelectItem></SelectContent>
                        </Select>
                      </div>


                      <div className="space-y-2">
                        <Label className="text-[#14532D] text-sm font-medium">ขนาดความกว้างของเส้นเรย์</Label>
                        <Select value={selectValues.rays_width} onValueChange={(v) => setSelectValues({ ...selectValues, rays_width: v })}>
                          <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                            <SelectItem value="เล็กมาก คือ ขนาดที่พอเห็นได้ด้วยแว่นขยาย">เล็กมาก คือ ขนาดที่พอเห็นได้ด้วยแว่นขยาย</SelectItem>
                            <SelectItem value="เล็ก คือ ขนาดที่เห็นได้ด้วยแว่นขยาย">เล็ก คือ ขนาดที่เห็นได้ด้วยแว่นขยาย</SelectItem>
                            <SelectItem value="ปานกลาง คือ ขนาดที่พอเห็นได้ด้วยตาโดยไม่ต้องใช้แว่นขยาย">ปานกลาง คือ ขนาดที่พอเห็นได้ด้วยตาโดยไม่ต้องใช้แว่นขยาย</SelectItem>
                            <SelectItem value="ใหญ่ คือ ขนาดที่เห็นอย่างสบาย ๆ ด้วยตาเปล่า">ใหญ่ คือ ขนาดที่เห็นอย่างสบาย ๆ ด้วยตาเปล่า</SelectItem>


                          </SelectContent>
                        </Select>
                      </div>



                      <div className="space-y-2">
                        <Label className="text-[#14532D] text-sm font-medium">เรย์มีสองขนาด</Label>
                        <Select value={selectValues.rays_two_distinct_sizes} onValueChange={(v) => setSelectValues({ ...selectValues, rays_two_distinct_sizes: v })}>
                          <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                            <SelectItem value="มี">มี</SelectItem>
                            <SelectItem value="ไม่มี">ไม่มี</SelectItem>


                          </SelectContent>
                        </Select>
                      </div>



                      <div className="space-y-2">
                        <Label className="text-[#14532D] text-sm font-medium">ลักษณะเรย์รวม</Label>
                        <Select value={selectValues.rays_aggregate} onValueChange={(v) => setSelectValues({ ...selectValues, rays_aggregate: v })}>
                          <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                            <SelectItem value="มี">มี</SelectItem>
                            <SelectItem value="ไม่มี">ไม่มี</SelectItem>


                          </SelectContent>
                        </Select>
                      </div>



                      <div className="space-y-2">
                        <Label className="text-[#14532D] text-sm font-medium">ลักษณะเรย์เป็นชั้นๆ หรือ ริ้วลาย</Label>
                        <Select value={selectValues.rays_storied_ripple_mark} onValueChange={(v) => setSelectValues({ ...selectValues, rays_storied_ripple_mark: v })}>
                          <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                            <SelectItem value="มี">มี</SelectItem>
                            <SelectItem value="ไม่มี">ไม่มี</SelectItem>


                          </SelectContent>
                        </Select>
                      </div>



                      <div className="space-y-2">
                        <Label className="text-[#14532D] text-sm font-medium">ดีพอซิทในเส้นเรย์</Label>
                        <Select value={selectValues.rays_deposit_in_rays} onValueChange={(v) => setSelectValues({ ...selectValues, rays_deposit_in_rays: v })}>
                          <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                            <SelectItem value="มีสี">มีสี</SelectItem>
                            <SelectItem value="ไม่มี">ไม่มี</SelectItem>


                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-3 border-b pb-2 mb-2 mt-4"><h4 className="text-sm font-bold text-blue-700">Parenchyma (พาเรงคิมา)</h4></div>



                      <div className="space-y-2">
                        <Label className="text-[#14532D] text-sm font-medium">ประเภทของพาเรงคิมา</Label>
                        <Select value={selectValues.ap_type} onValueChange={(v) => setSelectValues({ ...selectValues, ap_type: v })}>
                          <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                            <SelectItem value="พาเรงคิมาแบบไม่ติดพอร์ ( Apotracheal axial parenchyma )">พาเรงคิมาแบบไม่ติดพอร์ ( Apotracheal axial parenchyma )</SelectItem>
                            <SelectItem value="พาเรงคิมาที่ติดพอร์ ( Paratracheal axial parenchyma )">พาเรงคิมาที่ติดพอร์ ( Paratracheal axial parenchyma )</SelectItem>
                            <SelectItem value="พาเรงคิมาแบบแถบ ( Banded parenchyma )">พาเรงคิมาแบบแถบ ( Banded parenchyma )</SelectItem>


                          </SelectContent>
                        </Select>
                      </div>



                      <div className="space-y-2">
                        <Label className="text-[#14532D] text-sm font-medium">พาเรงคิมาที่ติดพอร์</Label>
                        <Select value={selectValues.ap_paratracheal} onValueChange={(v) => setSelectValues({ ...selectValues, ap_paratracheal: v })}>
                          <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                            <SelectItem value="พาเรงคิมาแบบติดพอร์เป็นหย่อม (Axial parenchyma scanty)">พาเรงคิมาแบบติดพอร์เป็นหย่อม (Axial parenchyma scanty)</SelectItem>
                            <SelectItem value="พาเรงคิมาแบบติดพอร์ด้านเดียว (Axial parenchyma unilateral)">พาเรงคิมาแบบติดพอร์ด้านเดียว (Axial parenchyma unilateral)</SelectItem>
                            <SelectItem value="พาเรงคิมาแบบรอบพอร์ (Axial parenchyma vasicentric)">พาเรงคิมาแบบรอบพอร์ (Axial parenchyma vasicentric)</SelectItem>
                            <SelectItem value="พาเรงคิมาแบบปีก (Axial parenchyma aliform)">พาเรงคิมาแบบปีก (Axial parenchyma aliform)</SelectItem>
                            <SelectItem value="พาเรงคิมาแบบปีกสั้น (Axial parenchyma lozenge-aliform)">พาเรงคิมาแบบปีกสั้น (Axial parenchyma lozenge-aliform)</SelectItem>
                            <SelectItem value="พาเรงคิมาแบบปีกยาว (Axial parenchyma winged-aliform)">พาเรงคิมาแบบปีกยาว (Axial parenchyma winged-aliform)</SelectItem>
                            <SelectItem value="พาเรงคิมาแบบปีกต่อ (Axial parenchyma confluent)">พาเรงคิมาแบบปีกต่อ (Axial parenchyma confluent)</SelectItem>




                          </SelectContent>
                        </Select>
                      </div>


                      <div className="space-y-2">
                        <Label className="text-[#14532D] text-sm font-medium">พาเรงคิมาแบบไม่ติดพอร์</Label>
                        <Select value={selectValues.ap_apotracheal} onValueChange={(v) => setSelectValues({ ...selectValues, ap_apotracheal: v })}>
                          <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                            <SelectItem value="พาเรงคิมาแบบกระจาย (diffuse parenchyma)">พาเรงคิมาแบบกระจาย (diffuse parenchyma)</SelectItem>
                            <SelectItem value="พาเรงคิมาแบบกลุ่มกระจาย (diffuse-in-aggregates parenchyma)">พาเรงคิมาแบบกลุ่มกระจาย (diffuse-in-aggregates parenchyma)</SelectItem>



                          </SelectContent>
                        </Select>
                      </div>





                      <div className="space-y-2">
                        <Label className="text-[#14532D] text-sm font-medium">พาเรงคิมาแบบแถบ</Label>
                        <Select value={selectValues.ap_banded} onValueChange={(v) => setSelectValues({ ...selectValues, ap_banded: v })}>
                          <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                            <SelectItem value="พาเรงคิมาแบบแถบกว้าง">พาเรงคิมาแบบแถบกว้าง</SelectItem>
                            <SelectItem value="พาเรงคิมาแบบแถบแคบ">พาเรงคิมาแบบแถบแคบ</SelectItem>
                            <SelectItem value="พาเรงคิมาแบบตาข่าย (Axial parenchyma reticulate)">พาเรงคิมาแบบตาข่าย (Axial parenchyma reticulate)</SelectItem>
                            <SelectItem value="พาเรงคิมาแบบบันได (Axial parenchyma scalariform)">พาเรงคิมาแบบบันได (Axial parenchyma scalariform)</SelectItem>
                            <SelectItem value="พาเรงคิมาแบบขอบ">พาเรงคิมาแบบขอบ</SelectItem>


                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className={activeTab === 'others' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] border-l-4 border-l-purple-500 animate-in fade-in duration-300">
                  <CardHeader className="bg-purple-50/30 border-b border-[#CDE3BD]/50">
                    <CardTitle className="text-purple-800 flex items-center gap-2 text-lg"><Dna size={20} /> 5. Other Anatomical Features</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">


                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">โฟลเอ็มในไม้</Label>
                      <Select value={selectValues.included_phloem} onValueChange={(v) => setSelectValues({ ...selectValues, included_phloem: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                          <SelectItem value="มี">มี</SelectItem>
                          <SelectItem value="ไม่มี">ไม่มี</SelectItem>


                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[#14532D] text-sm font-medium">ท่อระหว่างเซลล์</Label>
                      <Select value={selectValues.intercellular_canals} onValueChange={(v) => setSelectValues({ ...selectValues, intercellular_canals: v })}>
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ใช้สัญลักษณ์ Unicode ≤ และ ≥ แทน */}
                          <SelectItem value="ท่อเรียงต่อกันเป็นเส้นยาว (Axial canals in long tangential lines)">ท่อเรียงต่อกันเป็นเส้นยาว (Axial canals in long tangential lines)</SelectItem>
                          <SelectItem value="ท่อเรียงต่อกันเป็นเส้นสั้น ๆ (Axial canals in short tangential lines)">ท่อเรียงต่อกันเป็นเส้นสั้น ๆ (Axial canals in short tangential lines)</SelectItem>


                        </SelectContent>
                      </Select>
                    </div>

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