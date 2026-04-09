"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus, Search, Filter, Eye, EyeOff,
  Edit, Trash2, X, AlertTriangle, ChevronRight,
  Microscope, Layers, Search as SearchIcon, Wind, Dna,
  ChevronLeft, Palette, Droplets, MapPin, Ruler
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useSession } from "next-auth/react"; // เพิ่มการนำเข้า useSession

// ✅ นำเข้า FilterSelect ตัวใหม่
import FilterSelect from "@/components/ui/FilterSelect";

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
  vp_Pores_frequency?: string | null;
  vp_Pores_rays_ratio?: string | null;
  rays_width?: string | null;
  rays_two_distinct_sizes?: string | null;
  rays_storied_ripple_mark?: string | null;
  rays_per_mm?: string | null;
  rays_aggregate?: string | null;
  rays_deposit_in_rays?: string | null;
  ap_type?: string | null;
  ap_paratracheal?: string | null;
  ap_apotracheal?: string | null;
  ap_banded?: string | null;
  sapwood_heartwood_color_diff?: string | null;
  included_phloem?: string | null;
  intercellular_canals?: string | null;
  wood_status: 'SHOW' | 'HIDE' | null;
  wood_colors?: string | null;
  wood_taste?: string | null;
  images: WoodImage[];
}

interface FilterState {
  name: string; region: string; color: string; weight: string; scent: string; growthRings: string;
  texture: string; grain: string; luster: string; poresSize: string; vesselGrouping: string;
  vp_porosity: string; vp_vessel_arrangement: string; vp_inclusions_in_Pores: string;
  vp_Pores_frequency: string; vp_Pores_rays_ratio: string;
  rays_width: string; rays_two_distinct_sizes: string; rays_storied_ripple_mark: string;
  rays_per_mm: string; rays_aggregate: string; rays_deposit_in_rays: string;
  ap_type: string; ap_paratracheal: string; ap_apotracheal: string; ap_banded: string;
  sapwood_heartwood_color_diff: string; included_phloem: string; intercellular_canals: string;
  wood_taste: string; wood_status: string;
}

const initialFilters: FilterState = {
  name: '', region: '', color: '', weight: '', scent: '', growthRings: '',
  texture: '', grain: '', luster: '', poresSize: '', vesselGrouping: '',
  vp_porosity: '', vp_vessel_arrangement: '', vp_inclusions_in_Pores: '',
  vp_Pores_frequency: '', vp_Pores_rays_ratio: '',
  rays_width: '', rays_two_distinct_sizes: '', rays_storied_ripple_mark: '',
  rays_per_mm: '', rays_aggregate: '', rays_deposit_in_rays: '',
  ap_type: '', ap_paratracheal: '', ap_apotracheal: '', ap_banded: '',
  sapwood_heartwood_color_diff: '', included_phloem: '', intercellular_canals: '',
  wood_taste: '', wood_status: '',
};

