import { PrismaClient, WoodStatus, WoodWeight, RaysPerMm } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('⏳ กำลัง Seeding ข้อมูลด้วย Prisma V6...')
  
  // 1. จัดการ Role
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  })

  // 2. จัดการ User และเก็บค่าไว้ในตัวแปร adminUser
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@wood.ac.th' },
    update: {},
    create: {
      first_name: 'สมชาย',
      last_name: 'แอดมิน',
      email: 'admin@wood.ac.th',
      password: 'password123',
      role_id: adminRole.role_id,
      is_active: true,
      created_at: new Date(),
    },
  })

  // 3. ข้อมูลไม้ชนิดที่ 1: กะทังหัน
  await prisma.wood.create({
    data: {
      common_name: 'กะทังหัน',
      scientific_name: 'Calophyllum thorelii Pierre',
      wood_origin: 'ภาคกลาง',
      wood_description: 'เนื้อไม้มีความแข็งแรงทนทาน มักใช้ในการก่อสร้าง',
      wood_status: WoodStatus.SHOW,
      wood_weight: WoodWeight.MEDIUM,
      wood_Texture: 'ละเอียด',
      wood_odor: 'ไม่มีกลิ่น',
      growth_rings: 'เห็นไม่ชัดเจน',
      rays_per_mm: RaysPerMm.MEDIUM,
      created_by: adminUser.user_id, // แก้จาก user เป็น adminUser
      created_at: new Date(),
      images: {
        create: [
          {
            image_url: '/images/woods/test1.jpg',
            image_description: 'ลายเนื้อไม้กะทังหัน',
            date_added: new Date(),
          },
        ],
      },
    },
  });

  // 4. ข้อมูลไม้ชนิดที่ 2: สมอไทย
  await prisma.wood.create({
    data: {
      common_name: 'สมอไทย',
      scientific_name: 'Terminalia chebula Retz. var. chebula',
      wood_origin: 'ภาคเหนือ',
      wood_description: 'เนื้อไม้สีน้ำตาลเข้ม มีกลิ่นเฉพาะตัว',
      wood_status: WoodStatus.SHOW,
      wood_weight: WoodWeight.HEAVY,
      wood_Texture: 'หยาบ',
      wood_odor: 'มีกลิ่น',
      growth_rings: 'เห็นชัดเจน',
      rays_per_mm: RaysPerMm.HIGH,
      created_by: adminUser.user_id, // แก้จาก user เป็น adminUser
      created_at: new Date(),
      images: {
        create: [
          {
            image_url: '/images/woods/test2.jpg',
            image_description: 'ลายเนื้อไม้สมอไทย',
            date_added: new Date(),
          },
        ],
      },
    },
  });

  console.log('✅ Success!')
}

main()
  .catch((e) => { 
    console.error(e); 
    process.exit(1); 
  })
  .finally(async () => { 
    await prisma.$disconnect(); 
  })