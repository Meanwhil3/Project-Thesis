import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth"; // เพิ่มการดึง Session
import { authOptions } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. ตรวจสอบ Session และสิทธิ์ในฝั่ง Server
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = String((session.user as any).role ?? "").toUpperCase();
    if (role !== "ADMIN" && role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden: No permission" }, { status: 403 });
    }

    const formData = await req.formData();
    const commonName = formData.get('common_name') as string;

    if (!commonName) {
      return NextResponse.json({ error: "Common name is required" }, { status: 400 });
    }

    // 2. ดึงค่า ID ผู้ใช้งานจาก Session เพื่อความปลอดภัย
    const user = session.user as any;
    const userId = user.id || user.user_id || user.sub;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    const data: any = {
      common_name: commonName,
      scientific_name: formData.get('scientific_name') as string,
      wood_origin: formData.get('wood_origin') as string,
      wood_description: formData.get('wood_description') as string,
      wood_status: (formData.get('wood_status') as any) || 'SHOW',
      
      // ✅ ใช้ relation 'author' เชื่อมต่อกับ User ID จาก Session โดยตรง
      author: {
        connect: { user_id: BigInt(userId) }
      },
      
      wood_taste: formData.get('wood_taste') as string,
      wood_odor: formData.get('wood_odor') as string,
      wood_texture: formData.get('wood_texture') as string, 
      wood_luster: formData.get('wood_luster') as string,
      wood_grain: formData.get('wood_grain') as string,
      wood_weight: (formData.get('wood_weight') as any),
      wood_colors: formData.get('wood_colors') as string,
      sapwood_heartwood_color_diff: formData.get('sapwood_heartwood_color_diff') as string,
      growth_rings: formData.get('growth_rings') as string,
      included_phloem: formData.get('included_phloem') as string,
      intercellular_canals: formData.get('intercellular_canals') as string,
      vp_porosity: formData.get('vp_porosity') as string,
      vp_vessel_grouping: formData.get('vp_vessel_grouping') as string,
      vp_vessel_arrangement: formData.get('vp_vessel_arrangement') as string,
      vp_inclusions_in_Pores: formData.get('vp_inclusions_in_Pores') as string,
      vp_Pores_frequency: formData.get('vp_Pores_frequency') as string,
      vp_Pores_size: formData.get('vp_Pores_size') as string,
      vp_Pores_rays_ratio: formData.get('vp_Pores_rays_ratio') as string,
      rays_per_mm: (formData.get('rays_per_mm') as any),
      rays_width: formData.get('rays_width') as string,
      rays_two_distinct_sizes: formData.get('rays_two_distinct_sizes') as string,
      rays_aggregate: formData.get('rays_aggregate') as string,
      rays_storied_ripple_mark: formData.get('rays_storied_ripple_mark') as string,
      rays_deposit_in_rays: formData.get('rays_deposit_in_rays') as string,
      ap_type: formData.get('ap_type') as string,
      ap_paratracheal: formData.get('ap_paratracheal') as string,
      ap_apotracheal: formData.get('ap_apotracheal') as string,
      ap_banded: formData.get('ap_banded') as string,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // 3. บันทึก Wood ลง DB
    const newWood = await prisma.wood.create({ data });

    // 4. จัดการรูปภาพ (รักษา Logic เดิม)
    const images = formData.getAll('images') as File[];
    const folderName = commonName.replace(/\s+/g, '_');
    const uploadDir = path.join(process.cwd(), 'public/images/woods', folderName);
    
    await mkdir(uploadDir, { recursive: true });

    const imageRecords = [];
    for (const file of images) {
      if (!file.name || file.size === 0) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadDir, fileName);
      
      await writeFile(filePath, buffer);

      imageRecords.push({
        wood_id: newWood.wood_id,
        image_url: `/images/woods/${folderName}/${fileName}`,
        date_added: new Date(),
      });
    }

    if (imageRecords.length > 0) {
      await prisma.wood_Images.createMany({ data: imageRecords });
    }

    return NextResponse.json({ 
      success: true, 
      wood_id: newWood.wood_id.toString() 
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ 
      error: "Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}