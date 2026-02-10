"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff, // เพิ่มไอคอนลูกตาปิด
  Edit,
  Trash2,
  X,
  AlertTriangle 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Navbar from "@/components/Navbar";
import Link from 'next/link';

// --- Types ---
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
  wood_Texture: string | null;
  wood_grain: string | null;
  wood_luster: string | null;
  growth_rings: string | null;
  vp_Pores_size: string | null;
  vp_vessel_grouping: string | null;
  wood_status: 'SHOW' | 'HIDE' | null; // เพิ่มสถานะ wood_status
  images: WoodImage[];
}

interface FilterState {
  name: string;
  region: string;
  color: string;
  weight: string;
  scent: string;
  certifiedStatus: string;
  texture: string;
  durability: string;
  grain: string;
  luster: string;
  poresSize: string;
  vesselGrouping: string;
}

const initialFilters: FilterState = {
  name: '',
  region: '',
  color: '',
  weight: '',
  scent: '',
  certifiedStatus: '',
  texture: '',
  durability: '',
  grain: '',
  luster: '',
  poresSize: '',
  vesselGrouping: '',
};

// --- Delete Confirmation Popup ---
const DeleteConfirmDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  woodName: string;
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

// --- WoodCard Component ---
const WoodCard: React.FC<{ 
  wood: WoodFromDB; 
  onDelete: (wood: WoodFromDB) => void;
  onToggleStatus: (wood: WoodFromDB) => void; // ฟังก์ชันสลับสถานะ
}> = ({ wood, onDelete, onToggleStatus }) => {
  const displayImage = wood.images && wood.images.length > 0
    ? wood.images[0].image_url
    : '/image/woods/default.jpg';

  const isHidden = wood.wood_status === 'HIDE';

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-all flex flex-col h-full ${isHidden ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      <Link href={`/tree/${wood.wood_id}`} className="group cursor-pointer relative">
        <div className="h-40 overflow-hidden bg-muted">
          <img
            src={displayImage}
            alt={wood.common_name || "wood texture"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image'; }}
          />
        </div>
        {isHidden && (
          <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-[10px] px-2 py-1 rounded">
            ปิดการแสดงผล
          </div>
        )}
        <div className="p-4 pb-2">
          <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-[#14532D] transition-colors">
            {wood.common_name || 'ไม่ทราบชื่อ'}
          </h3>
          <p className="text-xs text-muted-foreground italic truncate mb-3">
            {wood.scientific_name || 'N/A'}
          </p>
        </div>
      </Link>

      <div className="p-4 pt-0 mt-auto">
        <div className="flex justify-center gap-6 pt-3 border-t border-border">
          <button 
            onClick={() => onDelete(wood)} 
            className="text-destructive hover:scale-125 transition-transform"
            title="ลบข้อมูล"
          >
            <Trash2 className="h-4 w-4 text-[#DC2626]" />
          </button>
          
          {/* ปุ่มสลับสถานะ SHOW/HIDE */}
          <button 
            onClick={() => onToggleStatus(wood)} 
            className="text-muted-foreground hover:text-foreground hover:scale-125 transition-transform"
            title={isHidden ? "แสดงข้อมูล" : "ซ่อนข้อมูล"}
          >
            {isHidden ? (
              <EyeOff className="w-4 h-4 text-gray-400" />
            ) : (
              <Eye className="w-4 h-4 text-blue-600" />
            )}
          </button>

          <Link 
            href={`/tree/edittree/${wood.wood_id}`} 
            className="text-primary hover:text-primary/80 hover:scale-125 transition-transform"
            title="แก้ไขข้อมูล"
          >
            <Edit className="w-4 h-4 text-[#16A34A]" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- MoreFiltersDialog ---
const MoreFiltersDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}> = ({ isOpen, onClose, filters, setFilters }) => {
  if (!isOpen) return null;
  
  const handleReset = () => { 
    setFilters(f => ({ 
      ...f, 
      texture: '', 
      durability: '',
      grain: '',
      luster: '',
      poresSize: '',
      vesselGrouping: ''
    })); 
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center">
            <Filter className="w-5 h-5 mr-2" /> ตัวกรองเพิ่มเติม
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
          <div>
            <Label className="font-medium text-foreground mb-2 block">เนื้อไม้ (Texture)</Label>
            <Select
              value={filters.texture}
              onValueChange={(value) => setFilters(f => ({ ...f, texture: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกเนื้อไม้" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border shadow-lg">
                <SelectItem value="all">เลือกทั้งหมด</SelectItem>
                <SelectItem value="ละเอียด">ละเอียด</SelectItem>
                <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                <SelectItem value="หยาบ">หยาบ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-medium text-foreground mb-2 block">เสี้ยนไม้ (Grain)</Label>
            <Select
              value={filters.grain}
              onValueChange={(value) => setFilters(f => ({ ...f, grain: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกเสี้ยนไม้" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border shadow-lg">
                <SelectItem value="all">เลือกทั้งหมด</SelectItem>
                <SelectItem value="ตรง">เสี้ยนตรง</SelectItem>
                <SelectItem value="สน">เสี้ยนสน</SelectItem>
                <SelectItem value="บิด">เสี้ยนบิด</SelectItem>
                <SelectItem value="วน">เสี้ยนวน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-medium text-foreground mb-2 block">ความเงา (Luster)</Label>
            <Select
              value={filters.luster}
              onValueChange={(value) => setFilters(f => ({ ...f, luster: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกความเงา" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border shadow-lg">
                <SelectItem value="all">เลือกทั้งหมด</SelectItem>
                <SelectItem value="เป็นมันเงา">เป็นมันเงา</SelectItem>
                <SelectItem value="ไม่เป็นมันเงา">ไม่เป็นมันเงา</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-medium text-foreground mb-2 block">ขนาดรูพรุน (Pores Size)</Label>
            <Select
              value={filters.poresSize}
              onValueChange={(value) => setFilters(f => ({ ...f, poresSize: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกขนาด" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border shadow-lg">
                <SelectItem value="all">เลือกทั้งหมด</SelectItem>
                <SelectItem value="เล็ก">เล็ก</SelectItem>
                <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                <SelectItem value="ใหญ่">ใหญ่</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-medium text-foreground mb-2 block">การเรียงตัวท่อลำเลียง (Vessel Grouping)</Label>
            <Select
              value={filters.vesselGrouping}
              onValueChange={(value) => setFilters(f => ({ ...f, vesselGrouping: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกรูปแบบ" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border shadow-lg">
                <SelectItem value="all">เลือกทั้งหมด</SelectItem>
                <SelectItem value="ท่อเดี่ยว">ท่อเดี่ยว</SelectItem>
                <SelectItem value="ท่อกลุ่ม">ท่อกลุ่ม</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-medium text-foreground mb-2 block">ความทนทาน</Label>
            <Select
              value={filters.durability}
              onValueChange={(value) => setFilters(f => ({ ...f, durability: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="ระดับความทนทาน" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border shadow-lg">
                <SelectItem value="all">เลือกทั้งหมด</SelectItem>
                <SelectItem value="สูง">สูง</SelectItem>
                <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                <SelectItem value="ต่ำ">ต่ำ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button variant="link" onClick={handleReset} className="text-primary hover:text-primary/80">
            ล้างตัวกรองเพิ่มเติม
          </Button>
          <Button onClick={onClose} className="bg-[#14532D] hover:bg-[#14532D]/90 text-white px-8">
            เสร็จสิ้น
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- SidebarFilters ---
const SidebarFilters: React.FC<{
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenMoreFilters: () => void;
}> = ({ filters, setFilters, onOpenMoreFilters }) => {
  const handleReset = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="bg-white p-6 space-y-6 bg-card rounded-lg shadow-sm border border-border">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center text-foreground">
          <Filter className="w-5 h-5 mr-2" /> ตัวกรอง
        </h3>
        <button onClick={handleReset} className="text-sm text-primary hover:text-primary/80 font-medium">ล้าง</button>
      </div>
      <div>
        <Label htmlFor="search" className="font-medium text-foreground mb-2 block">ค้นหาชื่อพันธุ์ไม้</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            id="search"
            placeholder="พิมพ์เพื่อค้นหา..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filters.name}
            onChange={(e) => setFilters(f => ({ ...f, name: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <Label className="font-medium text-foreground mb-2 block">ถิ่นกำเนิด</Label>
        <Select
          value={filters.region}
          onValueChange={(value) => setFilters(f => ({ ...f, region: value === 'all' ? '' : value }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="เลือกถิ่นกำเนิด" />
          </SelectTrigger>
          <SelectContent className="bg-white border-border shadow-lg">
            <SelectItem value="all">เลือกทั้งหมด</SelectItem>
            <SelectItem value="ภาคกลาง">ภาคกลาง</SelectItem>
            <SelectItem value="ภาคเหนือ">ภาคเหนือ</SelectItem>
            <SelectItem value="ภาคใต้">ภาคใต้</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="font-medium text-foreground mb-2 block">สีของแก่นไม้</Label>
        <Select
          value={filters.color}
          onValueChange={(value) => setFilters(f => ({ ...f, color: value === 'all' ? '' : value }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="เลือกสีแท่นไม้" />
          </SelectTrigger>
          <SelectContent className="bg-white border-border shadow-lg">
            <SelectItem value="all">เลือกทั้งหมด</SelectItem>
            <SelectItem value="สีทอง">สีทอง</SelectItem>
            <SelectItem value="สีน้ำตาล">สีน้ำตาล</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <Label className="font-medium text-foreground block">น้ำหนัก</Label>
        {[
          { label: 'ต่ำ (<= 0.40)', value: '<= 0.40' },
          { label: 'กลาง (0.40-0.75)', value: '0.40-0.75' },
          { label: 'สูง (> 0.75)', value: '> 0.75' },
        ].map((item) => (
          <div key={item.value} className="flex items-center">
            <input
              type="radio"
              id={`weight-${item.value}`}
              name="weight"
              value={item.value}
              checked={filters.weight === item.value}
              onChange={() => setFilters(f => ({ ...f, weight: item.value }))}
              className="h-4 w-4 text-[#14532D]"
            />
            <label htmlFor={`weight-${item.value}`} className="ml-3 text-sm text-foreground">{item.label}</label>
          </div>
        ))}
      </div>
      <div>
        <Label className="font-medium text-foreground mb-2 block">กลิ่น</Label>
        <Select
          value={filters.scent}
          onValueChange={(value) => setFilters(f => ({ ...f, scent: value === 'all' ? '' : value }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="ไม่มีกลิ่น" />
          </SelectTrigger>
          <SelectContent className="bg-white border-border shadow-lg">
            <SelectItem value="มีกลิ่น">มีกลิ่น</SelectItem>
            <SelectItem value="ไม่มีกลิ่น">ไม่มีกลิ่น</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <Label className="font-medium text-foreground block">วงเจริญเติบโต</Label>
        {[
          { label: 'เห็นชัดเจน', value: 'เห็นชัดเจน' },
          { label: 'เห็นไม่ชัดเจน', value: 'เห็นไม่ชัดเจน' },
        ].map((item) => (
          <div key={item.value} className="flex items-center">
            <input
              type="radio"
              id={`certifiedStatus-${item.value}`}
              name="certifiedStatus"
              value={item.value}
              checked={filters.certifiedStatus === item.value}
              onChange={() => setFilters(f => ({ ...f, certifiedStatus: item.value }))}
              className="h-4 w-4 text-[#14532D]"
            />
            <label htmlFor={`certifiedStatus-${item.value}`} className="ml-3 text-sm text-foreground">{item.label}</label>
          </div>
        ))}
      </div>
      <Button
        onClick={onOpenMoreFilters}
        className="w-full text-sm font-medium text-primary border-primary hover:bg-primary hover:text-primary-foreground"
        variant="outline"
      >
        <Plus className="w-4 h-4 mr-2" /> เพิ่มตัวกรอง
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

  useEffect(() => {
    fetch('/api/woods')
      .then(res => res.json())
      .then(data => {
        setWoods(data);
        setLoading(false);
      })
      .catch(err => console.error("Error loading data:", err));
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/woods/${deleteTarget.wood_id}`, { method: 'DELETE' });
      if (res.ok) {
        setWoods(prev => prev.filter(w => w.wood_id !== deleteTarget.wood_id));
        setDeleteTarget(null);
      } else {
        alert("ลบไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsDeleting(false);
    }
  };

  // ฟังก์ชันสลับสถานะ SHOW/HIDE
  const handleToggleStatus = async (wood: WoodFromDB) => {
    const nextStatus = wood.wood_status === 'SHOW' ? 'HIDE' : 'SHOW';
    try {
      const res = await fetch(`/api/woods/${wood.wood_id}`, {
        method: 'PATCH', // หรือ PUT ขึ้นอยู่กับ API ของคุณ
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wood_status: nextStatus })
      });

      if (res.ok) {
        setWoods(prev => prev.map(w => 
          w.wood_id === wood.wood_id ? { ...w, wood_status: nextStatus } : w
        ));
      } else {
        alert("ไม่สามารถเปลี่ยนสถานะได้");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const filteredWoods = useMemo(() => {
    return woods.filter(wood => {
      if (filters.name && !wood.common_name?.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.region && wood.wood_origin !== filters.region) return false;
      if (filters.weight) {
        const map: any = { '<= 0.40': 'LIGHT', '0.40-0.75': 'MEDIUM', '> 0.75': 'HEAVY' };
        if (wood.wood_weight !== map[filters.weight]) return false;
      }
      if (filters.scent && wood.wood_odor !== filters.scent) return false;
      if (filters.certifiedStatus && wood.growth_rings !== filters.certifiedStatus) return false;
      
      if (filters.texture && wood.wood_Texture !== filters.texture) return false;
      if (filters.grain && wood.wood_grain !== filters.grain) return false;
      if (filters.luster && wood.wood_luster !== filters.luster) return false;
      if (filters.poresSize && wood.vp_Pores_size !== filters.poresSize) return false;
      if (filters.vesselGrouping && wood.vp_vessel_grouping !== filters.vesselGrouping) return false;

      return true;
    });
  }, [filters, woods]);

  return (
    <div className="bg-transparent min-h-screen">
      <Navbar
        items={[
          { key: "overview", label: "ภาพรวม", href: "/login" },
          { key: "training", label: "อบรม", href: "/admin/courses" },
          { key: "species", label: "พันธุ์ไม้", href: "/tree/treesearch" },
          { key: "users", label: "ผู้ใช้งาน", href: "/users" },
        ]}
        topOffsetClassName="top-16"
      />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">ข้อมูลพันธุ์ไม้</h1>
          <Link href="/tree/addtree">
            <Button className="bg-[#14532D] hover:bg-[#14532D]/90 text-white cursor-pointer">
              <Plus className="w-4 h-4 mr-2" /> เพิ่มพันธุ์ไม้
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="mb-4 text-muted-foreground text-sm">
              แสดงผล {loading ? '...' : filteredWoods.length} จาก {woods.length} รายการ
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWoods.map(wood => (
                <WoodCard 
                  key={wood.wood_id} 
                  wood={wood} 
                  onDelete={(w) => setDeleteTarget(w)} 
                  onToggleStatus={handleToggleStatus} // ส่งฟังก์ชันเข้าไปใน Card
                />
              ))}
            </div>
            {!loading && filteredWoods.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                ไม่พบข้อมูลที่ตรงกับตัวกรอง
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <SidebarFilters
              filters={filters}
              setFilters={setFilters}
              onOpenMoreFilters={() => setIsMoreFiltersOpen(true)}
            />
          </div>
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