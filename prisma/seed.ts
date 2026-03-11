import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding with Thai names...');

  // 1. สร้าง/ตรวจสอบ Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const instructorRole = await prisma.role.upsert({
    where: { name: 'INSTRUCTOR' },
    update: {},
    create: { name: 'INSTRUCTOR' },
  });

  const traineeRole = await prisma.role.upsert({
    where: { name: 'TRAINEE' },
    update: {},
    create: { name: 'TRAINEE' },
  });

  console.log('✅ Roles prepared');

  // 2. เตรียมข้อมูลชื่อสำหรับสุ่ม
  const thaiFirstNames = [
    'สมชาย', 'วิภา', 'กิตติ', 'นภา', 'ธนา', 'รุ่งโรจน์', 'สิริพงษ์', 'อัญชลี', 
    'วีรพล', 'พรทิพย์', 'ปิยะ', 'ณัฐวุฒิ', 'จิราภรณ์', 'ศราวุธ', 'วรรณวิสา'
  ];
  const thaiLastNames = [
    'รักดี', 'ใจงาม', 'รุ่งเรืองกิจ', 'สวัสดิ์ดี', 'มั่งคั่ง', 'ทวีทรัพย์', 'เลิศปัญญา', 
    'วัฒนพานิช', 'แสงทอง', 'สุขสวัสดิ์', 'พรหมมา', 'เกษมสันต์', 'นันทะวงศ์'
  ];

  const saltRounds = 10;
  const hashedCommonPassword = await bcrypt.hash('123456', saltRounds);

  // 3. ฟังก์ชันสร้าง Users แบบสุ่มชื่อไทย
  const createUsers = async (
    count: number,
    emailPrefix: string,
    roleId: bigint
  ) => {
    for (let i = 1; i <= count; i++) {
      const index = i.toString().padStart(2, '0');
      const email = `${emailPrefix}${index}@gmail.com`;
      
      // สุ่มชื่อและนามสกุล
      const fName = thaiFirstNames[Math.floor(Math.random() * thaiFirstNames.length)];
      const lName = thaiLastNames[Math.floor(Math.random() * thaiLastNames.length)];

      await prisma.user.upsert({
        where: { email: email },
        update: {
          password: hashedCommonPassword,
          role_id: roleId,
        },
        create: {
          first_name: fName,
          last_name: lName,
          email: email,
          password: hashedCommonPassword,
          is_active: true,
          role_id: roleId,
        },
      });
    }
  };

  // 4. สั่งสร้าง User ตามเงื่อนไข
  // Admin 1 คน
  await createUsers(1, 'adminA', adminRole.role_id);
  
  // Instructor 2 คน
  await createUsers(2, 'instructorT', instructorRole.role_id);
  
  // Trainee 9 คน
  await createUsers(9, 'trainee', traineeRole.role_id);

  console.log('✅ All 12 users created with Thai identities.');
  console.log('🚀 Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });