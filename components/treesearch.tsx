
// "use client"
// import React, { useState, useMemo } from 'react';
// import { Button } from '@/components/ui/button';
// import { 
//   Plus, 
//   Search, 
//   Filter, 
//   Eye, 
//   Edit, 
//   Trash2, 
//   User,
//   TreeDeciduous
// } from 'lucide-react'; 
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import woodTexture1 from '@/app/561621902_1332789158575088_4537468548849723627_n-removebg-preview.png';
// import woodTexture2 from '@/app/561621902_1332789158575088_4537468548849723627_n-removebg-preview.png';
// import woodTexture3 from '@/app/561621902_1332789158575088_4537468548849723627_n-removebg-preview.png';

// interface WoodSpecies {
//   id: number;
//   thaiName: string;
//   scientificName: string;
//   image: string;
//   weightCategory: '<= 0.40' | '0.40-0.75' | '> 0.75';
//   densityValue: number;
//   scent: 'มีกลิ่น' | 'ไม่มีกลิ่น';
//   isCertified: 'เงา' | 'ไม่จัด' | 'หวง';
//   region: 'ภาคกลาง' | 'ภาคเหนือ' | 'ภาคใต้';
// }

// const MOCK_DATA: WoodSpecies[] = [
//   { id: 1, thaiName: 'กะทังหัน', scientificName: 'Calophyllum thorelii Pierre', image: woodTexture1.src, weightCategory: '0.40-0.75', densityValue: 0.65, scent: 'ไม่มีกลิ่น', isCertified: 'ไม่จัด', region: 'ภาคกลาง' },
//   { id: 2, thaiName: 'งิ้วป่า', scientificName: 'Bombax anceps Pierre', image: woodTexture2.src, weightCategory: '<= 0.40', densityValue: 0.38, scent: 'ไม่มีกลิ่น', isCertified: 'เงา', region: 'ภาคใต้' },
//   { id: 3, thaiName: 'สมอไทย', scientificName: 'Terminalia chebula Retz. var. chebula', image: woodTexture3.src, weightCategory: '> 0.75', densityValue: 0.81, scent: 'มีกลิ่น', isCertified: 'หวง', region: 'ภาคเหนือ' },
//   { id: 4, thaiName: 'สมอไทย', scientificName: 'Terminalia chebula Retz. var. chebula', image: woodTexture3.src, weightCategory: '0.40-0.75', densityValue: 0.70, scent: 'ไม่มีกลิ่น', isCertified: 'หวง', region: 'ภาคกลาง' },
//   { id: 5, thaiName: 'กะทังหัน', scientificName: 'Calophyllum thorelii Pierre', image: woodTexture1.src, weightCategory: '> 0.75', densityValue: 0.78, scent: 'มีกลิ่น', isCertified: 'ไม่จัด', region: 'ภาคเหนือ' },
//   { id: 6, thaiName: 'งิ้วป่า', scientificName: 'Bombax anceps Pierre', image: woodTexture2.src, weightCategory: '<= 0.40', densityValue: 0.40, scent: 'ไม่มีกลิ่น', isCertified: 'เงา', region: 'ภาคใต้' },
//   { id: 7, thaiName: 'กะทังหัน', scientificName: 'Calophyllum thorelii Pierre', image: woodTexture1.src, weightCategory: '0.40-0.75', densityValue: 0.60, scent: 'ไม่มีกลิ่น', isCertified: 'หวง', region: 'ภาคกลาง' },
//   { id: 8, thaiName: 'สมอไทย', scientificName: 'Terminalia chebula Retz. var. chebula', image: woodTexture3.src, weightCategory: '0.40-0.75', densityValue: 0.72, scent: 'มีกลิ่น', isCertified: 'เงา', region: 'ภาคใต้' },
//   { id: 9, thaiName: 'งิ้วป่า', scientificName: 'Bombax anceps Pierre', image: woodTexture2.src, weightCategory: '<= 0.40', densityValue: 0.35, scent: 'ไม่มีกลิ่น', isCertified: 'ไม่จัด', region: 'ภาคเหนือ' },
// ];

