import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const woods = await prisma.wood.findMany({
      where: {
        deleted_at: null, // ดึงเฉพาะที่ยังไม่ถูกลบ
      },
      include: {
        images: true, // ดึงรูปภาพมาด้วย
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(woods);
  } catch (error) {
    console.error("Fetch wood error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}