"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Save, ChevronRight, Microscope, TreeDeciduous, Info } from 'lucide-react'; // แก้ไขชื่อ Navbar ให้ถูกต้อง
import Navbar from "@/components/์Navbar";


export default function AddWoodPage() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    images.forEach(img => formData.append('images', img));

    try {
      const res = await fetch('/api/woods/create', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert("บันทึกข้อมูลเรียบร้อย!");
        window.location.href = '/tree/treesearch';
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.error}`);
      }
    } catch (err) {
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar items={[{ key: "species", label: "พันธุ์ไม้", href: "/tree/treesearch" }]} />
      
      <main className="max-w-5xl mx-auto py-10 px-4">
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-md border">
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold text-[#14532D]">เพิ่มข้อมูลพันธุ์ไม้</h1>
            <p className="text-muted-foreground">กรอกข้อมูลคุณสมบัติไม้ให้ครบถ้วนตามมาตรฐานการจำแนก</p>
          </div>

          {/* ส่วนที่ 6: รูปภาพ */}
          <section className="space-y-4 pt-4 border-b">
            <h2 className="text-lg font-semibold flex items-center text-[#14532D]">
              <Upload className="mr-2 w-5 h-5" /> รูปภาพเนื้อไม้
            </h2>
            <div className="flex items-center justify-center w-full border-2 border-dashed rounded-xl p-8 hover:bg-slate-50 transition-colors cursor-pointer relative bg-slate-50/50">
               <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
               <div className="text-center text-slate-500">
                  <Upload className="w-10 h-10 mx-auto mb-2" />
                  <p>คลิกเพื่อเลือกรูปภาพ (เลือกได้หลายรูป)</p>
               </div>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mt-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square border rounded-lg overflow-hidden shadow-sm">
                  <img src={src} className="w-full h-full object-cover" alt="Preview" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"><X size={12}/></button>
                </div>
              ))}
            </div>
          </section>

          {/* ส่วนที่ 1: ข้อมูลพื้นฐาน */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center text-[#14532D]">
              <Info className="mr-2 w-5 h-5" /> ข้อมูลทั่วไป (General)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>ชื่อพื้นเมือง</Label>
                <Input name="common_name" required placeholder="เช่น ประดู่" />
              </div>
              <div className="space-y-2">
                <Label>ชื่อวิทยาศาสตร์</Label>
                <Input name="scientific_name" className="italic" placeholder="Pterocarpus macrocarpus" />
              </div>
              <div className="space-y-2">
                <Label>ถิ่นกำเนิด</Label>
                <Input name="wood_origin" placeholder="เช่น เอเชียตะวันออกเฉียงใต้" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>คำอธิบายเพิ่มเติม</Label>
              <Textarea name="wood_description" placeholder="รายละเอียดอื่นๆ..." />
            </div>
          </section>

          {/* ส่วนที่ 2: ลักษณะทางกายภาพ */}
          <section className="space-y-4 pt-4 border-t">
            <h2 className="text-lg font-semibold flex items-center text-[#14532D]">
              <TreeDeciduous className="mr-2 w-5 h-5" /> ลักษณะทางกายภาพ (Physical)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>น้ำหนักไม้</Label>
                <Select name="wood_weight">
                  <SelectTrigger><SelectValue placeholder="เลือก..." /></SelectTrigger>
                  <SelectContent className="bg-white border-border shadow-lg">
                    <SelectItem value="LIGHT">LIGHT (เบา)</SelectItem>
                    <SelectItem value="MEDIUM">MEDIUM (ปานกลาง)</SelectItem>
                    <SelectItem value="HEAVY">HEAVY (หนัก)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>สีเนื้อไม้</Label><Input name="wood_colors" /></div>
              <div className="space-y-2"><Label>กลิ่น</Label><Input name="wood_odor" /></div>
              <div className="space-y-2"><Label>รสชาติ</Label><Input name="wood_taste" /></div>
              <div className="space-y-2"><Label>ความเงา</Label><Input name="wood_luster" /></div>
              <div className="space-y-2"><Label>เสี้ยนไม้</Label><Input name="wood_grain" /></div>
              <div className="space-y-2"><Label>เนื้อละเอียด/หยาบ</Label><Input name="wood_Texture" /></div>
              <div className="space-y-2"><Label>วงเจริญ</Label><Input name="growth_rings" /></div>
              <div className="space-y-2"><Label>สีแก่น/กระพี้ (ต่างกัน?)</Label><Input name="sapwood_heartwood_color_diff" /></div>
            </div>
          </section>

          {/* ส่วนที่ 3: ลักษณะทางวิภาค (Vessels/Pores) */}
          <section className="space-y-4 pt-4 border-t">
            <h2 className="text-lg font-semibold flex items-center text-[#14532D]">
              <Microscope className="mr-2 w-5 h-5" /> ลักษณะรู (Vessels/Pores)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2"><Label>การกระจายรู (Porosity)</Label><Input name="vp_porosity" /></div>
              <div className="space-y-2"><Label>การจัดกลุ่มรู</Label><Input name="vp_vessel_grouping" /></div>
              <div className="space-y-2"><Label>การเรียงตัวของรู</Label><Input name="vp_vessel_arrangement" /></div>
              <div className="space-y-2"><Label>สิ่งอุดตันในรู</Label><Input name="vp_inclusions_in_Pores" /></div>
              <div className="space-y-2"><Label>ความถี่รู</Label><Input name="vp_Pores_frequency" /></div>
              <div className="space-y-2"><Label>ขนาดรู</Label><Input name="vp_Pores_size" /></div>
              <div className="space-y-2"><Label>สัดส่วนรู/รังสี</Label><Input name="vp_Pores_rays_ratio" /></div>
            </div>
          </section>

          {/* ส่วนที่ 4: รังสีไม้ (Rays) และ เนื้อเยื่อ (Parenchyma) */}
          <section className="space-y-4 pt-4 border-t">
            <h2 className="text-lg font-semibold flex items-center text-[#14532D]">
              <ChevronRight className="mr-2 w-5 h-5" /> รังสีและเนื้อเยื่อ (Rays & AP)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>จำนวนรังสี (ต่อ มม.)</Label>
                <Select name="rays_per_mm">
                  <SelectTrigger><SelectValue placeholder="เลือก..." /></SelectTrigger>
                  <SelectContent className="bg-white border-border shadow-lg">
                    <SelectItem value="LOW">LOW</SelectItem>
                    <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                    <SelectItem value="HIGH">HIGH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>ความกว้างรังสี</Label><Input name="rays_width" /></div>
              <div className="space-y-2"><Label>รังสี 2 ขนาด</Label><Input name="rays_two_distinct_sizes" /></div>
              <div className="space-y-2"><Label>รังสีแบบ Aggregate</Label><Input name="rays_aggregate" /></div>
              <div className="space-y-2"><Label>Ripple Marks</Label><Input name="rays_storied_ripple_mark" /></div>
              <div className="space-y-2"><Label>สิ่งสะสมในรังสี</Label><Input name="rays_deposit_in_rays" /></div>
              <div className="space-y-2"><Label>AP Type</Label><Input name="ap_type" /></div>
              <div className="space-y-2"><Label>AP Paratracheal</Label><Input name="ap_paratracheal" /></div>
              <div className="space-y-2"><Label>AP Apotracheal</Label><Input name="ap_apotracheal" /></div>
              <div className="space-y-2"><Label>AP Banded</Label><Input name="ap_banded" /></div>
            </div>
          </section>

          {/* ส่วนที่ 5: คุณลักษณะพิเศษอื่นๆ */}
          <section className="space-y-4 pt-4 border-t">
            <h2 className="text-lg font-semibold flex items-center text-[#14532D]">
              <ChevronRight className="mr-2 w-5 h-5" /> คุณลักษณะพิเศษอื่นๆ
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Phloem ในเนื้อไม้</Label><Input name="included_phloem" /></div>
              <div className="space-y-2"><Label>ท่อทางเดินน้ำมัน/ชัน</Label><Input name="intercellular_canals" /></div>
            </div>
          </section>

          

          <div className="pt-6 border-t flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>ยกเลิก</Button>
            <Button type="submit" className="bg-[#14532D] hover:bg-[#114023] px-10 text-white" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : <><Save className="w-4 h-4 mr-2" /> บันทึกข้อมูลไม้</>}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}