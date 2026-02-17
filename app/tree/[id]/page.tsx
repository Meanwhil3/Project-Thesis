"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft, Info, MapPin, Layers,
  Droplets, X, ChevronRight, ChevronLeft as ChevronLeftIcon,
  Microscope, Search, Palette, Wind, Dna, TextQuote,
  Ruler, LayoutGrid
} from 'lucide-react';

export default function WoodDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [wood, setWood] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/woods/${id}`)
      .then(res => res.json())
      .then(data => {
        setWood(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (wood?.images?.length > 0 && activeIndex !== null) {
      setActiveIndex((activeIndex + 1) % wood.images.length);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (wood?.images?.length > 0 && activeIndex !== null) {
      setActiveIndex((activeIndex - 1 + wood.images.length) % wood.images.length);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-kanit gap-4 bg-white">
      <div className="w-10 h-10 border-4 border-[#14532D]/20 border-t-[#14532D] rounded-full animate-spin"></div>
      <p className="text-[#14532D] font-medium">กำลังดึงข้อมูล...</p>
    </div>
  );

  if (!wood) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-kanit">ไม่พบข้อมูล</div>;

  const InfoRow = ({ label, value, highlight = false }: { label: string, value: any, highlight?: boolean }) => (
    <div className="py-3 border-b border-slate-50 flex flex-col sm:flex-row sm:justify-between gap-1 group hover:bg-slate-50/50 transition-colors px-2">
      <span className="text-[13px] font-medium text-slate-500 leading-tight">{label}</span>
      <span className={`text-[14px] font-semibold text-right ${highlight ? 'text-[#16A34A]' : 'text-slate-800'}`}>
        {value && value !== "" ? value : '-'}
      </span>
    </div>
  );

  const SectionCard = ({ icon: Icon, title, children, colorClass }: any) => (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden mb-8">
      <div className={`px-6 py-4 border-b border-slate-50 flex items-center gap-3 ${colorClass}`}>
        <Icon className="w-5 h-5" />
        <h2 className="text-base font-bold uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  const hasImages = wood.images && wood.images.length > 0;

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-kanit">
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">

        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-2 text-slate-500 hover:text-[#14532D] hover:bg-[#DCFCE7]/50">
              <ChevronLeft className="w-4 h-4 mr-1" /> ย้อนกลับ
            </Button>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{wood.common_name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Dna className="w-4 h-4 text-[#16A34A]" />
              <p className="text-lg italic text-[#16A34A] font-medium">{wood.scientific_name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${wood.wood_status === 'SHOW' ? 'bg-[#DCFCE7] text-[#14532D]' : 'bg-slate-200 text-slate-600'}`}>
              สถานะการแสดงผล: {wood.wood_status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            <div
              className="bg-white p-2 rounded-[32px] shadow-md border border-slate-100 group relative aspect-[4/5] flex items-center justify-center overflow-hidden cursor-zoom-in"
              onClick={() => hasImages && setActiveIndex(0)}
            >
              <img
                src={hasImages ? wood.images[0].image_url : 'https://placehold.co/600x800?text=No+Image'}
                className="w-full h-full object-cover rounded-[24px] transition-transform duration-700 group-hover:scale-105"
                alt={wood.common_name}
              />
            </div>

            {wood.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3 px-2">
                {wood.images.map((img: any, idx: number) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-[#14532D] transition-all cursor-pointer" onClick={() => setActiveIndex(idx)}>
                    <img src={img.image_url} className="w-full h-full object-cover" alt="thumbnail" />
                  </div>
                ))}
              </div>
            )}

            <div className="bg-[#14532D] rounded-[24px] p-6 text-white shadow-lg">
              <h3 className="flex items-center gap-2 font-bold mb-4 opacity-90"><MapPin size={18} /> ถิ่นกำเนิดไม้ (Geographic distribution)</h3>
              <p className="text-sm leading-relaxed font-light">{wood.wood_origin || 'ไม่มีข้อมูล'}</p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8">

            {/* 1. Basic Info & Description */}
            <SectionCard icon={Info} title="ข้อมูลพื้นฐานและอัตลักษณ์" colorClass="bg-emerald-50 text-emerald-700">
              <div className="grid grid-cols-2 gap-y-1 mb-6">
                <InfoRow label="ชื่อสามัญ" value={wood.common_name} />
                <InfoRow label="ชื่อวิทยาศาสตร์" value={wood.scientific_name} />
                <InfoRow label="ถิ่นกำเนิดไม้ (Geographic distribution)" value={wood.wood_origin} />
                <InfoRow label="วงเจริญเติบโต (Growth rings)" value={wood.growth_rings} />

              </div>
              <div className="mt-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-3"><TextQuote size={16} /> รายละเอียดไม้ทั่วไป (Description)</h4>
                <p className="text-slate-600 text-[14px] leading-relaxed whitespace-pre-wrap bg-slate-50 p-5 rounded-2xl border border-dashed border-emerald-100">
                  {wood.wood_description || 'ไม่มีข้อมูลรายละเอียดเพิ่มเติม'}
                </p>
              </div>
            </SectionCard>

            {/* 2. Physical & Sensory (Ruler Icon) */}
            <SectionCard icon={Ruler} title="ลักษณะกายภาพ (Physical & Sensory Properties)" colorClass="bg-amber-50 text-amber-700">
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12"> */}
              <div className="grid grid-cols-2 gap-y-1 mb-6">
                <InfoRow label="สีของแก่นไม้ (Heartwood color)" value={wood.wood_colors} />
                <InfoRow label="ความแตกต่างของสีกระพี้และสีแก่นไม้" value={wood.sapwood_heartwood_color_diff} />
                <InfoRow label="ความหยาบละเอียดของเนื้อไม้ (Texture)" value={wood.wood_texture} />
                <InfoRow label="เสี้ยนเนื้อไม้ (Grain)" value={wood.wood_grain} />
                <InfoRow label="ความมันวาว (Luster)" value={wood.wood_luster} />
                <InfoRow label="น้ำหนัก (Weight)" value={wood.wood_weight} />
                <InfoRow label="รส (Taste)" value={wood.wood_taste} />
                <InfoRow label="กลิ่น (Odor)" value={wood.wood_odor} />
              </div>
            </SectionCard>

            {/* 3. Vessels Structure (Search/Microscope Icon) */}
            <SectionCard icon={Search} title="โครงสร้างเนื้อไม้ (Pores / Vessels Structure)" colorClass="bg-orange-50 text-orange-700">
              <div className="grid grid-cols-2 gap-y-1 mb-6">
                <InfoRow label="การกระจายของพอร์ (Porosity)" value={wood.vp_porosity} />
                <InfoRow label="กลุ่มของพอร์ (Vessel grouping)" value={wood.vp_vessel_grouping} />
                <InfoRow label="การเรียงตัวของพอร์ (Vessel arrangement)" value={wood.vp_vessel_arrangement} />
                <InfoRow label="จำนวนของพอร์ (Pores frequency)" value={wood.vp_Pores_frequency} />
                <InfoRow label="ขนาดความโตของพอร์ (Pores size)" value={wood.vp_Pores_size} />
                <InfoRow label="สิ่งที่อยู่ในพอร์ (Inclusions in pores)" value={wood.vp_inclusions_in_Pores} />
                <InfoRow label="สัดส่วนเรย์กับพอร์" value={wood.vp_Pores_rays_ratio} />
              </div>
            </SectionCard>

            {/* 4. Rays & Parenchyma (Layers Icon) */}
            <SectionCard icon={Layers} title="เรย์และพาเรงคิมา (Rays & Parenchyma)" colorClass="bg-blue-50 text-blue-700">
              <div className="space-y-8">
                <div>
                  <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-3 px-2">Rays (เรย์)</h4>
                  <div className="grid grid-cols-2 gap-y-1 mb-6">
                    <InfoRow label="จำนวนของเส้นเรย์ (Rays per mm)" value={wood.rays_per_mm} />
                    <InfoRow label="ขนาดความกว้างของเส้นเรย์" value={wood.rays_width} />
                    <InfoRow label="เรย์มีสองขนาด" value={wood.rays_two_distinct_sizes} />
                    <InfoRow label="ลักษณะเรย์รวม" value={wood.rays_aggregate} />
                    <InfoRow label="เรย์เป็นชั้นๆ หรือ ริ้วลาย" value={wood.rays_storied_ripple_mark} />
                    <InfoRow label="ดีพอซิทในเส้นเรย์" value={wood.rays_deposit_in_rays} />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-3 px-2">Parenchyma (พาเรงคิมา)</h4>
                  <div className="grid grid-cols-2 gap-y-1 mb-6">
                    <InfoRow label="ประเภทของพาเรงคิมา" value={wood.ap_type} />
                    <InfoRow label="พาเรงคิมาที่ติดพอร์ (Paratracheal)" value={wood.ap_paratracheal} />
                    <InfoRow label="พาเรงคิมาแบบไม่ติดพอร์ (Apotracheal)" value={wood.ap_apotracheal} />
                    <InfoRow label="พาเรงคิมาแบบแถบ (Banded)" value={wood.ap_banded} />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 5. Others (Dna Icon) */}
            <SectionCard icon={Dna} title="องค์ประกอบทางกายวิภาคอื่นๆ (Other Features)" colorClass="bg-purple-50 text-purple-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                <InfoRow label="โฟลเอ็มในไม้ (Included phloem)" value={wood.included_phloem} />
                <InfoRow label="ท่อระหว่างเซลล์ (Intercellular canals)" value={wood.intercellular_canals} />
              </div>
            </SectionCard>

          </div>
        </div>
      </main>

      {/* Gallery Modal */}
      {activeIndex !== null && hasImages && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-300" onClick={() => setActiveIndex(null)}>
          <button className="absolute top-8 right-8 text-white/50 hover:text-white p-2"><X size={40} /></button>
          <button className="absolute left-6 md:left-12 p-4 rounded-full bg-white/5 text-white hover:bg-[#16A34A] transition-all z-[110]" onClick={handlePrev}><ChevronLeftIcon size={32} /></button>
          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center p-4">
            <img src={wood.images[activeIndex].image_url} className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()} />
            <p className="mt-8 text-white text-lg font-medium">ภาพที่ {activeIndex + 1} / {wood.images.length}</p>
          </div>
          <button className="absolute right-6 md:right-12 p-4 rounded-full bg-white/5 text-white hover:bg-[#16A34A] transition-all z-[110]" onClick={handleNext}><ChevronRight size={32} /></button>
        </div>
      )}
    </div>
  );
}