// const WoodCard: React.FC<{ species: WoodSpecies }> = ({ species }) => (
//   <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
//     <div className="h-40 overflow-hidden">
//       <img 
//         src={species.image} 
//         alt={`${species.thaiName} wood texture`}
//         className="w-full h-full object-cover"
//       />
//     </div>
    
//     <div className="p-4">
//       <h3 className="text-base font-semibold text-foreground mb-1">{species.thaiName}</h3>
//       <p className="text-xs text-muted-foreground italic truncate mb-3">{species.scientificName}</p>
      
//       <div className="flex justify-center gap-4 pt-2 border-t border-border">
//         <button className="text-destructive hover:text-destructive/80 transition-colors" aria-label="ลบ">
//           <Trash2 className="w-4 h-4" />
//         </button>
//         <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="ดูรายละเอียด">
//           <Eye className="w-4 h-4" />
//         </button>
//         <button className="text-primary hover:text-primary/80 transition-colors" aria-label="แก้ไข">
//           <Edit className="w-4 h-4" />
//         </button>
//       </div>
//     </div>
//   </div>
// );

// interface FilterState {
//   searchTerm: string;
//   region: string;
//   color: string;
//   weight: string;
//   scent: string;
//   certifiedStatus: string;
// }

// const initialFilters: FilterState = {
//   searchTerm: '',
//   region: '',
//   color: '',
//   weight: '',
//   scent: '',
//   certifiedStatus: '',
// };

// const SidebarFilters: React.FC<{ 
//   filters: FilterState; 
//   setFilters: React.Dispatch<React.SetStateAction<FilterState>>; 
//   applyFilter: () => void; 
// }> = ({ filters, setFilters, applyFilter }) => {
//   const handleReset = () => {
//     setFilters(initialFilters);
//   };

//   return (
//     <div className="p-6 space-y-6 bg-card rounded-lg shadow-sm border border-border">
//       <div className="flex justify-between items-center">
//         <h3 className="font-semibold text-lg flex items-center text-foreground">
//           <Filter className="w-5 h-5 mr-2" /> ตัวกรอง
//         </h3>
//         <button 
//           onClick={handleReset} 
//           className="text-sm text-primary hover:text-primary/80 font-medium"
//         >
//           ล้าง
//         </button>
//       </div>

//       <div>
//         <Label htmlFor="search" className="font-medium text-foreground mb-2 block">ค้นหาชื่อพันธุ์ไม้</Label>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//           <Input
//             id="search"
//             placeholder="ค้นหาชื่อพันธุ์ไม้"
//             className="pl-10"
//             value={filters.searchTerm}
//             onChange={(e) => setFilters(f => ({ ...f, searchTerm: e.target.value }))}
//           />
//         </div>
//       </div>

