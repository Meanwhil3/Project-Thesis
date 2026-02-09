"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from "@/components/Navbar";
import Link from 'next/link';

// --- Types สำหรับข้อมูลจาก DB ---
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
  growth_rings: string | null;
  // เปลี่ยนจาก image: string เป็น images array
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
};

// --- WoodCard Component ---
const WoodCard: React.FC<{ wood: WoodFromDB }> = ({ wood }) => {
  // ดึง URL รูปภาพจาก Array images ตัวแรก
  // ถ้าไม่มีรูปใน Array หรือไม่มีก้อน images เลย ให้ใช้รูป default
  const displayImage = wood.images && wood.images.length > 0
    ? wood.images[0].image_url
    : '/image/woods/default.jpg';

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 overflow-hidden bg-muted">
        <img
          src={displayImage}
          alt={wood.common_name || "wood texture"}
          className="w-full h-full object-cover"
          // ป้องกันรูปแตกด้วยการใส่ placeholder หากหาไฟล์ local ไม่เจอ
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-foreground mb-1">
          {wood.common_name || 'ไม่ทราบชื่อ'}
        </h3>
        <p className="text-xs text-muted-foreground italic truncate mb-3">
          {wood.scientific_name || 'N/A'}
        </p>

        <div className="flex justify-center gap-4 pt-2 border-t border-border">
          <button className="text-destructive hover:text-destructive/80 transition-colors">
            <Trash2 className="h-4 w-4 text-[#DC2626]" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-primary hover:text-primary/80 transition-colors">
            <Edit className="w-4 h-4 text-[#16A34A]" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MoreFiltersDialog (อันเดิมของคุณ) ---
const MoreFiltersDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  applyFilter: () => void;
}> = ({ isOpen, onClose, filters, setFilters, applyFilter }) => {
  if (!isOpen) return null;
  const handleApply = () => { applyFilter(); onClose(); };
  const handleReset = () => {
    setFilters(f => ({ ...f, texture: '', durability: '' }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
            <Label className="font-medium text-foreground mb-2 block">เนื้อไม้</Label>
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
                <SelectItem value="หยาบ">หยาบ</SelectItem>
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
          <Button onClick={handleApply} className="bg-[#14532D] hover:bg-[#14532D]/90 text-white">
            <Search className="w-4 h-4 mr-2" /> ใช้ตัวกรอง
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- SidebarFilters (อันเดิมของคุณ) ---
const SidebarFilters: React.FC<{
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  applyFilter: () => void;
  onOpenMoreFilters: () => void;
}> = ({ filters, setFilters, applyFilter, onOpenMoreFilters }) => {
  const handleReset = () => {
    setFilters(initialFilters);
    applyFilter();
  };

  return (
    <div className="p-6 space-y-6 bg-card rounded-lg shadow-sm border border-border">
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
          <Input
            id="search"
            placeholder="ค้นหาชื่อพันธุ์ไม้"
            className="pl-10"
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
      <Button onClick={applyFilter} className="w-full bg-[#14532D] hover:bg-[#14532D]/90 text-white">
        <Search className="w-4 h-4 mr-2" /> ค้นหา
      </Button>
    </div>
  );
};

// --- Main Page (Treesearch) ---
const Treesearch: React.FC = () => {
  const [woods, setWoods] = useState<WoodFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  useEffect(() => {
    fetch('/api/woods')
      .then(res => res.json())
      .then(data => {
        setWoods(data);
        setLoading(false);
      })
      .catch(err => console.error("Error loading data:", err));
  }, []);

  const applyFilter = () => setAppliedFilters(filters);

  const filteredWoods = useMemo(() => {
    return woods.filter(wood => {
      if (appliedFilters.name && !wood.common_name?.toLowerCase().includes(appliedFilters.name.toLowerCase())) return false;
      if (appliedFilters.region && wood.wood_origin !== appliedFilters.region) return false;
      if (appliedFilters.weight) {
        const map: any = { '<= 0.40': 'LIGHT', '0.40-0.75': 'MEDIUM', '> 0.75': 'HEAVY' };
        if (wood.wood_weight !== map[appliedFilters.weight]) return false;
      }
      if (appliedFilters.scent && wood.wood_odor !== appliedFilters.scent) return false;
      if (appliedFilters.certifiedStatus && wood.growth_rings !== appliedFilters.certifiedStatus) return false;
      if (appliedFilters.texture && wood.wood_Texture !== appliedFilters.texture) return false;
      return true;
    });
  }, [appliedFilters, woods]);

  return (
    <div className="bg-white min-h-screen">
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

          {/* เปลี่ยนจาก <Button> เฉยๆ เป็นการใช้ <Link> ครอบ */}
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
                <WoodCard key={wood.wood_id} wood={wood} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <SidebarFilters
              filters={filters}
              setFilters={setFilters}
              applyFilter={applyFilter}
              onOpenMoreFilters={() => setIsMoreFiltersOpen(true)}
            />
          </div>
        </div>
      </main>
      <MoreFiltersDialog
        isOpen={isMoreFiltersOpen}
        onClose={() => setIsMoreFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
        applyFilter={applyFilter}
      />
    </div>
  );
};

export default Treesearch;