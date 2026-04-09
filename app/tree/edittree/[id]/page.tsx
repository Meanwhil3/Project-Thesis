"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react"; // เพิ่มการดึง Session
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  X, Save, Microscope, Info, Layers, Search, Image as ImageIcon,
  Ruler, ChevronRight, Loader2, ArrowLeft, Dna, MapPin, 
  UploadCloud, TextCursorInput, Palette, Droplets, Wind, Plus
} from 'lucide-react';

export default function EditWoodPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession(); // ดึงข้อมูล Session
  
  const [wood, setWood] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedFiles, setSelectedFiles] = useState<{file: File, preview: string}[]>([]);

  // ชื่อวิทยาศาสตร์ 3 ส่วน: Genus (ตัวใหญ่เอียง) + species (ตัวเล็กเอียง) + Author (ปกติ)
  const [sciGenus, setSciGenus] = useState('');
  const [sciSpecies, setSciSpecies] = useState('');
  const [sciAuthor, setSciAuthor] = useState('');

  // --- ตรวจสอบสิทธิ์ (Role Protection) ---
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      const role = String((session?.user as any)?.role ?? "").toUpperCase();
      // ไม่อนุญาตให้ TRAINEE เข้าถึง (อนุญาตเฉพาะ ADMIN และ INSTRUCTOR)
      if (role !== "ADMIN" && role !== "INSTRUCTOR") {
        alert("คุณไม่มีสิทธิ์เข้าถึงหรือแก้ไขข้อมูลในหน้านี้");
        router.push("/tree/treesearch");
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    fetch(`/api/woods/${id}`)
      .then(res => res.json())
      .then(data => {
        setWood({
          wood_status: 'SHOW',
          wood_weight: 'MEDIUM',
          rays_per_mm: 'MEDIUM',
          wood_odor: 'ไม่มีกลิ่น',
          wood_taste: 'ไม่มีรส',
          ...data
        });
        // แยกชื่อวิทยาศาสตร์ออกเป็น 3 ส่วน
        if (data.scientific_name) {
          const parts = data.scientific_name.trim().split(/\s+/);
          setSciGenus(parts[0] || '');
          setSciSpecies(parts[1] || '');
          setSciAuthor(parts.slice(2).join(' ') || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWood((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setWood((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        file, preview: URL.createObjectURL(file)
      }));
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
    e.target.value = '';
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const updatedImages = wood.images.filter((_: any, i: number) => i !== index);
      setWood({ ...wood, images: updatedImages });
    } else {
      URL.revokeObjectURL(selectedFiles[index].preview);
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();

    // รวมชื่อวิทยาศาสตร์จาก 3 ส่วน
    const combinedSciName = `${sciGenus} ${sciSpecies}${sciAuthor ? ` ${sciAuthor}` : ''}`.trim();

    Object.keys(wood).forEach(key => {
      if (key !== 'images' && key !== 'wood_id' && key !== 'scientific_name') {
        formData.append(key, wood[key] ?? "");
      }
    });
    formData.append('scientific_name', combinedSciName);
    
    formData.append('existing_images', JSON.stringify(wood.images || []));
    selectedFiles.forEach(f => formData.append('new_images', f.file));

    try {
      const res = await fetch(`/api/woods/${id}`, { method: 'PUT', body: formData });
      if (res.ok) {
        alert("บันทึกการแก้ไขเรียบร้อย");
        router.push(`/tree/treesearch`);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  // แสดง Loader ระหว่างตรวจสอบ Session หรือโหลดข้อมูลไม้
  if (status === "loading" || loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-kanit gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-[#14532D]" />
      <p className="text-[#14532D] font-medium">กำลังเตรียมข้อมูล...</p>
    </div>
  );
  
  // ตรวจสอบขั้นสุดท้ายก่อน Render UI
  const isAuthorized = status === "authenticated" && 
    ["ADMIN", "INSTRUCTOR"].includes(String((session?.user as any)?.role ?? "").toUpperCase());

  if (!isAuthorized || !wood) {
    return <div className="min-h-screen flex items-center justify-center font-kanit">ไม่พบข้อมูลหรือไม่มีสิทธิ์เข้าถึง</div>;
  }

  const menuItems = [
    { id: 'basic', label: 'ข้อมูลพื้นฐานและอัตลักษณ์', icon: <Info size={18} /> },
    { id: 'images', label: 'รูปภาพประกอบ', icon: <ImageIcon size={18} /> },
    { id: 'physical', label: 'ลักษณะกายภาพ', icon: <Ruler size={18} /> },
    { id: 'vessels', label: 'โครงสร้างเนื้อไม้ (Vessels)', icon: <Search size={18} /> },
    { id: 'rays-ap', label: 'เรย์และพาเรงคิมา', icon: <Layers size={18} /> },
    { id: 'others', label: 'องค์ประกอบอื่นๆ', icon: <Dna size={18} /> },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col text-slate-900 font-kanit">
      <form onSubmit={handleSave} className="flex flex-col h-full">
        
        {/* --- Header --- */}
        <header className="flex-none bg-white border-b border-[#CDE3BD] sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-2 rounded-xl border border-[#CDE3BD] bg-white px-3 py-2 text-sm font-medium text-[#14532D] shadow-sm transition hover:bg-[#F6FBF6]">
                <ArrowLeft size={18} /> กลับ
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-[#14532D]">แก้ไขข้อมูลพันธุ์ไม้</h1>
                <p className="text-sm text-[#6E8E59]">{wood.scientific_name || 'กำลังแก้ไขข้อมูล'}</p>
              </div>
            </div>
            <Button type="submit" disabled={saving} className="bg-[#14532D] hover:bg-[#0F3F22] text-white rounded-xl px-6 h-11 font-semibold shadow-lg transition-all">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </Button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* --- Sidebar Navigation --- */}
            <aside className="w-full lg:w-72 flex-none">
              <nav className="space-y-1.5 bg-white p-3 rounded-2xl border border-[#CDE3BD] shadow-sm sticky top-28">
                <p className="px-4 py-2 text-[11px] font-bold text-[#6E8E59] uppercase tracking-widest opacity-80">หมวดหมู่ข้อมูล</p>
                {menuItems.map((item) => (
                  <button
                    key={item.id} type="button" onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id ? 'bg-[#DCFCE7] text-[#14532D] shadow-sm' : 'text-slate-500 hover:bg-[#F6FBF6]'
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
              <div className="rounded-2xl border border-[#CDE3BD] bg-white shadow-sm overflow-hidden">
                
                {/* 1. Basic Info */}
                <div className={activeTab === 'basic' ? 'block p-6 animate-in fade-in duration-300' : 'hidden'}>
                  <SectionHeader icon={Info} title="ข้อมูลพื้นฐานและอัตลักษณ์" color="text-[#16A34A]" bgColor="bg-[#DCFCE7]" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ชื่อวิทยาศาสตร์ 3 ส่วน */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-[#14532D] text-sm font-medium">
                        ชื่อวิทยาศาสตร์ <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <span className="text-xs text-[#6E8E59]">Genus (สกุล)</span>
                          <div className="relative">
                            <Dna className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86A97A]" />
                            <Input
                              value={sciGenus}
                              onChange={(e) => setSciGenus(e.target.value)}
                              placeholder="เช่น Tectona"
                              required
                              className="h-11 w-full rounded-xl border-[#CDE3BD] bg-white pl-9 pr-4 text-sm italic text-[#14532D] placeholder:text-[#93B08A] shadow-[0_0_4px_0_#CAE0BC]/50 outline-none focus:ring-2 focus:ring-[#4CA771]/25 focus:border-[#4CA771] transition-all capitalize"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-[#6E8E59]">Species (ชนิด)</span>
                          <Input
                            value={sciSpecies}
                            onChange={(e) => setSciSpecies(e.target.value)}
                            placeholder="เช่น grandis"
                            required
                            className="h-11 w-full rounded-xl border-[#CDE3BD] bg-white px-4 text-sm italic text-[#14532D] placeholder:text-[#93B08A] shadow-[0_0_4px_0_#CAE0BC]/50 outline-none focus:ring-2 focus:ring-[#4CA771]/25 focus:border-[#4CA771] transition-all lowercase"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-[#6E8E59]">Author (ผู้ตั้งชื่อ)</span>
                          <Input
                            value={sciAuthor}
                            onChange={(e) => setSciAuthor(e.target.value)}
                            placeholder="เช่น L.f."
                            className="h-11 w-full rounded-xl border-[#CDE3BD] bg-white px-4 text-sm text-[#14532D] placeholder:text-[#93B08A] shadow-[0_0_4px_0_#CAE0BC]/50 outline-none focus:ring-2 focus:ring-[#4CA771]/25 focus:border-[#4CA771] transition-all"
                          />
                        </div>
                      </div>
                      {(sciGenus || sciSpecies || sciAuthor) && (
                        <p className="text-sm text-[#14532D] bg-[#F6FBF6] rounded-lg px-3 py-2 border border-[#CDE3BD]">
                          ตัวอย่าง: <em className="italic">{sciGenus} {sciSpecies}</em>{sciAuthor ? ` ${sciAuthor}` : ''}
                        </p>
                      )}
                    </div>
                    <Field label="ชื่อสามัญ" name="common_name" value={wood.common_name} onChange={handleChange} icon={TextCursorInput} required />
                    <SelectField label="ถิ่นกำเนิดไม้ (Geographic distribution)" value={wood.wood_origin} onValueChange={(v: string)=>handleSelectChange('wood_origin', v)} icon={MapPin}>
                        <SelectItem value="Europe and temperate Asia">Europe and temperate Asia</SelectItem>
                        <SelectItem value="Central South Asia">Central South Asia</SelectItem>
                        <SelectItem value="Southeast Asia and the Pacific">Southeast Asia and the Pacific</SelectItem>
                        <SelectItem value="Australia and New Zealand">Australia and New Zealand</SelectItem>
                        <SelectItem value="Tropical mainland Africa and adjacent islands">Tropical mainland Africa and adjacent islands</SelectItem>
                        <SelectItem value="Southern Africa">Southern Africa</SelectItem>
                        <SelectItem value="North America, north of Mexico">North America, north of Mexico</SelectItem>
                        <SelectItem value="Neotropics and temperate Brazil">Neotropics and temperate Brazil</SelectItem>
                        <SelectItem value="Temperate South America including Argentina, Chile, Uruguay, and S. Paraguay">Temperate South America</SelectItem>
                    </SelectField>
                    <SelectField label="วงเจริญเติบโต (Growth rings)" value={wood.growth_rings} onValueChange={(v: string)=>handleSelectChange('growth_rings', v)} icon={Layers}>
                        <SelectItem value="มีเห็นได้อย่างชัดเจน">มีเห็นได้อย่างชัดเจน</SelectItem>
                        <SelectItem value="ไม่มีหรือเห็นไม่ชัดเจน">ไม่มีหรือเห็นไม่ชัดเจน</SelectItem>
                    </SelectField>
                    <SelectField label="สถานะการแสดงผล" value={wood.wood_status} onValueChange={(v: string)=>handleSelectChange('wood_status', v)} icon={Plus}>
                        <SelectItem value="SHOW">SHOW (แสดง)</SelectItem>
                        <SelectItem value="HIDE">HIDE (ซ่อน)</SelectItem>
                    </SelectField>
                  </div>
                  <div className="mt-6">
                    <Label className="text-[#14532D] text-sm font-medium mb-2 block">รายละเอียดไม้ทั่วไป (Description)</Label>
                    <Textarea name="wood_description" value={wood.wood_description} onChange={handleChange} rows={4} className="w-full rounded-xl border-[#CDE3BD] bg-white p-4 text-sm text-[#14532D] shadow-sm focus:ring-2 focus:ring-[#4CA771]/25 outline-none transition-all" />
                  </div>
                </div>

                {/* 2. Images */}
                <div className={activeTab === 'images' ? 'block p-6 animate-in fade-in duration-300' : 'hidden'}>
                  <SectionHeader icon={ImageIcon} title="รูปภาพเนื้อไม้" color="text-[#16A34A]" bgColor="bg-[#DCFCE7]" />
                  <label className="group relative flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#CDE3BD] bg-white px-4 py-8 text-center shadow-sm transition hover:bg-[#F6FBF6] hover:border-[#4CA771] cursor-pointer">
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" />
                    <UploadCloud className="h-8 w-8 text-[#16A34A]" />
                    <span className="text-sm font-semibold text-[#14532D]">คลิกเพื่อเพิ่มรูปภาพใหม่</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {wood.images?.map((img: any, i: number) => (
                      <PreviewBox key={`old-${i}`} src={img.image_url} onRemove={()=>removeImage(i, true)} label="รูปเดิม" />
                    ))}
                    {selectedFiles.map((f, i) => (
                      <PreviewBox key={`new-${i}`} src={f.preview} onRemove={()=>removeImage(i, false)} label="รูปใหม่" isNew />
                    ))}
                  </div>
                </div>

                {/* 3. Physical */}
                <div className={activeTab === 'physical' ? 'block p-6 animate-in fade-in duration-300' : 'hidden'}>
                  <SectionHeader icon={Ruler} title="Physical & Sensory Properties" color="text-amber-600" bgColor="bg-[#FFFBEB]" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="สีของแก่นไม้ (Heartwood color)" value={wood.wood_colors} onValueChange={(v: string)=>handleSelectChange('wood_colors', v)} icon={Palette}>
                      <SelectItem value="สีน้ำตาลหรือโทนสีน้ำตาล (Brown or shades of brown)">สีน้ำตาล (Brown)</SelectItem>
                      <SelectItem value="สีแดงหรือโทนสีแดง (Red or shades of red)">สีแดง (Red)</SelectItem>
                      <SelectItem value="สีเหลืองหรือโทนสีเหลือง (Yellow or shades of yellow)">สีเหลือง (Yellow)</SelectItem>
                      <SelectItem value="สีขาวหรือเทา (White or Gray)">สีขาวหรือเทา (White or Gray)</SelectItem>
                      <SelectItem value="สีดำ (Black)">สีดำ (Black)</SelectItem>
                      <SelectItem value="สีม่วง (Purple)">สีม่วง (Purple)</SelectItem>
                      <SelectItem value="สีส้ม (Orange)">สีส้ม (Orange)</SelectItem>
                      <SelectItem value="สีเขียว (Green)">สีเขียว (Green)</SelectItem>
                    </SelectField>
                    <SelectField label="ความแตกต่างของสีกระพี้และสีแก่นไม้" value={wood.sapwood_heartwood_color_diff} onValueChange={(v: string)=>handleSelectChange('sapwood_heartwood_color_diff', v)} icon={Layers}>
                        <SelectItem value="สีกระพี้และสีแก่นไม้แตกต่างกันอย่างชัดเจน">แตกต่างกันอย่างชัดเจน</SelectItem>
                        <SelectItem value="สีกระพี้เหมือนหรือใกล้เคียงกับสีแก่นไม้">เหมือนหรือใกล้เคียงกัน</SelectItem>
                    </SelectField>
                    <SelectField label="ความหยาบละเอียดของเนื้อไม้ (Texture)" value={wood.wood_texture} onValueChange={(v: string)=>handleSelectChange('wood_texture', v)} icon={Droplets}>
                        <SelectItem value="เนื้อไม้หยาบ (Coarse texture)">เนื้อไม้หยาบ (Coarse)</SelectItem>
                        <SelectItem value="เนื้อไม้หยาบปานกลาง (Medium texture)">เนื้อไม้หยาบปานกลาง (Medium)</SelectItem>
                        <SelectItem value="เนื้อไม้ละเอียด (Fine texture)">เนื้อไม้ละเอียด (Fine)</SelectItem>
                    </SelectField>
                    <SelectField label="เสี้ยนเนื้อไม้ (Grain)" value={wood.wood_grain} onValueChange={(v: string)=>handleSelectChange('wood_grain', v)} icon={Layers}>
                        <SelectItem value="เสี้ยนตรง (Straight grain)">เสี้ยนตรง (Straight)</SelectItem>
                        <SelectItem value="เสี้ยนบิด (Spiral gain)">เสี้ยนบิด (Spiral)</SelectItem>
                        <SelectItem value="เสี้ยนสน (Interlocked grain)">เสี้ยนสน (Interlocked)</SelectItem>
                    </SelectField>
                    <SelectField label="ความมันวาว (Luster)" value={wood.wood_luster} onValueChange={(v: string)=>handleSelectChange('wood_luster', v)} icon={Palette}>
                        <SelectItem value="เป็นมันวาว (Lustrous)">เป็นมันวาว (Lustrous)</SelectItem>
                        <SelectItem value="ด้าน (Dull)">ด้าน (Dull)</SelectItem>
                    </SelectField>
                    <SelectField label="รส (Taste)" value={wood.wood_taste} onValueChange={(v: string)=>handleSelectChange('wood_taste', v)} icon={Droplets}>
                        <SelectItem value="มีรส">มีรส</SelectItem>
                        <SelectItem value="ไม่มีรส">ไม่มีรส</SelectItem>
                    </SelectField>
                    <SelectField label="กลิ่น (Odor)" value={wood.wood_odor} onValueChange={(v: string)=>handleSelectChange('wood_odor', v)} icon={Wind}>
                        <SelectItem value="มีกลิ่น">มีกลิ่น</SelectItem>
                        <SelectItem value="ไม่มีกลิ่น">ไม่มีกลิ่น</SelectItem>
                    </SelectField>
                    <SelectField label="น้ำหนัก (Weight)" value={wood.wood_weight} onValueChange={(v: string)=>handleSelectChange('wood_weight', v)} icon={Wind}>
                        <SelectItem value="LIGHT">ต่ำ (≤ 0.40)</SelectItem>
                        <SelectItem value="MEDIUM">กลาง (0.40 - 0.75)</SelectItem>
                        <SelectItem value="HEAVY">สูง (≥ 0.75)</SelectItem>
                    </SelectField>
                  </div>
                </div>

                {/* 4. Vessels */}
                <div className={activeTab === 'vessels' ? 'block p-6 animate-in fade-in duration-300' : 'hidden'}>
                  <SectionHeader icon={Microscope} title="Pores / Vessels Structure" color="text-amber-700" bgColor="bg-amber-50" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="การกระจายของพอร์ (Porosity)" value={wood.vp_porosity} onValueChange={(v: string)=>handleSelectChange('vp_porosity', v)} icon={Search}>
                        <SelectItem value="ไม้พอร์วง (Ring-porous wood)">ไม้พอร์วง (Ring-porous)</SelectItem>
                        <SelectItem value="ไม้พอร์กระจาย (Diffuse-porous wood)">ไม้พอร์กระจาย (Diffuse-porous)</SelectItem>
                        <SelectItem value="ไม้พอร์กึ่งวง (Semi-ring-porous wood)">ไม้พอร์กึ่งวง (Semi-ring-porous)</SelectItem>
                    </SelectField>
                    <SelectField label="กลุ่มของพอร์ (Vessel grouping)" value={wood.vp_vessel_grouping} onValueChange={(v: string)=>handleSelectChange('vp_vessel_grouping', v)} icon={Search}>
                        <SelectItem value="พอร์เดี่ยว">พอร์เดี่ยว</SelectItem>
                        <SelectItem value="พอร์แฝด">พอร์แฝด</SelectItem>
                        <SelectItem value="พอร์เรียงเป็นกลุ่ม">พอร์เรียงเป็นกลุ่ม</SelectItem>
                    </SelectField>
                    <SelectField label="การเรียงตัวของพอร์ (Vessel arrangement)" value={wood.vp_vessel_arrangement} onValueChange={(v: string)=>handleSelectChange('vp_vessel_arrangement', v)} icon={Search}>
                        <SelectItem value="พอร์เรียงตัวเป็นแถบตามแนวด้านสัมผัส">พอร์เรียงตัวเป็นแถบด้านสัมผัส</SelectItem>
                        <SelectItem value="พอร์เรียงตัวแนวเฉียง และ/หรือ เรียงตามแนวรัศมี">พอร์เรียงตัวแนวเฉียง/รัศมี</SelectItem>
                        <SelectItem value="พอร์เรียงเป็นกลุ่ม">พอร์เรียงเป็นกลุ่ม</SelectItem>
                    </SelectField>
                    <SelectField label="จำนวนของพอร์" value={wood.vp_Pores_frequency} onValueChange={(v: string)=>handleSelectChange('vp_Pores_frequency', v)} icon={Search}>
                        <SelectItem value="หนาแน่นน้อยมาก ( ≤ 5 vessels per square millimeter )">หนาแน่นน้อยมาก (≤ 5)</SelectItem>
                        <SelectItem value="หนาแน่นน้อย ( 5 - 20 vessels per square millimeter )">หนาแน่นน้อย (5-20)</SelectItem>
                        <SelectItem value="หนาแน่นปานกลาง ( 20 - 40 vessels per square millimeter )">หนาแน่นปานกลาง (20-40)</SelectItem>
                        <SelectItem value="หนาแน่นมาก ( 40 - 100 vessels per square millimeter )">หนาแน่นมาก (40-100)</SelectItem>
                        <SelectItem value="หนาแน่นสูงมาก ( ≥ 100 vessels per square millimeter )">หนาแน่นสูงมาก (≥ 100)</SelectItem>
                    </SelectField>
                    <SelectField label="ขนาดความโตของพอร์ (Pores size)" value={wood.vp_Pores_size} onValueChange={(v: string)=>handleSelectChange('vp_Pores_size', v)} icon={Search}>
                        <SelectItem value="พอร์ขนาดใหญ่ ขนาดที่เห็นได้อย่างสบาย">พอร์ขนาดใหญ่</SelectItem>
                        <SelectItem value="พอร์ขนาดกลาง ขนาดที่พอเห็นได้">พอร์ขนาดกลาง</SelectItem>
                        <SelectItem value="พอร์ขนาดเล็ก ขนาดที่เห็นได้ด้วยแว่นขยาย">พอร์ขนาดเล็ก</SelectItem>
                        <SelectItem value="พอร์ขนาดเล็กมาก ขนาดที่พอมองเห็นได้ต้องใช้แว่นขยาย 10 - 15 เท่า">พอร์ขนาดเล็กมาก</SelectItem>
                    </SelectField>
                    <SelectField label="สิ่งที่อยู่ในพอร์ (Inclusions in pores)" value={wood.vp_inclusions_in_Pores} onValueChange={(v: string)=>handleSelectChange('vp_inclusions_in_Pores', v)} icon={Search}>
                        <SelectItem value="ไทโลส ( Tyloses )">ไทโลส (Tyloses)</SelectItem>
                        <SelectItem value="ดีพอซิท ( Deposit )">ดีพอซิท (Deposit)</SelectItem>
                        <SelectItem value="ยางไม้ ( Gum )">ยางไม้ (Gum)</SelectItem>
                    </SelectField>
                    <SelectField label="สัดส่วนเรย์กับพอร์" value={wood.vp_Pores_rays_ratio} onValueChange={(v: string)=>handleSelectChange('vp_Pores_rays_ratio', v)} icon={Search}>
                        <SelectItem value="เรย์มีขนาดเล็กกว่าขนาดความกว้างของพอร์">เรย์เล็กกว่าพอร์</SelectItem>
                        <SelectItem value="เรย์มีขนาดเท่ากับขนาดของพอร์">เรย์เท่ากับพอร์</SelectItem>
                        <SelectItem value="เรย์มีขนาดใหญ่กว่าพอร์">เรย์ใหญ่กว่าพอร์</SelectItem>
                    </SelectField>
                  </div>
                </div>

                {/* 5. Rays & AP */}
                <div className={activeTab === 'rays-ap' ? 'block p-6 animate-in fade-in duration-300' : 'hidden'}>
                  <SectionHeader icon={Layers} title="Rays & Parenchyma" color="text-blue-700" bgColor="bg-blue-50" />
                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider">Rays (เรย์)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectField label="จำนวนของเส้นเรย์" value={wood.rays_per_mm} onValueChange={(v: string)=>handleSelectChange('rays_per_mm', v)} icon={Layers}>
                                <SelectItem value="LOW">น้อย (น้อยกว่า 4 เส้น/มม.)</SelectItem>
                                <SelectItem value="MEDIUM">ปานกลาง (4 - 12 เส้น/มม.)</SelectItem>
                                <SelectItem value="HIGH">มาก (มากกว่า 12 เส้น/มม.)</SelectItem>
                            </SelectField>
                            <SelectField label="ขนาดความกว้างของเส้นเรย์" value={wood.rays_width} onValueChange={(v: string)=>handleSelectChange('rays_width', v)} icon={Layers}>
                                <SelectItem value="เล็กมาก คือ ขนาดที่พอเห็นได้ด้วยแว่นขยาย">เล็กมาก</SelectItem>
                                <SelectItem value="เล็ก คือ ขนาดที่เห็นได้ด้วยแว่นขยาย">เล็ก</SelectItem>
                                <SelectItem value="ปานกลาง คือ ขนาดที่พอเห็นได้ด้วยตา">ปานกลาง</SelectItem>
                                <SelectItem value="ใหญ่ คือ ขนาดที่เห็นอย่างสบาย ๆ ด้วยตาเปล่า">ใหญ่</SelectItem>
                            </SelectField>
                            <SelectField label="เรย์มีสองขนาด" value={wood.rays_two_distinct_sizes} onValueChange={(v: string)=>handleSelectChange('rays_two_distinct_sizes', v)} icon={Layers}>
                                <SelectItem value="มี">มี</SelectItem><SelectItem value="ไม่มี">ไม่มี</SelectItem>
                            </SelectField>
                            <SelectField label="ลักษณะเรย์รวม" value={wood.rays_aggregate} onValueChange={(v: string)=>handleSelectChange('rays_aggregate', v)} icon={Layers}>
                                <SelectItem value="มี">มี</SelectItem><SelectItem value="ไม่มี">ไม่มี</SelectItem>
                            </SelectField>
                            <SelectField label="ลักษณะเรย์เป็นชั้นๆ หรือ ริ้วลาย" value={wood.rays_storied_ripple_mark} onValueChange={(v: string)=>handleSelectChange('rays_storied_ripple_mark', v)} icon={Layers}>
                                <SelectItem value="มี">มี</SelectItem><SelectItem value="ไม่มี">ไม่มี</SelectItem>
                            </SelectField>
                            <SelectField label="ดีพอซิทในเส้นเรย์" value={wood.rays_deposit_in_rays} onValueChange={(v: string)=>handleSelectChange('rays_deposit_in_rays', v)} icon={Layers}>
                                <SelectItem value="มีสี">มีสี</SelectItem><SelectItem value="ไม่มี">ไม่มี</SelectItem>
                            </SelectField>
                        </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-[#F0F7EB]">
                        <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider">Parenchyma (พาเรงคิมา)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectField label="ประเภทของพาเรงคิมา" value={wood.ap_type} onValueChange={(v: string)=>handleSelectChange('ap_type', v)} icon={Layers}>
                                <SelectItem value="พาเรงคิมาแบบไม่ติดพอร์ ( Apotracheal axial parenchyma )">Apotracheal (ไม่ติดพอร์)</SelectItem>
                                <SelectItem value="พาเรงคิมาที่ติดพอร์ ( Paratracheal axial parenchyma )">Paratracheal (ติดพอร์)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบแถบ ( Banded parenchyma )">Banded (แบบแถบ)</SelectItem>
                            </SelectField>
                            <SelectField label="พาเรงคิมาที่ติดพอร์" value={wood.ap_paratracheal} onValueChange={(v: string)=>handleSelectChange('ap_paratracheal', v)} icon={Layers}>
                                <SelectItem value="พาเรงคิมาแบบติดพอร์เป็นหย่อม (Axial parenchyma scanty)">Scanty (เป็นหย่อม)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบติดพอร์ด้านเดียว (Axial parenchyma unilateral)">Unilateral (ด้านเดียว)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบรอบพอร์ (Axial parenchyma vasicentric)">Vasicentric (รอบพอร์)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบปีก (Axial parenchyma aliform)">Aliform (แบบปีก)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบปีกสั้น (Axial parenchyma lozenge-aliform)">Lozenge-aliform (ปีกสั้น)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบปีกยาว (Axial parenchyma winged-aliform)">Winged-aliform (ปีกยาว)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบปีกต่อ (Axial parenchyma confluent)">Confluent (ปีกต่อ)</SelectItem>
                            </SelectField>
                            <SelectField label="พาเรงคิมาแบบไม่ติดพอร์" value={wood.ap_apotracheal} onValueChange={(v: string)=>handleSelectChange('ap_apotracheal', v)} icon={Layers}>
                                <SelectItem value="พาเรงคิมาแบบกระจาย (diffuse parenchyma)">Diffuse (แบบกระจาย)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบกลุ่มกระจาย (diffuse-in-aggregates parenchyma)">Diffuse-in-aggregates</SelectItem>
                            </SelectField>
                            <SelectField label="พาเรงคิมาแบบแถบ" value={wood.ap_banded} onValueChange={(v: string)=>handleSelectChange('ap_banded', v)} icon={Layers}>
                                <SelectItem value="พาเรงคิมาแบบแถบกว้าง">แบบแถบกว้าง</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบแถบแคบ">แบบแถบแคบ</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบตาข่าย (Axial parenchyma reticulate)">Reticulate (ตาข่าย)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบบันได (Axial parenchyma scalariform)">Scalariform (บันได)</SelectItem>
                                <SelectItem value="พาเรงคิมาแบบขอบ">แบบขอบ</SelectItem>
                            </SelectField>
                        </div>
                    </div>
                  </div>
                </div>

                {/* 6. Others */}
                <div className={activeTab === 'others' ? 'block p-6 animate-in fade-in duration-300' : 'hidden'}>
                  <SectionHeader icon={Dna} title="Other Anatomical Features" color="text-purple-700" bgColor="bg-purple-50" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="โฟลเอ็มในไม้" value={wood.included_phloem} onValueChange={(v: string)=>handleSelectChange('included_phloem', v)} icon={Layers}>
                        <SelectItem value="มี">มี</SelectItem><SelectItem value="ไม่มี">ไม่มี</SelectItem>
                    </SelectField>
                    <SelectField label="ท่อระหว่างเซลล์" value={wood.intercellular_canals} onValueChange={(v: string)=>handleSelectChange('intercellular_canals', v)} icon={Layers}>
                        <SelectItem value="ท่อเรียงต่อกันเป็นเส้นยาว (Axial canals in long tangential lines)">เรียงต่อกันเป็นเส้นยาว (Long)</SelectItem>
                        <SelectItem value="ท่อเรียงต่อกันเป็นเส้นสั้น ๆ (Axial canals in short tangential lines)">เรียงต่อกันเป็นเส้นสั้นๆ (Short)</SelectItem>
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

// --- Internal Helper Components ---
const SectionHeader = ({ icon: Icon, title, color, bgColor }: any) => (
  <div className="mb-6 flex items-center gap-3 border-b border-[#F0F7EB] pb-4">
    <div className={`${bgColor} p-2 rounded-lg ${color}`}><Icon size={20} /></div>
    <h2 className="text-lg font-bold text-[#14532D]">{title}</h2>
  </div>
);

const Field = ({ label, name, value, onChange, icon: Icon, required = false }: any) => (
  <div className="space-y-2 font-kanit">
    <Label className="text-[#14532D] text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86A97A]" />
      <Input 
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        required={required}
        className="pl-9 rounded-xl border-[#CDE3BD] h-11 text-sm text-[#14532D] focus:ring-2 focus:ring-[#4CA771]/25 outline-none transition-all" 
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onValueChange, icon: Icon, children }: any) => (
  <div className="space-y-2 font-kanit">
    <Label className="text-[#14532D] text-sm font-medium">{label}</Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86A97A] z-10" />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="pl-9 rounded-xl border-[#CDE3BD] h-11 bg-white text-left text-sm text-[#14532D] shadow-sm">
          <SelectValue placeholder="เลือกรายการ..." />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-[#CDE3BD] bg-white shadow-2xl max-h-80 overflow-y-auto">
            <style jsx global>{`
              [data-radix-select-viewport] { background-color: white !important; }
              [role="option"] { padding: 10px 12px 10px 32px; border-radius: 8px; font-size: 14px; }
              [role="option"]:hover, [role="option"][data-highlighted] { background-color: #DCFCE7 !important; color: #14532D !important; }
              [role="option"][data-state="checked"] { background-color: #14532D !important; color: white !important; }
            `}</style>
            {children}
        </SelectContent>
      </Select>
    </div>
  </div>
);

const PreviewBox = ({ src, onRemove, label, isNew }: any) => (
  <div className={`relative aspect-square rounded-2xl overflow-hidden border ${isNew ? 'border-2 border-dashed border-green-500' : 'border-[#CDE3BD]'} group`}>
    <img src={src} className="w-full h-full object-cover" alt="preview" />
    <button type="button" onClick={onRemove} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md">
        <X size={14} />
    </button>
    <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${isNew ? 'bg-green-500 text-white' : 'bg-white/90 text-[#14532D]'}`}>
        {label}
    </span>
  </div>
);