//       <div>
//         <Label className="font-medium text-foreground mb-2 block">สีหน้าตัด</Label>
//         <Select
//           value={filters.region}
//           onValueChange={(value) => setFilters(f => ({ ...f, region: value === 'all' ? '' : value }))}
//         >
//           <SelectTrigger className="w-full">
//             <SelectValue placeholder="เลือกทั้งหมด" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">เลือกทั้งหมด</SelectItem>
//             <SelectItem value="ภาคกลาง">ภาคกลาง</SelectItem>
//             <SelectItem value="ภาคเหนือ">ภาคเหนือ</SelectItem>
//             <SelectItem value="ภาคใต้">ภาคใต้</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       <div>
//         <Label className="font-medium text-foreground mb-2 block">สีของแท่นไม้</Label>
//         <Select
//           value={filters.color}
//           onValueChange={(value) => setFilters(f => ({ ...f, color: value === 'all' ? '' : value }))}
//         >
//           <SelectTrigger className="w-full">
//             <SelectValue placeholder="เลือกสีแท่นไม้" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">เลือกทั้งหมด</SelectItem>
//             <SelectItem value="golden">สีทอง</SelectItem>
//             <SelectItem value="brown">สีน้ำตาล</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="space-y-3">
//         <Label className="font-medium text-foreground block">น้ำหนัก</Label>
//         {[
//           { label: 'ต่ำ (<= 0.40)', value: '<= 0.40' },
//           { label: 'กลาง (0.40-0.75)', value: '0.40-0.75' },
//           { label: 'สูง (> 0.75)', value: '> 0.75' },
//         ].map((item) => (
//           <div key={item.value} className="flex items-center">
//             <input
//               type="radio"
//               id={`weight-${item.value}`}
//               name="weight"
//               value={item.value}
//               checked={filters.weight === item.value}
//               onChange={() => setFilters(f => ({ ...f, weight: item.value }))}
//               className="h-4 w-4 text-primary border-input focus:ring-primary focus:ring-2"
//             />
//             <label htmlFor={`weight-${item.value}`} className="ml-3 text-sm text-foreground">
//               {item.label}
//             </label>
//           </div>
//         ))}
//       </div>

//       <div>
//         <Label className="font-medium text-foreground mb-2 block">กลิ่น</Label>
//         <Select
//           value={filters.scent}
//           onValueChange={(value) => setFilters(f => ({ ...f, scent: value === 'all' ? '' : value }))}
//         >
//           <SelectTrigger className="w-full">
//             <SelectValue placeholder="ไม่มีกลิ่น" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">เลือกทั้งหมด</SelectItem>
//             <SelectItem value="มีกลิ่น">มีกลิ่น</SelectItem>
//             <SelectItem value="ไม่มีกลิ่น">ไม่มีกลิ่น</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="space-y-3">
//         <Label className="font-medium text-foreground block">วงจรเนตินโต</Label>
//         <div className="flex gap-2">
//           {[
//             { label: 'เงา', value: 'เงา' },
//             { label: 'ไม่จัด', value: 'ไม่จัด' },
//             { label: 'หวง', value: 'หวง' },
//           ].map((status) => (
//             <Button 
//               key={status.value}
//               variant={filters.certifiedStatus === status.value ? 'default' : 'outline'}
//               size="sm"
//               className="flex-1"
//               onClick={() => setFilters(f => ({ 
//                 ...f, 
//                 certifiedStatus: filters.certifiedStatus === status.value ? '' : status.value 
//               }))}
//             >
//               {status.label}
//             </Button>
//           ))}
//         </div>
//       </div>

//       <Button 
//         className="w-full text-sm font-medium text-primary border-primary hover:bg-primary hover:text-primary-foreground"
//         variant="outline"
//       >
//         <Plus className="w-4 h-4 mr-2" /> เพิ่มตัวกรอง
//       </Button>

//       <Button 
//         onClick={applyFilter} 
//         className="w-full bg-primary hover:bg-primary/90"
//       >
//         <Search className="w-4 h-4 mr-2" /> ค้นหา
//       </Button>
//     </div>
//   );
// };

// const Treesearch: React.FC = () => {
//   const [filters, setFilters] = useState<FilterState>(initialFilters);
//   const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);

//   const applyFilter = () => {
//     setAppliedFilters(filters);
//   };

//   const filteredSpecies = useMemo(() => {
//     return MOCK_DATA.filter(species => {
//       if (appliedFilters.searchTerm && !species.thaiName.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase())) {
//         return false;
//       }
//       if (appliedFilters.region && species.region !== appliedFilters.region) {
//         return false;
//       }
//       if (appliedFilters.weight && species.weightCategory !== appliedFilters.weight) {
//         return false;
//       }
//       if (appliedFilters.scent && species.scent !== appliedFilters.scent) {
//         return false;
//       }
//       if (appliedFilters.certifiedStatus && species.isCertified !== appliedFilters.certifiedStatus) {
//         return false;
//       }
//       return true;
//     });
//   }, [appliedFilters]);

