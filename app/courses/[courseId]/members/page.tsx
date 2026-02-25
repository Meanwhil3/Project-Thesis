import { Search, Download, Ban, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function CourseMembersPage() {
  // ข้อมูลจำลอง (Mock Data)
  const members = [
    { name: "นายอังคาร ลานวัด", email: "tuesdaytemple@gmail.com", score: "80 / 80" },
    { name: "นางสวัสดี วันจันทร์", email: "helloMonday@gmail.com", score: "80 / 80" },
    { name: "นายคืนพุธ มุดผ้าห่ม", email: "wednesinblank@gmail.com", score: "80 / 80" },
    { name: "นางพฤหัส สีส้ม", email: "thuorange@gmail.com", score: "80 / 80" },
    { name: "นายศุกร์ มนุษย์ต่างดาว", email: "alienfriday@gmail.com", score: "80 / 80" },
  ];

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm font-kanit border border-[#CAE0BC]/30">
      
      {/* Header Section */}
      <div className="flex items-center gap-2 mb-6 text-[#14532D]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <h1 className="text-xl font-semibold">จัดการสมาชิก</h1>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="ค้นหาด้วยชื่อ" 
            className="w-full pl-10 pr-4 py-2 border border-[#CAE0BC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
          />
        </div>
        
        <div className="flex gap-3">
          <select className="border border-[#CAE0BC] rounded-lg px-4 py-2 bg-white text-sm focus:outline-none">
            <option>เรียงตามคะแนน</option>
          </select>
          <button className="flex items-center gap-2 bg-[#22C55E] text-white px-4 py-2 rounded-lg hover:bg-[#16a34a] transition-colors text-sm">
            <Download className="w-4 h-4" />
            บันทึกเป็น CSV
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-[#F3F4F6] text-left">
              <th className="p-4 rounded-l-lg font-medium text-gray-700">ชื่อ</th>
              <th className="p-4 font-medium text-gray-700">อีเมล</th>
              <th className="p-4 font-medium text-gray-700 text-center">คะแนนรวม</th>
              <th className="p-4 rounded-r-lg font-medium text-gray-700 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={index} className="border border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 flex items-center gap-3 border-y border-l rounded-l-lg border-gray-100">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-700">{member.name}</span>
                </td>
                <td className="p-4 border-y border-gray-100">
                  <span className="text-[#22C55E] underline cursor-pointer">{member.email}</span>
                </td>
                <td className="p-4 border-y text-center text-gray-600 border-gray-100">
                  {member.score}
                </td>
                <td className="p-4 border-y border-r rounded-r-lg border-gray-100 text-center">
                  <div className="flex justify-center gap-3">
                    <button className="text-orange-400 hover:text-orange-600"><Ban className="w-5 h-5" /></button>
                    <button className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><ChevronLeft className="w-4 h-4 text-gray-400" /></button>
        <button className="px-3 py-1 bg-[#E8F5E9] text-[#22C55E] rounded-md font-medium">1</button>
        <button className="px-3 py-1 hover:bg-gray-100 rounded-md">2</button>
        <span className="px-2">...</span>
        <button className="px-3 py-1 hover:bg-gray-100 rounded-md">9</button>
        <button className="px-3 py-1 hover:bg-gray-100 rounded-md">10</button>
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><ChevronRight className="w-4 h-4 text-gray-400" /></button>
      </div>

    </div>
  );
}