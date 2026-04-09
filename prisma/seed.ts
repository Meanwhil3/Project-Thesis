import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {

  console.log('🌱 Starting seeding roles...');

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