//   const navItems = ['ภาพรวม', 'อบรม', 'พันธุ์ไม้', 'ผู้ใช้งาน'];

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
      
      
//       <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-foreground">ข้อมูลพันธุ์ไม้</h1>
//           <Button className="bg-primary hover:bg-primary/90">
//             <Plus className="w-4 h-4 mr-2" /> เพิ่มพันธุ์ไม้
//           </Button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
//           <div className="lg:col-span-3">
//             <div className="mb-4">
//               <span className="text-muted-foreground text-sm">
//                 แสดงผล {filteredSpecies.length} จาก {MOCK_DATA.length} รายการ
//               </span>
//             </div>
            
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredSpecies.map(species => (
//                 <WoodCard key={species.id} species={species} />
//               ))}
              
//               {filteredSpecies.length === 0 && (
//                 <div className="col-span-full text-center py-12">
//                   <p className="text-muted-foreground">ไม่พบพันธุ์ไม้ที่ตรงกับเงื่อนไขการค้นหา</p>
//                 </div>
//               )}
//             </div>
//           </div>
          
          
//           <div className="lg:col-span-1">
//             <SidebarFilters filters={filters} setFilters={setFilters} applyFilter={applyFilter} />
//           </div>
//         </div>
//       </main>

//     </div>
//   );
// };

// export default Treesearch;

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
  TreeDeciduous
} from 'lucide-react'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import woodTexture1 from '@/app/561621902_1332789158575088_4537468548849723627_n-removebg-preview.png';
import woodTexture2 from '@/app/561621902_1332789158575088_4537468548849723627_n-removebg-preview.png';
import woodTexture3 from '@/app/561621902_1332789158575088_4537468548849723627_n-removebg-preview.png';

interface WoodSpecies {
  id: number;
  thaiName: string;
  scientificName: string;
  image: string;
  weightCategory: '<= 0.40' | '0.40-0.75' | '> 0.75';
  densityValue: number;
  scent: 'มีกลิ่น' | 'ไม่มีกลิ่น';
  isCertified: 'เงา' | 'ไม่จัด' | 'หวง';
  region: 'ภาคกลาง' | 'ภาคเหนือ' | 'ภาคใต้';
}

const MOCK_DATA: WoodSpecies[] = [
  { id: 1, thaiName: 'กะทังหัน', scientificName: 'Calophyllum thorelii Pierre', image: woodTexture1.src, weightCategory: '0.40-0.75', densityValue: 0.65, scent: 'ไม่มีกลิ่น', isCertified: 'ไม่จัด', region: 'ภาคกลาง' },
  { id: 2, thaiName: 'งิ้วป่า', scientificName: 'Bombax anceps Pierre', image: woodTexture2.src, weightCategory: '<= 0.40', densityValue: 0.38, scent: 'ไม่มีกลิ่น', isCertified: 'เงา', region: 'ภาคใต้' },
  { id: 3, thaiName: 'สมอไทย', scientificName: 'Terminalia chebula Retz. var. chebula', image: woodTexture3.src, weightCategory: '> 0.75', densityValue: 0.81, scent: 'มีกลิ่น', isCertified: 'หวง', region: 'ภาคเหนือ' },
  { id: 4, thaiName: 'สมอไทย', scientificName: 'Terminalia chebula Retz. var. chebula', image: woodTexture3.src, weightCategory: '0.40-0.75', densityValue: 0.70, scent: 'ไม่มีกลิ่น', isCertified: 'หวง', region: 'ภาคกลาง' },
  { id: 5, thaiName: 'กะทังหัน', scientificName: 'Calophyllum thorelii Pierre', image: woodTexture1.src, weightCategory: '> 0.75', densityValue: 0.78, scent: 'มีกลิ่น', isCertified: 'ไม่จัด', region: 'ภาคเหนือ' },
  { id: 6, thaiName: 'งิ้วป่า', scientificName: 'Bombax anceps Pierre', image: woodTexture2.src, weightCategory: '<= 0.40', densityValue: 0.40, scent: 'ไม่มีกลิ่น', isCertified: 'เงา', region: 'ภาคใต้' },
  { id: 7, thaiName: 'กะทังหัน', scientificName: 'Calophyllum thorelii Pierre', image: woodTexture1.src, weightCategory: '0.40-0.75', densityValue: 0.60, scent: 'ไม่มีกลิ่น', isCertified: 'หวง', region: 'ภาคกลาง' },
  { id: 8, thaiName: 'สมอไทย', scientificName: 'Terminalia chebula Retz. var. chebula', image: woodTexture3.src, weightCategory: '0.40-0.75', densityValue: 0.72, scent: 'มีกลิ่น', isCertified: 'เงา', region: 'ภาคใต้' },
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
          <Trash2 className="w-4 h-4" />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="ดูรายละเอียด">
          <Eye className="w-4 h-4" />
        </button>
        <button className="text-primary hover:text-primary/80 transition-colors" aria-label="แก้ไข">
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

interface FilterState {
  searchTerm: string;
  region: string;
  color: string;
  weight: string;
  scent: string;
  certifiedStatus: string;
}

const initialFilters: FilterState = {
  searchTerm: '',
  region: '',
  color: '',
  weight: '',
  scent: '',
  certifiedStatus: '',
};

const SidebarFilters: React.FC<{ 
  filters: FilterState; 
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>; 
  applyFilter: () => void; 
}> = ({ filters, setFilters, applyFilter }) => {
  const handleReset = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="p-6 space-y-6 bg-card rounded-lg shadow-sm border border-border">
      <div className="flex justify-between items-center">
        {/* เปลี่ยนข้อความเป็น 'ตัวกรอง' ตามภาพ */}
        <h3 className="font-semibold text-lg flex items-center text-foreground">
          <Filter className="w-5 h-5 mr-2" /> ตัวกรอง
        </h3>
        {/* เปลี่ยนข้อความเป็น 'ล้าง' ตามภาพ */}
        <button 
          onClick={handleReset} 
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
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
            value={filters.searchTerm}
            onChange={(e) => setFilters(f => ({ ...f, searchTerm: e.target.value }))}
          />
        </div>
      </div>

      <div>
        {/* เปลี่ยน Label เป็น 'สีหน้าตัด' เพื่อให้ตรงกับตัวกรอง region (ซึ่งใน UI น่าจะหมายถึงสี) */}
        <Label className="font-medium text-foreground mb-2 block">สีหน้าตัด</Label>
        <Select
          value={filters.region}
          onValueChange={(value) => setFilters(f => ({ ...f, region: value === 'all' ? '' : value }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="เลือกสีหน้าตัด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">เลือกทั้งหมด</SelectItem>
            <SelectItem value="ภาคกลาง">ภาคกลาง</SelectItem>
            <SelectItem value="ภาคเหนือ">ภาคเหนือ</SelectItem>
            <SelectItem value="ภาคใต้">ภาคใต้</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="font-medium text-foreground mb-2 block">สีของแท่นไม้</Label>
        <Select
          value={filters.color}
          onValueChange={(value) => setFilters(f => ({ ...f, color: value === 'all' ? '' : value }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="เลือกสีแท่นไม้" />
          </SelectTrigger>
          <SelectContent>
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
              // ปรับสีให้ใกล้เคียงโทนสีเขียว-น้ำตาลของธีม
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
            <SelectValue placeholder="เลือกทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">เลือกทั้งหมด</SelectItem>
            <SelectItem value="มีกลิ่น">มีกลิ่น</SelectItem>
            <SelectItem value="ไม่มีกลิ่น">ไม่มีกลิ่น</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {/* เปลี่ยน Label เป็น 'วงจรเนตินโต' ตามภาพ */}
        <Label className="font-medium text-foreground block">วงจรเนตินโต</Label>
        <div className="flex gap-2">
          {[
            { label: 'เงา', value: 'เงา' },
            { label: 'ไม่จัด', value: 'ไม่จัด' },
            { label: 'หวง', value: 'หวง' },
          ].map((status) => (
            <Button 
              key={status.value}
              variant={filters.certifiedStatus === status.value ? 'default' : 'outline'}
              size="sm"
              className={`flex-1 ${filters.certifiedStatus === status.value 
                  ? 'bg-[#14532D] hover:bg-[#14532D]/90 text-white' 
                  : 'border-border text-foreground hover:bg-muted/50'}`}
              onClick={() => setFilters(f => ({ 
                ...f, 
                certifiedStatus: filters.certifiedStatus === status.value ? '' : status.value 
              }))}
            >
              {status.label}
            </Button>
          ))}
        </div>
      </div>

      <Button 
        className="w-full text-sm font-medium text-primary border-primary hover:bg-primary hover:text-primary-foreground"
        variant="outline"
      >
        <Plus className="w-4 h-4 mr-2" /> เพิ่มตัวกรอง
      </Button>

      {/* ปรับสีปุ่มค้นหาให้เป็นสีเขียวหลัก (Primary Color) */}
      <Button 
        onClick={applyFilter} 
        className="w-full bg-[#14532D] hover:bg-[#14532D]/90 text-white"
      >
        <Search className="w-4 h-4 mr-2" /> ค้นหา
      </Button>
    </div>
  );
};

const Treesearch: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);

  const applyFilter = () => {
    setAppliedFilters(filters);
  };

  const filteredSpecies = useMemo(() => {
    return MOCK_DATA.filter(species => {
      if (appliedFilters.searchTerm && !species.thaiName.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase())) {
        return false;
      }
      if (appliedFilters.region && species.region !== appliedFilters.region) {
        return false;
      }
      if (appliedFilters.weight && species.weightCategory !== appliedFilters.weight) {
        return false;
      }
      if (appliedFilters.scent && species.scent !== appliedFilters.scent) {
        return false;
      }
      if (appliedFilters.certifiedStatus && species.isCertified !== appliedFilters.certifiedStatus) {
        return false;
      }
      return true;
    });
  }, [appliedFilters]);

  const navItems = ['ภาพรวม', 'อบรม', 'พันธุ์ไม้', 'ผู้ใช้งาน'];

  return (
    // ลบ class ที่จัดการ layout หลักออก แล้วห่อด้วย div ธรรมดา
    <div className="bg-white">
      
      {/* 🛑 เพิ่ม Sub-Navigation Bar 🛑 */}
      <nav className="bg-white border-b border-emerald-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <a
                key={item}
                href="#" 
                className={`py-3 px-4 text-sm font-medium transition-colors ${
                  item === 'พันธุ์ไม้'
                    ? 'border-b-2 border-[#14532D] text-[#14532D]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </nav>
      
      {/* ปรับปรุง main ให้เป็นเพียงเนื้อหาหลัก */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">ข้อมูลพันธุ์ไม้</h1>
          {/* ปรับสีปุ่ม 'เพิ่มพันธุ์ไม้' ให้เป็นสีเขียวหลัก */}
          <Button className="bg-[#14532D] hover:bg-[#14532D]/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> เพิ่มพันธุ์ไม้
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-3">
            <div className="mb-4">
              <span className="text-muted-foreground text-sm">
                แสดงผล {filteredSpecies.length} จาก {MOCK_DATA.length} รายการ
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpecies.map(species => (
                <WoodCard key={species.id} species={species} />
              ))}
              
              {filteredSpecies.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">ไม่พบพันธุ์ไม้ที่ตรงกับเงื่อนไขการค้นหา</p>
                </div>
              )}
            </div>
          </div>
          
          
          <div className="lg:col-span-1">
            <SidebarFilters filters={filters} setFilters={setFilters} applyFilter={applyFilter} />
          </div>
        </div>
      </main>

    </div>
  );
};

export default Treesearch;