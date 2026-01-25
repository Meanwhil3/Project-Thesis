import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const commonName = formData.get('common_name') as string;

    // ตรวจสอบว่ามีชื่อไม้ส่งมาหรือไม่ เพื่อใช้สร้างชื่อ Folder
    if (!commonName) {
      return NextResponse.json({ error: "Common name is required" }, { status: 400 });
    }

    // เตรียมข้อมูล Data Object (เหมือนเดิม)
    const data = {
      common_name: commonName,
      scientific_name: formData.get('scientific_name') as string,
      wood_origin: formData.get('wood_origin') as string,
      wood_description: formData.get('wood_description') as string,
      wood_status: 'SHOW' as any,
      wood_taste: formData.get('wood_taste') as string,
      wood_odor: formData.get('wood_odor') as string,
      wood_Texture: formData.get('wood_Texture') as string,
      wood_luster: formData.get('wood_luster') as string,
      wood_grain: formData.get('wood_grain') as string,
      wood_weight: formData.get('wood_weight') as any,
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
      rays_per_mm: formData.get('rays_per_mm') as any,
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

    // 1. บันทึก Wood ลง DB ก่อนเพื่อเอา wood_id
    const newWood = await prisma.wood.create({ data });

    // 2. จัดการรูปภาพและสร้าง Folder ตาม common_name
    const images = formData.getAll('images') as File[];
    
    // แปลงชื่อ commonName ให้ปลอดภัยสำหรับชื่อ Folder (ลบช่องว่าง)
    const folderName = commonName.replace(/\s+/g, '_');
    
    // Path สำหรับเก็บไฟล์จริงบน Server
    const uploadDir = path.join(process.cwd(), 'public/images/woods', folderName);
    
    // mkdir แบบ recursive: true จะสร้าง Folder ให้ถ้ายังไม่มี (ถ้ามีแล้วจะไม่ทำอะไร)
    await mkdir(uploadDir, { recursive: true });

    const imageRecords = [];
    for (const file of images) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // ตั้งชื่อไฟล์: วันที่-ชื่อเดิม
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadDir, fileName);
      
      // เขียนไฟล์ลงใน Folder ใหม่
      await writeFile(filePath, buffer);

      // Path สำหรับเก็บลง DB (ใช้เรียกผ่าน URL)
      imageRecords.push({
        wood_id: newWood.wood_id,
        image_url: `/images/woods/${folderName}/${fileName}`,
        date_added: new Date(),
      });
    }

    // 3. บันทึกข้อมูลรูปลง Wood_Images
    if (imageRecords.length > 0) {
      await prisma.wood_Images.createMany({ data: imageRecords });
    }

    return NextResponse.json({ success: true, wood_id: newWood.wood_id });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}