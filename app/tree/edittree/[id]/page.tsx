"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Upload, X, Save, Microscope, 
  Info, Layers, Search, Image as ImageIcon,
  Ruler, ChevronRight, Loader2, ArrowLeft 
} from 'lucide-react';

export default function EditWoodPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // States
  const [wood, setWood] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedFiles, setSelectedFiles] = useState<{file: File, preview: string}[]>([]);

  // Fetch initial data
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
        file,
        preview: URL.createObjectURL(file)
      }));
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
    e.target.value = ''; // clear input
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const updatedImages = wood.images.filter((_: any, i: number) => i !== index);
      setWood({ ...wood, images: updatedImages });
    } else {
      const updatedFiles = selectedFiles.filter((_: any, i: number) => i !== index);
      URL.revokeObjectURL(selectedFiles[index].preview);
      setSelectedFiles(updatedFiles);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    
    // 1. Text Data
    Object.keys(wood).forEach(key => {
      if (key !== 'images' && key !== 'wood_id') {
        formData.append(key, wood[key] !== null && wood[key] !== undefined ? wood[key] : "");
      }
    });

    // 2. Existing Images (JSON)
    formData.append('existing_images', JSON.stringify(wood.images || []));

    // 3. New Files
    selectedFiles.forEach(fileObj => {
      formData.append('new_images', fileObj.file);
    });

    try {
      const res = await fetch(`/api/woods/${id}`, {
        method: 'PUT',
        body: formData, 
      });

      if (res.ok) {
        alert("บันทึกการแก้ไขสำเร็จ");
        selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
        router.push(`/tree/${id}`);
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.error || "ไม่สามารถบันทึกได้"}`);
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#14532D] font-medium animate-pulse">กำลังโหลดข้อมูล...</div>;
  if (!wood) return <div className="min-h-screen flex items-center justify-center text-slate-500">ไม่พบข้อมูลพันธุ์ไม้</div>;

  const menuItems = [
    { id: 'info', label: 'ข้อมูลพื้นฐาน', icon: <Info size={18} /> },
    { id: 'images', label: 'จัดการรูปภาพ', icon: <ImageIcon size={18} /> },
    { id: 'physical', label: 'ลักษณะกายภาพ', icon: <Ruler size={18} /> },
    { id: 'vessels', label: 'ลักษณะรู (Vessels)', icon: <Search size={18} /> },
    { id: 'rays-ap', label: 'รังสีและเนื้อเยื่อพื้น', icon: <Layers size={18} /> },
  ];

  return (
    <div className="bg-[#FBFBFB] min-h-screen w-full flex flex-col text-slate-900 font-kanit">
      <form onSubmit={handleSave} className="flex flex-col h-full">
        
        {/* Header */}
        <header className="flex-none bg-white border-b border-[#CDE3BD] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => router.back()}
                className="p-2 rounded-xl border border-[#CDE3BD] text-[#14532D] hover:bg-[#F6FBF6] transition active:scale-95"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#14532D]">แก้ไขข้อมูลพันธุ์ไม้</h1>
                <p className="text-xs text-[#6E8E59]">ID: {id} • {wood.common_name}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => router.back()}
                className="rounded-xl border-[#CDE3BD] text-[#14532D] hover:bg-[#F6FBF6] h-11"
              >
                ยกเลิก
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-[#14532D] hover:bg-[#0F3F22] text-white rounded-xl px-6 h-11 shadow-[0_10px_30px_-18px_rgba(20,83,45,0.65)] transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-72 flex-none">
              <nav className="space-y-1 bg-white p-3 rounded-2xl border border-[#CDE3BD] shadow-[0_0_4px_0_#CAE0BC]/50">
                <p className="px-4 py-2 text-[11px] font-bold text-[#6E8E59] uppercase tracking-[0.1em]">เมนูแก้ไข</p>
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id 
                      ? 'bg-[#DCFCE7]/70 text-[#14532D] ring-1 ring-[#86EFAC]' 
                      : 'text-slate-500 hover:bg-[#F6FBF6] hover:text-[#14532D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={activeTab === item.id ? 'text-[#16A34A]' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    {activeTab === item.id && <ChevronRight size={16} className="text-[#16A34A]" />}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Form Content */}
            <div className="flex-1 min-h-[600px]">
              
              {/* Tab: Info */}
              <div className={activeTab === 'info' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] shadow-[0_0_4px_0_#CAE0BC]/50 overflow-hidden">
                  <CardHeader className="bg-[#F6FBF6] border-b border-[#CDE3BD] py-4">
                    <CardTitle className="text-[#14532D] flex items-center gap-2 text-lg">
                      <Info className="w-5 h-5 text-[#16A34A]"/> ข้อมูลพื้นฐาน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[#14532D]">ชื่อวิทยาศาสตร์</Label>
                      <Input name="scientific_name" value={wood.scientific_name || ''} onChange={handleChange} className="rounded-xl border-[#CDE3BD]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#14532D]">ชื่อพื้นเมือง</Label>
                      <Input name="common_name" value={wood.common_name || ''} onChange={handleChange} className="rounded-xl border-[#CDE3BD]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#14532D]">ถิ่นกำเนิด</Label>
                      <Input name="wood_origin" value={wood.wood_origin || ''} onChange={handleChange} className="rounded-xl border-[#CDE3BD]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#14532D]">สถานะการแสดงผล</Label>
                      <Select 
                        value={wood.wood_status || 'SHOW'} 
                        onValueChange={(val) => handleSelectChange('wood_status', val)}
                      >
                        <SelectTrigger className="rounded-xl border-[#CDE3BD]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SHOW">SHOW (แสดงผล)</SelectItem>
                          <SelectItem value="HIDE">HIDE (ซ่อน)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-[#14532D]">คำอธิบาย</Label>
                      <Textarea 
                        name="wood_description" 
                        value={wood.wood_description || ''} 
                        onChange={handleChange}
                        rows={5} 
                        className="rounded-xl border-[#CDE3BD]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tab: Images */}
              <div className={activeTab === 'images' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] shadow-[0_0_4px_0_#CAE0BC]/50 overflow-hidden">
                  <CardHeader className="bg-[#F6FBF6] border-b border-[#CDE3BD] py-4">
                    <CardTitle className="text-[#14532D] flex items-center gap-2 text-lg">
                      <ImageIcon className="w-5 h-5 text-[#16A34A]"/> จัดการรูปภาพเนื้อไม้
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <label className="group border-2 border-dashed border-[#CDE3BD] rounded-2xl p-10 bg-[#FBFBFB] hover:bg-[#F6FBF6] hover:border-[#16A34A] cursor-pointer flex flex-col items-center transition-all mb-8">
                      <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" />
                      <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform border border-[#CDE3BD]">
                        <Upload className="text-[#16A34A]" size={28} />
                      </div>
                      <span className="mt-4 font-semibold text-[#14532D]">เพิ่มรูปภาพใหม่</span>
                    </label>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Existing Images */}
                      {wood.images?.map((img: any, i: number) => (
                        <div key={`old-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border border-[#CDE3BD] group">
                          <img src={img.image_url} className="w-full h-full object-cover" alt="existing" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              type="button" 
                              onClick={() => removeImage(i, true)}
                              className="bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform"
                            >
                              <X size={18}/>
                            </button>
                          </div>
                          <span className="absolute bottom-2 left-2 text-[10px] bg-white/80 px-2 py-0.5 rounded text-slate-600">รูปเดิม</span>
                        </div>
                      ))}

                      {/* New Previews */}
                      {selectedFiles.map((f, i) => (
                        <div key={`new-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-[#16A34A] group">
                          <img src={f.preview} className="w-full h-full object-cover" alt="new" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              type="button" 
                              onClick={() => removeImage(i, false)}
                              className="bg-red-500 text-white p-2 rounded-full"
                            >
                              <X size={18}/>
                            </button>
                          </div>
                          <span className="absolute bottom-2 left-2 text-[10px] bg-[#16A34A] text-white px-2 py-0.5 rounded">รูปใหม่</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tab: Physical */}
              <div className={activeTab === 'physical' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] border-l-4 border-l-[#16A34A] shadow-[0_0_4px_0_#CAE0BC]/50">
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[#14532D]">น้ำหนักเนื้อไม้ (Wood Weight)</Label>
                      <Select 
                        value={wood.wood_weight || 'MEDIUM'} 
                        onValueChange={(val) => handleSelectChange('wood_weight', val)}
                      >
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LIGHT">LIGHT (เบา)</SelectItem>
                          <SelectItem value="MEDIUM">MEDIUM (ปานกลาง)</SelectItem>
                          <SelectItem value="HEAVY">HEAVY (หนัก)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {['wood_taste', 'wood_odor', 'wood_Texture', 'wood_luster', 'wood_grain', 'wood_colors', 'sapwood_heartwood_color_diff', 'growth_rings', 'included_phloem', 'intercellular_canals'].map(field => (
                      <div key={field} className="space-y-2">
                        <Label className="text-[#14532D] capitalize">{field.replace(/_/g, ' ')}</Label>
                        <Input name={field} value={wood[field] || ''} onChange={handleChange} className="rounded-xl border-[#CDE3BD] h-11" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Tab: Vessels */}
              <div className={activeTab === 'vessels' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] border-l-4 border-l-amber-500 shadow-[0_0_4px_0_#CAE0BC]/50">
                  <CardHeader className="bg-amber-50/30 border-b border-[#CDE3BD]/50">
                    <CardTitle className="text-amber-800 flex items-center gap-2 text-lg">
                      <Microscope size={20} /> ลักษณะรู (Vessels)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['vp_porosity', 'vp_vessel_arrangement', 'vp_vessel_grouping', 'vp_inclusions_in_Pores', 'vp_Pores_frequency', 'vp_Pores_size'].map(field => (
                      <div key={field} className="space-y-2">
                        <Label className="text-[#14532D] capitalize">{field.replace('vp_', '').replace(/_/g, ' ')}</Label>
                        <Input name={field} value={wood[field] || ''} onChange={handleChange} className="rounded-xl border-[#CDE3BD] h-11" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Tab: Rays & AP */}
              <div className={activeTab === 'rays-ap' ? 'block' : 'hidden'}>
                <Card className="rounded-2xl border-[#CDE3BD] border-l-4 border-l-blue-500 shadow-[0_0_4px_0_#CAE0BC]/50">
                  <CardHeader className="bg-blue-50/30 border-b border-[#CDE3BD]/50">
                    <CardTitle className="text-blue-800 flex items-center gap-2 text-lg">
                      <Layers size={20} /> รังสีและเนื้อเยื่อพื้น
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[#14532D]">ความถี่รังสี (Rays per mm)</Label>
                      <Select 
                        value={wood.rays_per_mm || 'MEDIUM'} 
                        onValueChange={(val) => handleSelectChange('rays_per_mm', val)}
                      >
                        <SelectTrigger className="rounded-xl border-[#CDE3BD] h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">LOW (ต่ำ)</SelectItem>
                          <SelectItem value="MEDIUM">MEDIUM (กลาง)</SelectItem>
                          <SelectItem value="HIGH">HIGH (สูง)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {['rays_width', 'ap_type', 'ap_paratracheal', 'ap_apotracheal', 'ap_banded'].map(field => (
                      <div key={field} className="space-y-2">
                        <Label className="text-[#14532D] capitalize">{field.replace(/_/g, ' ')}</Label>
                        <Input name={field} value={wood[field] || ''} onChange={handleChange} className="rounded-xl border-[#CDE3BD] h-11" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="h-20" />
            </div>
          </div>
        </main>
      </form>
    </div>
  );
}