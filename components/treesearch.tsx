"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus, Search, Filter, Eye, EyeOff, 
  Edit, Trash2, X, AlertTriangle, ChevronRight,
  Microscope, Layers, Search as SearchIcon, Wind, Dna,
  ChevronLeft
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

// --- Types & Interfaces ---
interface WoodImage {
  image_url: string;
  image_description?: string | null;
}

interface WoodFromDB {
  wood_id: string;
  scientific_name: string | null;
  common_name: string | null;
  wood_origin: string | null;
  wood_weight: 'LIGHT' | 'MEDIUM' | 'HEAVY' | null;
  wood_odor: string | null;
  wood_texture: string | null;
  wood_grain: string | null;
  wood_luster: string | null;
  growth_rings: string | null;
  vp_Pores_size: string | null;
  vp_vessel_grouping: string | null;
  vp_porosity?: string | null;
  vp_vessel_arrangement?: string | null;
  vp_inclusions_in_Pores?: string | null;
  rays_width?: string | null;
  rays_two_distinct_sizes?: string | null;
  rays_storied_ripple_mark?: string | null;
  ap_type?: string | null;
  ap_paratracheal?: string | null;
  sapwood_heartwood_color_diff?: string | null;
  included_phloem?: string | null;
  intercellular_canals?: string | null;
  wood_status: 'SHOW' | 'HIDE' | null;
  images: WoodImage[];
}

interface FilterState {
  name: string; region: string; color: string; weight: string; scent: string; growthRings: string;
  texture: string; grain: string; luster: string; poresSize: string; vesselGrouping: string;
  vp_porosity: string; vp_vessel_arrangement: string; vp_inclusions_in_Pores: string;
  rays_width: string; rays_two_distinct_sizes: string; rays_storied_ripple_mark: string;
  ap_type: string; ap_paratracheal: string; sapwood_heartwood_color_diff: string;
  included_phloem: string; intercellular_canals: string;
}

const initialFilters: FilterState = {
  name: '', region: '', color: '', weight: '', scent: '', growthRings: '',
  texture: '', grain: '', luster: '', poresSize: '', vesselGrouping: '',
  vp_porosity: '', vp_vessel_arrangement: '', vp_inclusions_in_Pores: '',
  rays_width: '', rays_two_distinct_sizes: '', rays_storied_ripple_mark: '',
  ap_type: '', ap_paratracheal: '', sapwood_heartwood_color_diff: '',
  included_phloem: '', intercellular_canals: '',
};

// --- Sub-Components ---
function FilterSelect({ label, value, onValueChange, children, placeholder = "ทั้งหมด" }: any) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-[#14532D]">{label}</Label>
      <Select value={value || 'all'} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 rounded-xl border-[#CDE3BD] text-sm bg-white hover:bg-slate-50 transition-colors relative z-10">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white border-[#CDE3BD] z-[200] shadow-xl">
          <SelectItem value="all">{placeholder}</SelectItem>
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}

const DeleteConfirmDialog: React.FC<{
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  isLoading: boolean; woodName: string;
}> = ({ isOpen, onClose, onConfirm, isLoading, woodName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">ยืนยันการลบ?</h3>
          <p className="text-sm text-gray-500">
            คุณต้องการลบข้อมูล <span className="font-semibold text-gray-900">"{woodName}"</span> ใช่หรือไม่?
          </p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-2">
          <Button onClick={onConfirm} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
            {isLoading ? "กำลังลบ..." : "ลบข้อมูล"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>ยกเลิก</Button>
        </div>
      </div>
    </div>
  );
};

const WoodCard: React.FC<{ 
  wood: WoodFromDB; 
  onDelete: (wood: WoodFromDB) => void;
  onToggleStatus: (wood: WoodFromDB) => void;
}> = ({ wood, onDelete, onToggleStatus }) => {
  const displayImage = wood.images && wood.images.length > 0
    ? wood.images[0].image_url
    : 'https://placehold.co/400x300?text=No+Image';

  const isHidden = wood.wood_status === 'HIDE';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-[#CDE3BD] overflow-hidden hover:shadow-md transition-all flex flex-col h-full ${isHidden ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      <Link href={`/tree/${wood.wood_id}`} className="group cursor-pointer relative">
        <div className="h-44 overflow-hidden bg-[#F6FBF6]">
          <img
            src={displayImage}
            alt={wood.common_name || "wood"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        {isHidden && (
          <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
            ซ่อนการแสดงผล
          </div>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-[#14532D] mb-1 truncate">
          {wood.common_name || 'ไม่ทราบชื่อ'}
        </h3>
        <p className="text-xs text-[#6E8E59] italic truncate mb-4">
          {wood.scientific_name || 'N/A'}
        </p>
        <div className="mt-auto pt-4 border-t border-[#F0F7EB] flex justify-around items-center">
          <button onClick={() => onDelete(wood)} className="p-2 hover:bg-red-50 rounded-xl transition-colors group">
            <Trash2 className="h-5 w-5 text-red-400 group-hover:text-red-600" />
          </button>
          <button onClick={() => onToggleStatus(wood)} className="p-2 hover:bg-blue-50 rounded-xl transition-colors group">
            {isHidden ? (
              <EyeOff className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            ) : (
              <Eye className="w-5 h-5 text-blue-400 group-hover:text-blue-600" />
            )}
          </button>
          <Link href={`/tree/edittree/${wood.wood_id}`} className="p-2 hover:bg-green-50 rounded-xl transition-colors group">
            <Edit className="w-5 h-5 text-green-400 group-hover:text-green-600" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const MoreFiltersDialog: React.FC<{
  isOpen: boolean; onClose: () => void;
  filters: FilterState; setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}> = ({ isOpen, onClose, filters, setFilters }) => {
  if (!isOpen) return null;

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(f => ({ ...f, [key]: value === 'all' ? '' : value }));
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center border-b border-[#F0F7EB] pb-4 mb-4">
          <h2 className="text-xl font-bold text-[#14532D] flex items-center gap-2">
            <Microscope className="w-5 h-5" /> ตัวกรองโครงสร้างเนื้อไม้ละเอียด
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 py-2">
          {/* 1. Vessels Structure */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2 border-b border-amber-50 pb-1">
              <SearchIcon size={14} /> Pores / Vessels Structure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FilterSelect label="การกระจายของพอร์ (Porosity)" value={filters.vp_porosity} onValueChange={(v:any)=>updateFilter('vp_porosity', v)}>
                <SelectItem value="ไม้พอร์วง (Ring-porous wood)">ไม้พอร์วง (Ring-porous)</SelectItem>
                <SelectItem value="ไม้พอร์กระจาย (Diffuse-porous wood)">ไม้พอร์กระจาย (Diffuse-porous)</SelectItem>
                <SelectItem value="ไม้พอร์กึ่งวง (Semi-ring-porous wood)">ไม้พอร์กึ่งวง (Semi-ring-porous)</SelectItem>
              </FilterSelect>
              <FilterSelect label="การเรียงตัวของพอร์ (Arrangement)" value={filters.vp_vessel_arrangement} onValueChange={(v:any)=>updateFilter('vp_vessel_arrangement', v)}>
                <SelectItem value="พอร์เรียงตัวเป็นแถบตามแนวด้านสัมผัส">แถบตามแนวด้านสัมผัส</SelectItem>
                <SelectItem value="พอร์เรียงตัวแนวเฉียง และ/หรือ เรียงตามแนวรัศมี">แนวเฉียง/แนวรัศมี</SelectItem>
                <SelectItem value="พอร์เรียงเป็นกลุ่ม">เรียงเป็นกลุ่ม</SelectItem>
              </FilterSelect>
              <FilterSelect label="กลุ่มของพอร์ (Grouping)" value={filters.vesselGrouping} onValueChange={(v:any)=>updateFilter('vesselGrouping', v)}>
                <SelectItem value="พอร์เดี่ยว">พอร์เดี่ยว</SelectItem>
                <SelectItem value="พอร์แฝด">พอร์แฝด</SelectItem>
                <SelectItem value="พอร์เรียงเป็นกลุ่ม">พอร์กลุ่ม</SelectItem>
              </FilterSelect>
              <FilterSelect label="ขนาดความโตของพอร์ (Size)" value={filters.poresSize} onValueChange={(v:any)=>updateFilter('poresSize', v)}>
                <SelectItem value="พอร์ขนาดใหญ่ ขนาดที่เห็นได้อย่างสบาย">พอร์ขนาดใหญ่</SelectItem>
                <SelectItem value="พอร์ขนาดกลาง ขนาดที่พอเห็นได้">พอร์ขนาดกลาง</SelectItem>
                <SelectItem value="พอร์ขนาดเล็ก ขนาดที่เห็นได้ด้วยแว่นขยาย">พอร์ขนาดเล็ก</SelectItem>
              </FilterSelect>
              <FilterSelect label="สิ่งที่อยู่ในพอร์ (Inclusions)" value={filters.vp_inclusions_in_Pores} onValueChange={(v:any)=>updateFilter('vp_inclusions_in_Pores', v)}>
                <SelectItem value="ไทโลส ( Tyloses )">ไทโลส (Tyloses)</SelectItem>
                <SelectItem value="ดีพอซิท ( Deposit )">ดีพอซิท (Deposit)</SelectItem>
                <SelectItem value="ยางไม้ ( Gum )">ยางไม้ (Gum)</SelectItem>
              </FilterSelect>
            </div>
          </section>

          {/* 2. Rays & Parenchyma */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2 border-b border-blue-50 pb-1">
              <Layers size={14} /> Rays & Parenchyma
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FilterSelect label="ขนาดความกว้างของเส้นเรย์" value={filters.rays_width} onValueChange={(v:any)=>updateFilter('rays_width', v)}>
                <SelectItem value="เล็กมาก คือ ขนาดที่พอเห็นได้ด้วยแว่นขยาย">เล็กมาก (แว่นขยาย)</SelectItem>
                <SelectItem value="เล็ก คือ ขนาดที่เห็นได้ด้วยแว่นขยาย">เล็ก (แว่นขยาย)</SelectItem>
                <SelectItem value="ปานกลาง คือ ขนาดที่พอเห็นได้ด้วยตา">ปานกลาง (ตาเปล่า)</SelectItem>
                <SelectItem value="ใหญ่ คือ ขนาดที่เห็นอย่างสบาย ๆ ด้วยตาเปล่า">ใหญ่ (ตาเปล่า)</SelectItem>
              </FilterSelect>
              <FilterSelect label="เรย์มีสองขนาด" value={filters.rays_two_distinct_sizes} onValueChange={(v:any)=>updateFilter('rays_two_distinct_sizes', v)}>
                <SelectItem value="มี">มี</SelectItem>
                <SelectItem value="ไม่มี">ไม่มี</SelectItem>
              </FilterSelect>
              <FilterSelect label="ประเภทของพาเรงคิมา" value={filters.ap_type} onValueChange={(v:any)=>updateFilter('ap_type', v)}>
                <SelectItem value="พาเรงคิมาแบบไม่ติดพอร์ ( Apotracheal axial parenchyma )">Apotracheal (ไม่ติดพอร์)</SelectItem>
                <SelectItem value="พาเรงคิมาที่ติดพอร์ ( Paratracheal axial parenchyma )">Paratracheal (ติดพอร์)</SelectItem>
                <SelectItem value="พาเรงคิมาแบบแถบ ( Banded parenchyma )">Banded (แบบแถบ)</SelectItem>
              </FilterSelect>
              <FilterSelect label="พาเรงคิมาที่ติดพอร์ (รูปแบบ)" value={filters.ap_paratracheal} onValueChange={(v:any)=>updateFilter('ap_paratracheal', v)}>
                <SelectItem value="พาเรงคิมาแบบรอบพอร์ (Axial parenchyma vasicentric)">Vasicentric (รอบพอร์)</SelectItem>
                <SelectItem value="พาเรงคิมาแบบปีก (Axial parenchyma aliform)">Aliform (แบบปีก)</SelectItem>
                <SelectItem value="พาเรงคิมาแบบปีกต่อ (Axial parenchyma confluent)">Confluent (ปีกต่อ)</SelectItem>
              </FilterSelect>
              <FilterSelect label="ลักษณะเรย์เป็นชั้นๆ หรือ ริ้วลาย (Ripple marks)" value={filters.rays_storied_ripple_mark} onValueChange={(v:any)=>updateFilter('rays_storied_ripple_mark', v)}>
                <SelectItem value="มี">มี</SelectItem>
                <SelectItem value="ไม่มี">ไม่มี</SelectItem>
              </FilterSelect>
            </div>
          </section>

          {/* 3. Physical & Others */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2 border-b border-purple-50 pb-1">
              <Dna size={14} /> Physical & Other Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FilterSelect label="ความหยาบละเอียดของเนื้อไม้ (Texture)" value={filters.texture} onValueChange={(v:any)=>updateFilter('texture', v)}>
                <SelectItem value="เนื้อไม้ละเอียด (Fine texture)">เนื้อไม้ละเอียด</SelectItem>
                <SelectItem value="เนื้อไม้หยาบปานกลาง (Medium texture)">หยาบปานกลาง</SelectItem>
                <SelectItem value="เนื้อไม้หยาบ (Coarse texture)">เนื้อไม้หยาบ</SelectItem>
              </FilterSelect>
              <FilterSelect label="เสี้ยนเนื้อไม้ (Grain)" value={filters.grain} onValueChange={(v:any)=>updateFilter('grain', v)}>
                <SelectItem value="เสี้ยนตรง (Straight grain)">เสี้ยนตรง</SelectItem>
                <SelectItem value="เสี้ยนสน (Interlocked grain)">เสี้ยนสน</SelectItem>
                <SelectItem value="เสี้ยนบิด (Spiral gain)">เสี้ยนบิด</SelectItem>
              </FilterSelect>
              <FilterSelect label="ความมันวาว (Luster)" value={filters.luster} onValueChange={(v:any)=>updateFilter('luster', v)}>
                <SelectItem value="เป็นมันวาว (Lustrous)">เป็นมันวาว</SelectItem>
                <SelectItem value="ด้าน (Dull)">ด้าน</SelectItem>
              </FilterSelect>
              <FilterSelect label="ความต่างของกระพี้และสีแก่นไม้" value={filters.sapwood_heartwood_color_diff} onValueChange={(v:any)=>updateFilter('sapwood_heartwood_color_diff', v)}>
                 <SelectItem value="สีกระพี้และสีแก่นไม้แตกต่างกันอย่างชัดเจน">แตกต่างชัดเจน</SelectItem>
                 <SelectItem value="สีกระพี้เหมือนหรือใกล้เคียงกับสีแก่นไม้">เหมือน/ใกล้เคียง</SelectItem>
              </FilterSelect>
              <FilterSelect label="โฟลเอ็มในไม้" value={filters.included_phloem} onValueChange={(v:any)=>updateFilter('included_phloem', v)}>
                <SelectItem value="มี">มี</SelectItem>
                <SelectItem value="ไม่มี">ไม่มี</SelectItem>
              </FilterSelect>
              <FilterSelect label="ท่อระหว่างเซลล์" value={filters.intercellular_canals} onValueChange={(v:any)=>updateFilter('intercellular_canals', v)}>
                <SelectItem value="ท่อเรียงต่อกันเป็นเส้นยาว (Axial canals in long tangential lines)">เรียงเป็นเส้นยาว</SelectItem>
                <SelectItem value="ท่อเรียงต่อกันเป็นเส้นสั้น ๆ (Axial canals in short tangential lines)">เรียงเป็นเส้นสั้น</SelectItem>
              </FilterSelect>
            </div>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-[#F0F7EB] flex justify-end gap-3">
          <Button 
            variant="ghost" 
            onClick={() => setFilters(f => ({ 
              ...initialFilters, 
              name: f.name, region: f.region, color: f.color, weight: f.weight, scent: f.scent, growthRings: f.growthRings 
            }))} 
            className="text-[#6E8E59]"
          >
            ล้างตัวกรองละเอียด
          </Button>
          <Button onClick={onClose} className="bg-[#14532D] hover:bg-[#0F3F22] text-white px-8 rounded-xl shadow-md transition-all active:scale-95">
            ตกลง
          </Button>
        </div>
      </div>
    </div>
  );
};

const SidebarFilters: React.FC<{
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenMoreFilters: () => void;
}> = ({ filters, setFilters, onOpenMoreFilters }) => {
  return (
    <div className="bg-white p-6 space-y-6 rounded-2xl border border-[#CDE3BD] shadow-sm sticky top-28">
      <div className="flex justify-between items-center border-b border-[#F0F7EB] pb-3">
        <h3 className="font-bold text-lg text-[#14532D] flex items-center gap-2">
          <Filter className="w-5 h-5" /> ตัวกรอง
        </h3>
        <button 
          onClick={() => setFilters(initialFilters)} 
          className="text-xs font-semibold text-[#16A34A] hover:underline"
        >
          รีเซ็ต
        </button>
      </div>

      {/* 1. ค้นหาชื่อ */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-[#14532D]">ค้นหาชื่อพันธุ์ไม้</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86A97A] w-4 h-4" />
          <input
            placeholder="ชื่อสามัญ / วิทยาศาสตร์"
            className="w-full h-10 pl-9 pr-4 rounded-xl border-[#CDE3BD] text-sm focus:ring-2 focus:ring-[#4CA771]/20 outline-none transition-all"
            value={filters.name}
            onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
          />
        </div>
      </div>

      {/* 2. ถิ่นกำเนิด */}
      <FilterSelect 
        label="ถิ่นกำเนิด (Distribution)" 
        value={filters.region} 
        onValueChange={(v: string) => setFilters(f => ({ ...f, region: v === 'all' ? '' : v }))}
        placeholder="ทั้งหมด"
      >
        <SelectItem value="Southeast Asia and the Pacific">Southeast Asia and the Pacific</SelectItem>
        <SelectItem value="Central South Asia">Central South Asia</SelectItem>
        <SelectItem value="Europe and temperate Asia">Europe and temperate Asia</SelectItem>
        <SelectItem value="Australia and New Zealand">Australia and New Zealand</SelectItem>
        <SelectItem value="Tropical mainland Africa and adjacent islands">Tropical mainland Africa</SelectItem>
      </FilterSelect>

      {/* 3. สีแก่นไม้ */}
      <FilterSelect 
        label="สีของแก่นไม้ (Heartwood)" 
        value={filters.color} 
        onValueChange={(v: string) => setFilters(f => ({ ...f, color: v === 'all' ? '' : v }))}
        placeholder="ทั้งหมด"
      >
        <SelectItem value="สีน้ำตาลหรือโทนสีน้ำตาล (Brown or shades of brown)">สีน้ำตาล</SelectItem>
        <SelectItem value="สีแดงหรือโทนสีแดง (Red or shades of red)">สีแดง</SelectItem>
        <SelectItem value="สีเหลืองหรือโทนสีเหลือง (Yellow or shades of yellow)">สีเหลือง</SelectItem>
        <SelectItem value="สีขาวหรือเทา (White or Gray)">สีขาว/เทา</SelectItem>
        <SelectItem value="สีดำ (Black)">สีดำ</SelectItem>
      </FilterSelect>

      {/* 4. น้ำหนัก */}
      <FilterSelect 
        label="น้ำหนัก (Weight)" 
        value={filters.weight} 
        onValueChange={(v: string) => setFilters(f => ({ ...f, weight: v === 'all' ? '' : v }))}
        placeholder="ทั้งหมด"
      >
        <SelectItem value="LIGHT">ต่ำ (≤ 0.40)</SelectItem>
        <SelectItem value="MEDIUM">กลาง (0.40 - 0.75)</SelectItem>
        <SelectItem value="HEAVY">สูง (≥ 0.75)</SelectItem>
      </FilterSelect>

      {/* 5. กลิ่น */}
      <FilterSelect 
        label="กลิ่น (Odor)" 
        value={filters.scent} 
        onValueChange={(v: string) => setFilters(f => ({ ...f, scent: v === 'all' ? '' : v }))}
        placeholder="ทั้งหมด"
      >
        <SelectItem value="มีกลิ่น">มีกลิ่น</SelectItem>
        <SelectItem value="ไม่มีกลิ่น">ไม่มีกลิ่น</SelectItem>
      </FilterSelect>

      {/* 6. วงเจริญเติบโต */}
      <FilterSelect 
        label="วงเจริญเติบโต (Growth rings)" 
        value={filters.growthRings} 
        onValueChange={(v: string) => setFilters(f => ({ ...f, growthRings: v === 'all' ? '' : v }))}
        placeholder="ทั้งหมด"
      >
        <SelectItem value="มีเห็นได้อย่างชัดเจน">มีเห็นได้อย่างชัดเจน</SelectItem>
        <SelectItem value="ไม่มีหรือเห็นไม่ชัดเจน">ไม่มีหรือเห็นไม่ชัดเจน</SelectItem>
      </FilterSelect>

      <Button
        onClick={onOpenMoreFilters}
        className="w-full h-11 rounded-xl text-[#14532D] border-[#CDE3BD] hover:bg-[#F6FBF6] hover:border-[#16A34A] flex items-center justify-between px-4"
        variant="outline"
      >
        <span className="flex items-center gap-2 text-sm font-medium"><Plus size={16} /> ตัวกรองละเอียด</span>
        <ChevronRight size={14} className="text-[#86A97A]" />
      </Button>
    </div>
  );
};

// --- Main Page (Treesearch) ---
const Treesearch: React.FC = () => {
  const [woods, setWoods] = useState<WoodFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WoodFromDB | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetch('/api/woods')
      .then(res => res.json())
      .then(data => { setWoods(data); setLoading(false); })
      .catch(err => { console.error("Error:", err); setLoading(false); });
  }, []);

  // รีเซ็ตหน้ากลับไปที่ 1 เมื่อเปลี่ยน Filter
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/woods/${deleteTarget.wood_id}`, { method: 'DELETE' });
      if (res.ok) {
        setWoods(prev => prev.filter(w => w.wood_id !== deleteTarget.wood_id));
        setDeleteTarget(null);
      }
    } catch (err) { alert("เกิดข้อผิดพลาด"); } finally { setIsDeleting(false); }
  };

  const handleToggleStatus = async (wood: WoodFromDB) => {
    const nextStatus = wood.wood_status === 'SHOW' ? 'HIDE' : 'SHOW';
    try {
      const res = await fetch(`/api/woods/${wood.wood_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wood_status: nextStatus })
      });
      if (res.ok) {
        setWoods(prev => prev.map(w => w.wood_id === wood.wood_id ? { ...w, wood_status: nextStatus } : w));
      }
    } catch (err) { console.error(err); }
  };

  const filteredWoods = useMemo(() => {
    return woods.filter(wood => {
      // Logic Filter เดิมทั้งหมดของคุณ
      if (filters.name && !(wood.common_name?.toLowerCase().includes(filters.name.toLowerCase()) || 
          wood.scientific_name?.toLowerCase().includes(filters.name.toLowerCase()))) return false;
      if (filters.region && wood.wood_origin !== filters.region) return false;
      if (filters.weight && wood.wood_weight !== filters.weight) return false;
      if (filters.scent && wood.wood_odor !== filters.scent) return false;
      if (filters.growthRings && wood.growth_rings !== filters.growthRings) return false;
      if (filters.texture && wood.wood_texture !== filters.texture) return false;
      if (filters.grain && wood.wood_grain !== filters.grain) return false;
      if (filters.luster && wood.wood_luster !== filters.luster) return false;
      if (filters.poresSize && wood.vp_Pores_size !== filters.poresSize) return false;
      if (filters.vesselGrouping && wood.vp_vessel_grouping !== filters.vesselGrouping) return false;
      if (filters.vp_porosity && wood.vp_porosity !== filters.vp_porosity) return false;
      if (filters.vp_vessel_arrangement && wood.vp_vessel_arrangement !== filters.vp_vessel_arrangement) return false;
      if (filters.vp_inclusions_in_Pores && wood.vp_inclusions_in_Pores !== filters.vp_inclusions_in_Pores) return false;
      if (filters.rays_width && wood.rays_width !== filters.rays_width) return false;
      if (filters.rays_two_distinct_sizes && wood.rays_two_distinct_sizes !== filters.rays_two_distinct_sizes) return false;
      if (filters.rays_storied_ripple_mark && wood.rays_storied_ripple_mark !== filters.rays_storied_ripple_mark) return false;
      if (filters.ap_type && wood.ap_type !== filters.ap_type) return false;
      if (filters.ap_paratracheal && wood.ap_paratracheal !== filters.ap_paratracheal) return false;
      if (filters.sapwood_heartwood_color_diff && wood.sapwood_heartwood_color_diff !== filters.sapwood_heartwood_color_diff) return false;
      if (filters.included_phloem && wood.included_phloem !== filters.included_phloem) return false;
      if (filters.intercellular_canals && wood.intercellular_canals !== filters.intercellular_canals) return false;
      return true;
    });
  }, [filters, woods]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredWoods.length / itemsPerPage);
  const currentWoods = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return filteredWoods.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredWoods]);

  return (
    <div className="min-h-screen font-kanit">
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#14532D]">ฐานข้อมูลพันธุ์ไม้</h1>
            <p className="text-[#6E8E59] mt-1">จัดการและสืบค้นข้อมูลโครงสร้างเนื้อไม้</p>
          </div>
          <Link href="/tree/addtree">
            <Button className="bg-[#14532D] hover:bg-[#0F3F22] text-white rounded-xl px-6 h-12 shadow-lg shadow-green-900/10">
              <Plus className="w-5 h-5 mr-2" /> เพิ่มข้อมูลใหม่
            </Button>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between text-sm">
              <span className="text-[#6E8E59] font-medium bg-[#DCFCE7]/50 px-4 py-1.5 rounded-full border border-[#86EFAC]/30">
                พบข้อมูล {filteredWoods.length} รายการ (หน้า {currentPage}/{totalPages || 1})
              </span>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentWoods.map(wood => (
                    <WoodCard 
                      key={wood.wood_id} 
                      wood={wood} 
                      onDelete={setDeleteTarget} 
                      onToggleStatus={handleToggleStatus} 
                    />
                  ))}
                </div>

                {/* --- Pagination Controls --- */}
                {filteredWoods.length > itemsPerPage && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl border-[#CDE3BD] hover:bg-[#F6FBF6] disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                            currentPage === page
                              ? 'bg-[#14532D] text-white shadow-md'
                              : 'bg-white text-[#6E8E59] border border-[#CDE3BD] hover:border-[#14532D] hover:text-[#14532D]'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-xl border-[#CDE3BD] hover:bg-[#F6FBF6] disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {!loading && filteredWoods.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[#CDE3BD]">
                <Search className="mx-auto h-12 w-12 text-[#CDE3BD] mb-4" />
                <h3 className="text-lg font-bold text-[#14532D]">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</h3>
                <p className="text-[#6E8E59]">ลองปรับเปลี่ยนตัวกรองหรือคำค้นหาของคุณอีกครั้ง</p>
              </div>
            )}
          </div>

          <aside className="w-full lg:w-80 flex-none">
            <SidebarFilters
              filters={filters}
              setFilters={setFilters}
              onOpenMoreFilters={() => setIsMoreFiltersOpen(true)}
            />
          </aside>
        </div>
      </main>

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        woodName={deleteTarget?.common_name || ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      <MoreFiltersDialog
        isOpen={isMoreFiltersOpen}
        onClose={() => setIsMoreFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};

export default Treesearch;