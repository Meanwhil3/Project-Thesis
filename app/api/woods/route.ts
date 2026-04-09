import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ฟังก์ชันสำหรับแปลง BigInt เป็น String เพื่อให้ JSON.stringify ทำงานได้
function serializeBigInt(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export async function GET() {
  try {
    const woods = await prisma.wood.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        images: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // ใช้ฟังก์ชัน serializeBigInt ก่อนส่งข้อมูล
    return NextResponse.json(serializeBigInt(woods));
    
  } catch (error: any) {
    console.error("Fetch wood error:", error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}