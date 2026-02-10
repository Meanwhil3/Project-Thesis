"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar";
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, Info, MapPin, Activity, Layers, 
  Droplets, X, ChevronRight, ChevronLeft as ChevronLeftIcon 
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setActiveIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, wood]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#14532D] font-medium">กำลังโหลดข้อมูล...</div>;
  if (!wood) return <div className="min-h-screen flex items-center justify-center text-slate-500">ไม่พบข้อมูลพันธุ์ไม้</div>;

  const InfoRow = ({ label, value }: { label: string, value: any }) => (
    <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between gap-1">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm text-slate-900 font-semibold">{value || '-'}</span>
    </div>
  );

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0 text-[#14532D]">
      <Icon className="w-5 h-5" />
      <h2 className="text-lg font-bold uppercase tracking-wider">{title}</h2>
    </div>
  );

  const hasImages = wood.images && wood.images.length > 0;

  return (
    <div className="bg-slate-50 min-h-screen pb-12 font-kanit">
      <main className="max-w-5xl mx-auto px-4 pt-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-white text-slate-600">
          <ChevronLeft className="w-4 h-4 mr-2" /> กลับหน้าหลัก
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Images */}
          <div className="lg:col-span-1 space-y-4">
            <div 
              className={`bg-slate-100 rounded-2xl shadow-sm border border-slate-200 overflow-hidden group relative aspect-[3/4] flex items-center justify-center ${
                hasImages ? 'cursor-zoom-in' : 'cursor-default'
              }`}
              onClick={() => hasImages && setActiveIndex(0)}
            >
              <img
                src={hasImages ? wood.images[0].image_url : 'https://placehold.co/600x800?text=No+Image'}
                className={`max-w-full max-h-full object-contain transition-transform duration-500 ${
                  hasImages ? 'group-hover:scale-105' : ''
                }`}
                alt={wood.common_name}
              />
              {hasImages && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  คลิกเพื่อขยาย
                </div>
              )}
            </div>
            
            {wood.images?.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {wood.images.map((img: any, idx: number) => (
                  <div 
                    key={idx}
                    className="bg-slate-100 rounded-lg h-20 w-full overflow-hidden border-2 border-transparent hover:border-[#14532D] cursor-pointer transition-all flex items-center justify-center p-1"
                    onClick={() => setActiveIndex(idx)}
                  >
                    <img 
                      src={img.image_url} 
                      className="max-w-full max-h-full object-contain" 
                      alt={`thumbnail-${idx}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Data Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">{wood.common_name}</h1>
                <p className="text-xl italic text-[#16A34A] mt-1">ชื่อทางวิทยาศาสตร์ : {wood.scientific_name}</p>
              </div>

              <SectionTitle icon={Info} title="ข้อมูลทั่วไป" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoRow label="สถานะ" value={wood.wood_status} />
                <InfoRow label="ถิ่นที่อยู่" value={wood.wood_origin} />
                <InfoRow label="รสชาติ" value={wood.wood_taste} />
                <InfoRow label="กลิ่น" value={wood.wood_odor} />
                <InfoRow label="ความเงา" value={wood.wood_luster} />
                <InfoRow label="น้ำหนัก" value={wood.wood_weight} />
                <InfoRow label="สีของไม้" value={wood.wood_colors} />
              </div>

              <SectionTitle icon={Activity} title="ลักษณะทางกายภาพ" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoRow label="เนื้อไม้ (Texture)" value={wood.wood_texture} />
                <InfoRow label="เสี้ยนไม้ (Grain)" value={wood.wood_grain} />
                <InfoRow label="ความต่างของสีแก่น/กระพี้" value={wood.sapwood_heartwood_color_diff} />
                <InfoRow label="วงเจริญ" value={wood.growth_rings} />
                <InfoRow label="Included Phloem" value={wood.included_phloem} />
                <InfoRow label="ท่อทางเดินน้ำมัน/ยาง" value={wood.intercellular_canals} />
              </div>

              <SectionTitle icon={Droplets} title="ลักษณะท่อลำเลียง (Vessels/Pores)" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoRow label="ความพรุน (Porosity)" value={wood.vp_porosity} />
                <InfoRow label="การเรียงตัว" value={wood.vp_vessel_grouping} />
                <InfoRow label="การจัดเรียง" value={wood.vp_vessel_arrangement} />
                <InfoRow label="สารแทรกในรูพรุน" value={wood.vp_inclusions_in_Pores} />
                <InfoRow label="ความถี่ของรูพรุน" value={wood.vp_Pores_frequency} />
                <InfoRow label="ขนาดรูพรุน" value={wood.vp_Pores_size} />
              </div>

              <SectionTitle icon={Layers} title="เส้นรัศมีและเนื้อเยื่อ (Rays & Parenchyma)" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoRow label="เส้นรัศมีต่อมม." value={wood.rays_per_mm} />
                <InfoRow label="ความกว้างเส้นรัศมี" value={wood.rays_width} />
                <InfoRow label="เนื้อเยื่อแนวตั้ง (AP Type)" value={wood.ap_type} />
                <InfoRow label="Paratracheal" value={wood.ap_paratracheal} />
                <InfoRow label="Apotracheal" value={wood.ap_apotracheal} />
                <InfoRow label="Banded" value={wood.ap_banded} />
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-2">คำอธิบายเพิ่มเติม</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {wood.wood_description || 'ไม่มีข้อมูลรายละเอียดเพิ่มเติม'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Gallery Modal */}
      {activeIndex !== null && hasImages && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200"
          onClick={() => setActiveIndex(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110] p-2"
            onClick={() => setActiveIndex(null)}
          >
            <X size={32} />
          </button>

          <button 
            className="absolute left-4 md:left-10 p-4 rounded-full bg-white/5 text-white hover:bg-white/20 transition-all z-[110]"
            onClick={handlePrev}
          >
            <ChevronLeftIcon size={40} />
          </button>

          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
            <img 
              src={wood.images[activeIndex].image_url} 
              className="max-h-[80vh] max-w-full object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-300" 
              alt={`expanded-${activeIndex}`}
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="text-center mt-6 space-y-1">
              <p className="text-white font-medium">
                ภาพที่ {activeIndex + 1} จาก {wood.images.length}
              </p>
              <p className="text-white/40 text-[10px]">
                (กดปุ่มลูกศร บนคีย์บอร์ดเพื่อเลื่อนภาพ)
              </p>
            </div>
          </div>

          <button 
            className="absolute right-4 md:right-10 p-4 rounded-full bg-white/5 text-white hover:bg-white/20 transition-all z-[110]"
            onClick={handleNext}
          >
            <ChevronRight size={40} />
          </button>
        </div>
      )}
    </div>
  );
}