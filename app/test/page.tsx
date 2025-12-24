// app/users/page.tsx
import prisma from "@/lib/prisma";

export default async function UsersPage() {
  // 1. ดึงข้อมูลแบบมี Error Handling เบื้องต้น
  let users = [];
  try {
    users = await prisma.user.findMany({
      include: {
        role: true, // Join กับตาราง Role
      },
      orderBy: {
        // หากใน DB ยังไม่มีข้อมูล created_at ให้ลบบรรทัดนี้ออกก่อนเพื่อทดสอบ
        created_at: 'desc', 
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return <div className="p-8 text-red-500">เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล</div>;
  }

  // 2. ตรวจสอบว่ามีข้อมูลไหม
  if (users.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">รายชื่อผู้ใช้งานระบบ</h1>
        <p className="text-gray-500">ยังไม่มีข้อมูลผู้ใช้งานในระบบ (กรุณารัน npx prisma db seed)</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">รายชื่อผู้ใช้งานระบบ</h1>
        <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
          ทั้งหมด {users.length} รายการ
        </span>
      </div>
      
      <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ชื่อ-นามสกุล</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">อีเมล</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">บทบาท</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.user_id.toString()} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role?.name === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role?.name || 'ทั่วไป'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {user.is_active ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span> ใช้งานอยู่
                    </span>
                  ) : (
                    <span className="text-gray-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-300 rounded-full"></span> ระงับ
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}