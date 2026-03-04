import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. สร้าง Roles (ใช้ upsert เพื่อป้องกัน error ถ้ามีข้อมูลอยู่แล้ว)
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const examinerRole = await prisma.role.upsert({
    where: { name: 'EXAMINER' },
    update: {},
    create: { name: 'EXAMINER' },
  });

  const traineeRole = await prisma.role.upsert({
    where: { name: 'TRAINEE' },
    update: {},
    create: { name: 'TRAINEE' },
  });

  console.log('✅ Roles created: ADMIN, EXAMINER, TRAINEE');

  // 2. เตรียมรหัสผ่านที่ผ่านการ Hash แล้ว
  const saltRounds = 10;
  const hashedAdminPassword = await bcrypt.hash('123456', saltRounds);
  const hashedTestPassword = await bcrypt.hash('password123', saltRounds); // สำหรับ user อื่นๆ

  // 3. สร้าง User Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      password: hashedAdminPassword, // อัปเดตรหัสผ่านใหม่ให้เป็นแบบ Hash
    },
    create: {
      first_name: 'ad_test',
      last_name: 'jaja',
      email: 'admin@gmail.com',
      password: hashedAdminPassword, // ใช้รหัสผ่านที่ Hash แล้ว
      is_active: true,
      role_id: adminRole.role_id,
    },
  });

  console.log(`✅ Admin user created/updated with hashed password: ${adminUser.email}`);
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