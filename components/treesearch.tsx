"use client"
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  User,
  TreeDeciduous,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import woodTexture1 from '@/app/561621902_1332789158575088_4537468548849723627_n-removebg-preview.png';
import woodTexture2 from '@/app/561621902_1332789158575088_4537468548849723627_n-removebg-preview.png';
import woodTexture3 from '@/app/561621902_1332789158575088_4537468548849723627_n-removebg-preview.png';
import Navbar from "@/components/์Navbar";


interface WoodSpecies {
  id: number;
  thaiName: string;
  scientificName: string;
  image: string;
  weightCategory: '<= 0.40' | '0.40-0.75' | '> 0.75';
  densityValue: number;
  scent: 'มีกลิ่น' | 'ไม่มีกลิ่น';
  isCertified: 'เห็นชัดเจน' | 'เห็นไม่ชัดเจน';
  region: 'ภาคกลาง' | 'ภาคเหนือ' | 'ภาคใต้';
  texture?: string;
  durability?: string;
}

const MOCK_DATA: WoodSpecies[] = [
  { id: 1, thaiName: 'กะทังหัน', scientificName: 'Calophyllum thorelii Pierre', image: woodTexture1.src, weightCategory: '0.40-0.75', densityValue: 0.65, scent: 'ไม่มีกลิ่น', isCertified: 'เห็นไม่ชัดเจน', region: 'ภาคกลาง', texture: 'fine', durability: 'high' },
  { id: 2, thaiName: 'งิ้วป่า', scientificName: 'Bombax anceps Pierre', image: woodTexture2.src, weightCategory: '<= 0.40', densityValue: 0.38, scent: 'ไม่มีกลิ่น', isCertified: 'เห็นชัดเจน', region: 'ภาคใต้', texture: 'coarse', durability: 'low' },
  { id: 3, thaiName: 'สมอไทย', scientificName: 'Terminalia chebula Retz. var. chebula', image: woodTexture3.src, weightCategory: '> 0.75', densityValue: 0.81, scent: 'มีกลิ่น', isCertified: 'เห็นไม่ชัดเจน', region: 'ภาคเหนือ', texture: 'fine', durability: 'high' },
  { id: 4, thaiName: 'สมอไทย', scientificName: 'Terminalia chebula Retz. var. chebula', image: woodTexture3.src, weightCategory: '0.40-0.75', densityValue: 0.70, scent: 'ไม่มีกลิ่น', isCertified: 'เห็นไม่ชัดเจน', region: 'ภาคกลาง', texture: 'coarse', durability: 'medium' },
  { id: 5, thaiName: 'กะทังหัน', scientificName: 'Calophyllum thorelii Pierre', image: woodTexture1.src, weightCategory: '> 0.75', densityValue: 0.78, scent: 'มีกลิ่น', isCertified: 'เห็นไม่ชัดเจน', region: 'ภาคเหนือ', texture: 'fine', durability: 'high' },
  { id: 6, thaiName: 'งิ้วป่า', scientificName: 'Bombax anceps Pierre', image: woodTexture2.src, weightCategory: '<= 0.40', densityValue: 0.40, scent: 'ไม่มีกลิ่น', isCertified: 'เห็นชัดเจน', region: 'ภาคใต้', texture: 'coarse', durability: 'low' },
  { id: 7, thaiName: 'กะทังหัน', scientificName: 'Calophyllum thorelii Pierre', image: woodTexture1.src, weightCategory: '0.40-0.75', densityValue: 0.60, scent: 'ไม่มีกลิ่น', isCertified: 'เห็นไม่ชัดเจน', region: 'ภาคกลาง', texture: 'fine', durability: 'medium' },
  { id: 8, thaiName: 'สมอไทย', scientificName: 'Terminalia chebula Retz. var. chebula', image: woodTexture3.src, weightCategory: '0.40-0.75', densityValue: 0.72, scent: 'มีกลิ่น', isCertified: 'เห็นชัดเจน', region: 'ภาคใต้', texture: 'fine', durability: 'high' },
];

const WoodCard: React.FC<{ species: WoodSpecies }> = ({ species }) => (
  <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
    <div className="h-40 overflow-hidden">
      <img
        src={species.image}
        alt={`${species.thaiName} wood texture`}
        className="w-full h-full object-cover"
      />
    </div>

    <div className="p-4">
      <h3 className="text-base font-semibold text-foreground mb-1">{species.thaiName}</h3>
      <p className="text-xs text-muted-foreground italic truncate mb-3">{species.scientificName}</p>

      <div className="flex justify-center gap-4 pt-2 border-t border-border">
        <button className="text-destructive hover:text-destructive/80 transition-colors" aria-label="ลบ">
          <Trash2 className="h-4 w-4 text-[#DC2626]" />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="ดูรายละเอียด">
          <Eye className="w-4 h-4" />
        </button>
        <button className="text-primary hover:text-primary/80 transition-colors" aria-label="แก้ไข">
          <Edit className="w-4 h-4 text-[#16A34A]" />
        </button>
      </div>
    </div>
  </div>
);

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

interface MoreFiltersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  applyFilter: () => void;
}

const MoreFiltersDialog: React.FC<MoreFiltersDialogProps> = ({ isOpen, onClose, filters, setFilters, applyFilter }) => {
  if (!isOpen) return null;

  const handleApply = () => {
    applyFilter();
    onClose();
  };

  const handleReset = () => {
    setFilters(f => ({
      ...f,
      texture: '',
      durability: '',
    }));
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
                <SelectItem value="fine">ละเอียด</SelectItem>
                <SelectItem value="coarse">หยาบ</SelectItem>
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
                <SelectItem value="high">สูง</SelectItem>
                <SelectItem value="medium">ปานกลาง</SelectItem>
                <SelectItem value="low">ต่ำ</SelectItem>
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


const SidebarFilters: React.FC<{
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  applyFilter: () => void;
  onOpenMoreFilters: () => void; // ✅ เพิ่มที่ขาดไป
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
        <button onClick={handleReset} className="text-sm text-primary hover:text-primary/80 font-medium">
          ล้าง
        </button>
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
            <SelectItem value="golden">สีทอง</SelectItem>
            <SelectItem value="brown">สีน้ำตาล</SelectItem>
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
              className="h-4 w-4 text-[#14532D] border-input focus:ring-[#14532D] focus:ring-2"
            />
            <label htmlFor={`weight-${item.value}`} className="ml-3 text-sm text-foreground">
              {item.label}
            </label>
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
              className="h-4 w-4 text-[#14532D] border-input focus:ring-[#14532D] focus:ring-2"
            />
            <label htmlFor={`certifiedStatus-${item.value}`} className="ml-3 text-sm text-foreground">
              {item.label}
            </label>
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

const Treesearch: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  const applyFilter = () => {
    setAppliedFilters(filters);
  };

  const filteredSpecies = useMemo(() => {
    return MOCK_DATA.filter(species => {
      if (appliedFilters.name && !species.thaiName.toLowerCase().includes(appliedFilters.name.toLowerCase())) return false;
      if (appliedFilters.region && species.region !== appliedFilters.region) return false;
      if (appliedFilters.weight && species.weightCategory !== appliedFilters.weight) return false;
      if (appliedFilters.scent && species.scent !== appliedFilters.scent) return false;
      if (appliedFilters.certifiedStatus && species.isCertified !== appliedFilters.certifiedStatus) return false;
      if (appliedFilters.texture && species.texture !== appliedFilters.texture) return false;
      if (appliedFilters.durability && species.durability !== appliedFilters.durability) return false;

      return true;
    });
  }, [appliedFilters]);

  return (
    <div className="bg-white">
      <Navbar
        items={[
          { key: "overview", label: "ภาพรวม", href: "/users" },
          { key: "training", label: "อบรม", href: "/users/training" },
          { key: "species", label: "พันธุ์ไม้", href: "/tree/treesearch" },
          { key: "users", label: "ผู้ใช้งาน", href: "/users/manage" },
        ]}
        topOffsetClassName="top-16"
      />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">ข้อมูลพันธุ์ไม้</h1>
          <Button className="bg-[#14532D] hover:bg-[#14532D]/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> เพิ่มพันธุ์ไม้
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="mb-4 text-muted-foreground text-sm">
              แสดงผล {filteredSpecies.length} จาก {MOCK_DATA.length} รายการ
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpecies.map(species => (
                <WoodCard key={species.id} species={species} />
              ))}
              {filteredSpecies.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  ไม่พบพันธุ์ไม้ที่ตรงกับเงื่อนไขการค้นหา
                </div>
              )}
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