// --- Sub-Components ---

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
  canManage: boolean; // รับสิทธิเข้ามาเช็ค
}> = ({ wood, onDelete, onToggleStatus, canManage }) => {
  const displayImage = wood.images && wood.images.length > 0
    ? wood.images[0].image_url
    : 'https://placehold.co/400x300?text=No+Image';

  const isHidden = wood.wood_status === 'HIDE';

  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl shadow-sm border border-[#CDE3BD] overflow-hidden hover:shadow-md transition-all flex flex-col h-full ${isHidden ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      <Link href={`/tree/${wood.wood_id}`} className="group cursor-pointer relative">
        <div className="h-32 sm:h-44 overflow-hidden bg-[#F6FBF6]">
          <img
            src={displayImage}
            alt={wood.common_name || "wood"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        {isHidden && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/70 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg backdrop-blur-sm">
            ซ่อนการแสดงผล
          </div>
        )}
      </Link>
      <div className="p-1.5 sm:p-1 flex flex-col flex-1">
        <h3 className="text-sm sm:text-lg font-bold text-[#14532D] mb-0.5 sm:mb-1 truncate ml-0.5 sm:ml-1">
          {wood.common_name || 'ไม่ทราบชื่อ'}
        </h3>
        <p className="text-[10px] sm:text-xs text-[#6E8E59] italic truncate mb-1.5 sm:mb-2 ml-0.5 sm:ml-1">
          {wood.scientific_name || 'N/A'}
        </p>
        {canManage ? (
          <div className="mt-auto pt-1 border-t border-[#F0F7EB] flex justify-around items-center">
            <button onClick={() => onDelete(wood)} className="p-1.5 sm:p-2 hover:bg-red-50 rounded-xl transition-colors group">
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 group-hover:text-red-600" />
            </button>
            <button onClick={() => onToggleStatus(wood)} className="p-1.5 sm:p-2 hover:bg-blue-50 rounded-xl transition-colors group">
              {isHidden ? (
                <EyeOff className="h-4 w-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 sm:w-5 sm:h-5 text-blue-400 group-hover:text-blue-600" />
              )}
            </button>
            <Link href={`/tree/edittree/${wood.wood_id}`} className="p-1.5 sm:p-2 hover:bg-green-50 rounded-xl transition-colors group">
              <Edit className="h-4 w-4 sm:w-5 sm:h-5 text-green-400 group-hover:text-green-600" />
            </Link>
          </div>
        ) : (
          <div className="py-1 sm:py-2 text-[10px] text-[#86A97A] font-light italic"></div>
        )}
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
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">การกระจายของพอร์ (Porosity)</Label>
                <FilterSelect
                  value={filters.vp_porosity || 'all'}
                  onValueChange={(v) => updateFilter('vp_porosity', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'ไม้พอร์วง (Ring-porous wood)', label: 'ไม้พอร์วง (Ring-porous)' },
                    { value: 'ไม้พอร์กระจาย (Diffuse-porous wood)', label: 'ไม้พอร์กระจาย (Diffuse-porous)' },
                    { value: 'ไม้พอร์กึ่งวง (Semi-ring-porous wood)', label: 'ไม้พอร์กึ่งวง (Semi-ring-porous)' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">การเรียงตัวของพอร์ (Arrangement)</Label>
                <FilterSelect
                  value={filters.vp_vessel_arrangement || 'all'}
                  onValueChange={(v) => updateFilter('vp_vessel_arrangement', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'พอร์เรียงตัวเป็นแถบตามแนวด้านสัมผัส', label: 'แถบตามแนวด้านสัมผัส' },
                    { value: 'พอร์เรียงตัวแนวเฉียง และ/หรือ เรียงตามแนวรัศมี', label: 'แนวเฉียง/แนวรัศมี' },
                    { value: 'พอร์เรียงเป็นกลุ่ม', label: 'เรียงเป็นกลุ่ม' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">กลุ่มของพอร์ (Grouping)</Label>
                <FilterSelect
                  value={filters.vesselGrouping || 'all'}
                  onValueChange={(v) => updateFilter('vesselGrouping', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'พอร์เดี่ยว', label: 'พอร์เดี่ยว' },
                    { value: 'พอร์แฝด', label: 'พอร์แฝด' },
                    { value: 'พอร์เรียงเป็นกลุ่ม', label: 'พอร์กลุ่ม' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">จำนวนของพอร์ (Frequency)</Label>
                <FilterSelect
                  value={filters.vp_Pores_frequency || 'all'}
                  onValueChange={(v) => updateFilter('vp_Pores_frequency', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'หนาแน่นน้อยมาก ( ≤ 5 vessels per square millimeter )', label: 'น้อยมาก (≤ 5)' },
                    { value: 'หนาแน่นน้อย ( 5 - 20 vessels per square millimeter )', label: 'น้อย (5 - 20)' },
                    { value: 'หนาแน่นปานกลาง ( 20 - 40 vessels per square millimeter )', label: 'ปานกลาง (20 - 40)' },
                    { value: 'หนาแน่นมาก ( 40 - 100 vessels per square millimeter )', label: 'มาก (40 - 100)' },
                    { value: 'หนาแน่นสูงมาก ( ≥ 100 vessels per square millimeter )', label: 'สูงมาก (≥ 100)' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">ขนาดความโตของพอร์ (Size)</Label>
                <FilterSelect
                  value={filters.poresSize || 'all'}
                  onValueChange={(v) => updateFilter('poresSize', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'พอร์ขนาดใหญ่ ขนาดที่เห็นได้อย่างสบาย', label: 'พอร์ขนาดใหญ่' },
                    { value: 'พอร์ขนาดกลาง ขนาดที่พอเห็นได้', label: 'พอร์ขนาดกลาง' },
                    { value: 'พอร์ขนาดเล็ก ขนาดที่เห็นได้ด้วยแว่นขยาย', label: 'พอร์ขนาดเล็ก' },
                    { value: 'พอร์ขนาดเล็กมาก ขนาดที่พอมองเห็นได้ต้องใช้แว่นขยาย 10 - 15 เท่า', label: 'พอร์ขนาดเล็กมาก (10-15x)' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">สิ่งที่อยู่ในพอร์ (Inclusions)</Label>
                <FilterSelect
                  value={filters.vp_inclusions_in_Pores || 'all'}
                  onValueChange={(v) => updateFilter('vp_inclusions_in_Pores', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'ไทโลส ( Tyloses )', label: 'ไทโลส (Tyloses)' },
                    { value: 'ดีพอซิท ( Deposit )', label: 'ดีพอซิท (Deposit)' },
                    { value: 'ยางไม้ ( Gum )', label: 'ยางไม้ (Gum)' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">สัดส่วนเรย์กับพอร์</Label>
                <FilterSelect
                  value={filters.vp_Pores_rays_ratio || 'all'}
                  onValueChange={(v) => updateFilter('vp_Pores_rays_ratio', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'เรย์มีขนาดเล็กกว่าขนาดความกว้างของพอร์', label: 'เรย์เล็กกว่าพอร์' },
                    { value: 'เรย์มีขนาดเท่ากับขนาดของพอร์', label: 'เรย์เท่ากับพอร์' },
                    { value: 'เรย์มีขนาดใหญ่กว่าพอร์', label: 'เรย์ใหญ่กว่าพอร์' },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* 2. Rays & Parenchyma */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2 border-b border-blue-50 pb-1">
              <Layers size={14} /> Rays & Parenchyma
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">จำนวนของเส้นเรย์ (per mm)</Label>
                <FilterSelect
                  value={filters.rays_per_mm || 'all'}
                  onValueChange={(v) => updateFilter('rays_per_mm', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'LOW', label: 'น้อย (< 4 เส้น/มม.)' },
                    { value: 'MEDIUM', label: 'ปานกลาง (4 - 12 เส้น/มม.)' },
                    { value: 'HIGH', label: 'มาก (> 12 เส้น/มม.)' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">ขนาดความกว้างของเส้นเรย์</Label>
                <FilterSelect
                  value={filters.rays_width || 'all'}
                  onValueChange={(v) => updateFilter('rays_width', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'เล็กมาก คือ ขนาดที่พอเห็นได้ด้วยแว่นขยาย', label: 'เล็กมาก (แว่นขยาย)' },
                    { value: 'เล็ก คือ ขนาดที่เห็นได้ด้วยแว่นขยาย', label: 'เล็ก (แว่นขยาย)' },
                    { value: 'ปานกลาง คือ ขนาดที่พอเห็นได้ด้วยตา', label: 'ปานกลาง (ตาเปล่า)' },
                    { value: 'ใหญ่ คือ ขนาดที่เห็นอย่างสบาย ๆ ด้วยตาเปล่า', label: 'ใหญ่ (ตาเปล่า)' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">เรย์มีสองขนาด</Label>
                <FilterSelect
                  value={filters.rays_two_distinct_sizes || 'all'}
                  onValueChange={(v) => updateFilter('rays_two_distinct_sizes', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'มี', label: 'มี' },
                    { value: 'ไม่มี', label: 'ไม่มี' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">ลักษณะเรย์รวม (Aggregate)</Label>
                <FilterSelect
                  value={filters.rays_aggregate || 'all'}
                  onValueChange={(v) => updateFilter('rays_aggregate', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'มี', label: 'มี' },
                    { value: 'ไม่มี', label: 'ไม่มี' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">ประเภทของพาเรงคิมา</Label>
                <FilterSelect
                  value={filters.ap_type || 'all'}
                  onValueChange={(v) => updateFilter('ap_type', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'พาเรงคิมาแบบไม่ติดพอร์ ( Apotracheal axial parenchyma )', label: 'Apotracheal (ไม่ติดพอร์)' },
                    { value: 'พาเรงคิมาที่ติดพอร์ ( Paratracheal axial parenchyma )', label: 'Paratracheal (ติดพอร์)' },
                    { value: 'พาเรงคิมาแบบแถบ ( Banded parenchyma )', label: 'Banded (แบบแถบ)' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">พาเรงคิมาที่ติดพอร์ (รูปแบบ)</Label>
                <FilterSelect
                  value={filters.ap_paratracheal || 'all'}
                  onValueChange={(v) => updateFilter('ap_paratracheal', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'พาเรงคิมาแบบติดพอร์เป็นหย่อม (Axial parenchyma scanty)', label: 'Scanty (เป็นหย่อม)' },
                    { value: 'พาเรงคิมาแบบติดพอร์ด้านเดียว (Axial parenchyma unilateral)', label: 'Unilateral (ด้านเดียว)' },
                    { value: 'พาเรงคิมาแบบรอบพอร์ (Axial parenchyma vasicentric)', label: 'Vasicentric (รอบพอร์)' },
                    { value: 'พาเรงคิมาแบบปีก (Axial parenchyma aliform)', label: 'Aliform (แบบปีก)' },
                    { value: 'พาเรงคิมาแบบปีกสั้น (Axial parenchyma lozenge-aliform)', label: 'Lozenge-aliform (ปีกสั้น)' },
                    { value: 'พาเรงคิมาแบบปีกยาว (Axial parenchyma winged-aliform)', label: 'Winged-aliform (ปีกยาว)' },
                    { value: 'พาเรงคิมาแบบปีกต่อ (Axial parenchyma confluent)', label: 'Confluent (ปีกต่อ)' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">พาเรงคิมาแบบไม่ติดพอร์</Label>
                <FilterSelect
                  value={filters.ap_apotracheal || 'all'}
                  onValueChange={(v) => updateFilter('ap_apotracheal', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'พาเรงคิมาแบบกระจาย (diffuse parenchyma)', label: 'Diffuse (แบบกระจาย)' },
                    { value: 'พาเรงคิมาแบบกลุ่มกระจาย (diffuse-in-aggregates parenchyma)', label: 'Diffuse-in-aggregates' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">พาเรงคิมาแบบแถบ</Label>
                <FilterSelect
                  value={filters.ap_banded || 'all'}
                  onValueChange={(v) => updateFilter('ap_banded', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'พาเรงคิมาแบบแถบกว้าง', label: 'แถบกว้าง' },
                    { value: 'พาเรงคิมาแบบแถบแคบ', label: 'แถบแคบ' },
                    { value: 'พาเรงคิมาแบบตาข่าย (Axial parenchyma reticulate)', label: 'Reticulate (ตาข่าย)' },
                    { value: 'พาเรงคิมาแบบบันได (Axial parenchyma scalariform)', label: 'Scalariform (บันได)' },
                    { value: 'พาเรงคิมาแบบขอบ', label: 'แบบขอบ' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">ริ้วลาย (Ripple marks)</Label>
                <FilterSelect
                  value={filters.rays_storied_ripple_mark || 'all'}
                  onValueChange={(v) => updateFilter('rays_storied_ripple_mark', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'มี', label: 'มี' },
                    { value: 'ไม่มี', label: 'ไม่มี' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">ดีพอซิทในเส้นเรย์</Label>
                <FilterSelect
                  value={filters.rays_deposit_in_rays || 'all'}
                  onValueChange={(v) => updateFilter('rays_deposit_in_rays', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'มีสี', label: 'มีสี' },
                    { value: 'ไม่มี', label: 'ไม่มี' },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* 3. Physical & Others */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2 border-b border-purple-50 pb-1">
              <Dna size={14} /> Physical & Other Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">ความหยาบละเอียด (Texture)</Label>
                <FilterSelect
                  value={filters.texture || 'all'}
                  onValueChange={(v) => updateFilter('texture', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'เนื้อไม้ละเอียด (Fine texture)', label: 'เนื้อไม้ละเอียด' },
                    { value: 'เนื้อไม้หยาบปานกลาง (Medium texture)', label: 'หยาบปานกลาง' },
                    { value: 'เนื้อไม้หยาบ (Coarse texture)', label: 'เนื้อไม้หยาบ' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">เสี้ยนเนื้อไม้ (Grain)</Label>
                <FilterSelect
                  value={filters.grain || 'all'}
                  onValueChange={(v) => updateFilter('grain', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'เสี้ยนตรง (Straight grain)', label: 'เสี้ยนตรง' },
                    { value: 'เสี้ยนสน (Interlocked grain)', label: 'เสี้ยนสน' },
                    { value: 'เสี้ยนบิด (Spiral gain)', label: 'เสี้ยนบิด' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">ความมันวาว (Luster)</Label>
                <FilterSelect
                  value={filters.luster || 'all'}
                  onValueChange={(v) => updateFilter('luster', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'เป็นมันวาว (Lustrous)', label: 'เป็นมันวาว' },
                    { value: 'ด้าน (Dull)', label: 'ด้าน' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">รสชาติ (Taste)</Label>
                <FilterSelect
                  value={filters.wood_taste || 'all'}
                  onValueChange={(v) => updateFilter('wood_taste', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'มีรส', label: 'มีรส' },
                    { value: 'ไม่มีรส', label: 'ไม่มีรส' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">ความต่างกระพี้-แก่น</Label>
                <FilterSelect
                  value={filters.sapwood_heartwood_color_diff || 'all'}
                  onValueChange={(v) => updateFilter('sapwood_heartwood_color_diff', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'สีกระพี้และสีแก่นไม้แตกต่างกันอย่างชัดเจน', label: 'แตกต่างชัดเจน' },
                    { value: 'สีกระพี้เหมือนหรือใกล้เคียงกับสีแก่นไม้', label: 'เหมือน/ใกล้เคียง' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">โฟลเอ็มในไม้</Label>
                <FilterSelect
                  value={filters.included_phloem || 'all'}
                  onValueChange={(v) => updateFilter('included_phloem', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'มี', label: 'มี' },
                    { value: 'ไม่มี', label: 'ไม่มี' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#14532D]">ท่อระหว่างเซลล์</Label>
                <FilterSelect
                  value={filters.intercellular_canals || 'all'}
                  onValueChange={(v) => updateFilter('intercellular_canals', v)}
                  placeholder="ทั้งหมด"
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'ท่อเรียงต่อกันเป็นเส้นยาว (Axial canals in long tangential lines)', label: 'เรียงเป็นเส้นยาว' },
                    { value: 'ท่อเรียงต่อกันเป็นเส้นสั้น ๆ (Axial canals in short tangential lines)', label: 'เรียงเป็นเส้นสั้น' },
                  ]}
                />
              </div>
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
        <Label className="text-sm font-semibold text-[#14532D]">ค้นหาชื่อพรรณไม้</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86A97A] w-4 h-4" />
          <input
            placeholder="ชื่อสามัญ / วิทยาศาสตร์"
            className="w-full h-11 pl-9 pr-4 rounded-[10px] border border-[#CDE3BD] text-sm focus:ring-2 focus:ring-[#4CA771]/20 outline-none transition-all"
            value={filters.name}
            onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
          />
        </div>
      </div>

      {/* 2. ถิ่นกำเนิด - อัปเดตให้ครบตาม AddTree */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-[#14532D] flex items-center gap-1"><MapPin size={12} /> ถิ่นกำเนิด (Distribution)</Label>
        <FilterSelect
          value={filters.region || 'all'}
          onValueChange={(v) => setFilters(f => ({ ...f, region: v === 'all' ? '' : v }))}
          placeholder="ทั้งหมด"
          options={[
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'Europe and temperate Asia', label: 'Europe & temperate Asia' },
            { value: 'Central South Asia', label: 'Central South Asia' },
            { value: 'Southeast Asia and the Pacific', label: 'Southeast Asia & Pacific' },
            { value: 'Australia and New Zealand', label: 'Australia & NZ' },
            { value: 'Tropical mainland Africa and adjacent islands', label: 'Tropical mainland Africa' },
            { value: 'Southern Africa', label: 'Southern Africa' },
            { value: 'North America, north of Mexico', label: 'North America' },
            { value: 'Neotropics and temperate Brazil', label: 'Neotropics & Brazil' },
            { value: 'Temperate South America including Argentina, Chile, Uruguay, and S. Paraguay', label: 'Temperate South America' },
          ]}
        />
      </div>

      {/* 3. สีแก่นไม้ - อัปเดตให้ครบตาม AddTree */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-[#14532D] flex items-center gap-1"><Palette size={12} /> สีของแก่นไม้ (Heartwood)</Label>
        <FilterSelect
          value={filters.color || 'all'}
          onValueChange={(v) => setFilters(f => ({ ...f, color: v === 'all' ? '' : v }))}
          placeholder="ทั้งหมด"
          options={[
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'สีน้ำตาลหรือโทนสีน้ำตาล (Brown or shades of brown)', label: 'สีน้ำตาล' },
            { value: 'สีแดงหรือโทนสีแดง (Red or shades of red)', label: 'สีแดง' },
            { value: 'สีเหลืองหรือโทนสีเหลือง (Yellow or shades of yellow)', label: 'สีเหลือง' },
            { value: 'สีขาวหรือเทา (White or Gray)', label: 'สีขาว/เทา' },
            { value: 'สีดำ (Black)', label: 'สีดำ' },
            { value: 'สีม่วง (Purple)', label: 'สีม่วง' },
            { value: 'สีส้ม (Orange)', label: 'สีส้ม' },
            { value: 'สีเขียว (Green)', label: 'สีเขียว' },
          ]}
        />
      </div>

      {/* 4. น้ำหนัก */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-[#14532D] flex items-center gap-1"><Ruler size={12} /> น้ำหนัก (Weight)</Label>
        <FilterSelect
          value={filters.weight || 'all'}
          onValueChange={(v) => setFilters(f => ({ ...f, weight: v === 'all' ? '' : v }))}
          placeholder="ทั้งหมด"
          options={[
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'LIGHT', label: 'ต่ำ (≤ 0.40)' },
            { value: 'MEDIUM', label: 'กลาง (0.40 - 0.75)' },
            { value: 'HEAVY', label: 'สูง (≥ 0.75)' },
          ]}
        />
      </div>

      {/* 5. กลิ่น */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-[#14532D] flex items-center gap-1"><Wind size={12} /> กลิ่น (Odor)</Label>
        <FilterSelect
          value={filters.scent || 'all'}
          onValueChange={(v) => setFilters(f => ({ ...f, scent: v === 'all' ? '' : v }))}
          placeholder="ทั้งหมด"
          options={[
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'มีกลิ่น', label: 'มีกลิ่น' },
            { value: 'ไม่มีกลิ่น', label: 'ไม่มีกลิ่น' },
          ]}
        />
      </div>

      {/* 6. วงเจริญเติบโต */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-[#14532D] flex items-center gap-1"><Layers size={12} /> วงเจริญเติบโต (Growth rings)</Label>
        <FilterSelect
          value={filters.growthRings || 'all'}
          onValueChange={(v) => setFilters(f => ({ ...f, growthRings: v === 'all' ? '' : v }))}
          placeholder="ทั้งหมด"
          options={[
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'มีเห็นได้อย่างชัดเจน', label: 'เห็นชัดเจน' },
            { value: 'ไม่มีหรือเห็นไม่ชัดเจน', label: 'ไม่ชัดเจน/ไม่มี' },
          ]}
        />
      </div>

      <Button
        onClick={onOpenMoreFilters}
        className="w-full h-11 rounded-xl text-[#14532D] border-[#CDE3BD] hover:bg-[#F6FBF6] hover:border-[#16A34A] flex items-center justify-between px-4 transition-all"
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
  const { data: session } = useSession(); // ดึง Session
  const [woods, setWoods] = useState<WoodFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WoodFromDB | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ตรวจสอบสิทธิ: ต้องเป็น ADMIN หรือ INSTRUCTOR เท่านั้นถึงจะจัดการได้
  const userRole = session?.user?.role?.toUpperCase();
  const canManage = userRole === "ADMIN";

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
  fetch('/api/woods')
    .then(res => res.json())
    .then(data => { 
      // ✅ ถ้า API ส่งมาเป็น { data: [...] } ต้องใช้ data.data
      // แต่ถ้าส่งมาเป็น [...] เลย ก็ใช้ data ได้เลย
      // เพื่อความชัวร์ ให้เช็คแบบนี้ครับ:
      if (Array.isArray(data)) {
        setWoods(data);
      } else {
        console.error("Data received is not an array:", data);
        setWoods([]); // ป้องกันพัง
      }
      setLoading(false); 
    })
    .catch(err => { 
      console.error("Error:", err); 
      setLoading(false); 
      setWoods([]); // ถ้า Error ให้เป็น Array ว่างไว้
    });
}, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !canManage) return; // เช็ค canManage เพิ่ม
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
    if (!canManage) return; // เช็ค canManage เพิ่ม
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
    if (!Array.isArray(woods)) return [];
    const result = woods.filter(wood => {
      // ✅ เพิ่มเงื่อนไข: ถ้าไม่ใช่ ADMIN/INSTRUCTOR และสถานะคือ HIDE จะถูกกรองออกทันที
      if (!canManage && wood.wood_status === 'HIDE') return false;

      if (filters.name && !(wood.common_name?.toLowerCase().includes(filters.name.toLowerCase()) ||
        wood.scientific_name?.toLowerCase().includes(filters.name.toLowerCase()))) return false;
      if (filters.region && wood.wood_origin !== filters.region) return false;
      if (filters.color && wood.wood_colors !== filters.color) return false;
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
      if (filters.vp_Pores_frequency && wood.vp_Pores_frequency !== filters.vp_Pores_frequency) return false;
      if (filters.vp_Pores_rays_ratio && wood.vp_Pores_rays_ratio !== filters.vp_Pores_rays_ratio) return false;
      if (filters.rays_width && wood.rays_width !== filters.rays_width) return false;
      if (filters.rays_two_distinct_sizes && wood.rays_two_distinct_sizes !== filters.rays_two_distinct_sizes) return false;
      if (filters.rays_storied_ripple_mark && wood.rays_storied_ripple_mark !== filters.rays_storied_ripple_mark) return false;
      if (filters.rays_per_mm && wood.rays_per_mm !== filters.rays_per_mm) return false;
      if (filters.rays_aggregate && wood.rays_aggregate !== filters.rays_aggregate) return false;
      if (filters.rays_deposit_in_rays && wood.rays_deposit_in_rays !== filters.rays_deposit_in_rays) return false;
      if (filters.ap_type && wood.ap_type !== filters.ap_type) return false;
      if (filters.ap_paratracheal && wood.ap_paratracheal !== filters.ap_paratracheal) return false;
      if (filters.ap_apotracheal && wood.ap_apotracheal !== filters.ap_apotracheal) return false;
      if (filters.ap_banded && wood.ap_banded !== filters.ap_banded) return false;
      if (filters.sapwood_heartwood_color_diff && wood.sapwood_heartwood_color_diff !== filters.sapwood_heartwood_color_diff) return false;
      if (filters.included_phloem && wood.included_phloem !== filters.included_phloem) return false;
      if (filters.intercellular_canals && wood.intercellular_canals !== filters.intercellular_canals) return false;
      if (filters.wood_taste && wood.wood_taste !== filters.wood_taste) return false;
      return true;
    });

    return result.sort((a, b) => {
      const nameA = a.common_name || "";
      const nameB = b.common_name || "";
      return nameA.localeCompare(nameB, 'th'); // รองรับการเรียงภาษาไทย (ก-ฮ)
    });
  }, [filters, woods, canManage]); // เพิ่ม canManage ใน dependency array

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((v) => v !== "").length;
  }, [filters]);

  const totalPages = Math.ceil(filteredWoods.length / itemsPerPage);
  const currentWoods = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return filteredWoods.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredWoods]);

  return (
    <div className="font-kanit">
      <main className="mx-auto max-w-6xl px-3 sm:px-4 pb-16 pt-6 sm:pt-10">
        <div className="mb-5 sm:mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#14532D]">ฐานข้อมูลพรรณไม้</h1>
            <p className="text-xs sm:text-sm text-[#6E8E59]">จัดการและสืบค้นข้อมูลโครงสร้างเนื้อไม้</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {canManage && (
              <Link
                href="/tree/addtree"
                className="inline-flex h-9 sm:h-10 items-center justify-center gap-2 rounded-xl bg-[#14532D] px-3 sm:px-4 text-xs sm:text-sm font-semibold text-white shadow-[0_10px_30px_-18px_rgba(20,83,45,0.65)] transition hover:bg-[#0F3F22] active:scale-[0.99]"
              >
                <Plus className="h-4 w-4" />
                เพิ่มข้อมูลใหม่
              </Link>
            )}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#CDE3BD] bg-white px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs text-[#14532D] shadow-[0_0_4px_0_#CAE0BC]/60">
              <span>ทั้งหมด {filteredWoods.length} รายการ</span>
            </div>
          </div>
        </div>

        {/* Mobile filter toggle */}
        <div className="mb-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="inline-flex w-full items-center justify-between gap-2 rounded-2xl border border-[#CDE3BD] bg-white px-4 py-3 text-sm font-medium text-[#14532D] shadow-sm transition hover:bg-[#F6FBF6]"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              ตัวกรอง
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#14532D] px-1.5 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <ChevronRight className={`h-4 w-4 text-[#86A97A] transition-transform duration-200 ${mobileFiltersOpen ? "rotate-90" : ""}`} />
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${mobileFiltersOpen ? "mt-3 max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
            <SidebarFilters
              filters={filters}
              setFilters={setFilters}
              onOpenMoreFilters={() => setIsMoreFiltersOpen(true)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 opacity-50">
                {[1, 2, 3].map(i => <div key={i} className="h-48 sm:h-64 bg-slate-100 animate-pulse rounded-2xl" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {currentWoods.map(wood => (
                    <WoodCard
                      key={wood.wood_id}
                      wood={wood}
                      onDelete={setDeleteTarget}
                      onToggleStatus={handleToggleStatus}
                      canManage={canManage}
                    />
                  ))}
                </div>

                {filteredWoods.length > itemsPerPage && (
                  <div className="mt-8 sm:mt-12 flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border-[#CDE3BD] hover:bg-[#F6FBF6] disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // On mobile, show limited page numbers
                        const showOnMobile = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                        const showEllipsis = !showOnMobile && (page === currentPage - 2 || page === currentPage + 2);

                        if (!showOnMobile && !showEllipsis && totalPages > 5) {
                          return null;
                        }
                        if (showEllipsis && totalPages > 5) {
                          return <span key={page} className="flex h-9 w-6 items-center justify-center text-xs text-[#6E8E59] sm:h-10 sm:w-8">...</span>;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`h-9 w-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all ${currentPage === page
                              ? 'bg-[#14532D] text-white shadow-md'
                              : 'bg-white text-[#6E8E59] border border-[#CDE3BD] hover:border-[#14532D] hover:text-[#14532D]'
                              }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border-[#CDE3BD] hover:bg-[#F6FBF6] disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {!loading && filteredWoods.length === 0 && (
              <div className="text-center py-12 sm:py-20 bg-white rounded-3xl border-2 border-dashed border-[#CDE3BD]">
                <Search className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-[#CDE3BD] mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-bold text-[#14532D]">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</h3>
                <p className="text-sm text-[#6E8E59]">ลองปรับเปลี่ยนตัวกรองหรือคำค้นหาของคุณอีกครั้ง</p>
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-80 flex-none">
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