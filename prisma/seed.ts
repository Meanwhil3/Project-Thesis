import { PrismaClient } from '@prisma/client'

// ไม่ต้องใส่ datasourceUrl หรือ options ซับซ้อน
const prisma = new PrismaClient()

async function main() {
  console.log('⏳ กำลัง Seeding ข้อมูลด้วย Prisma V6...')
  
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  })

  await prisma.user.upsert({
    where: { email: 'admin@wood.ac.th' },
    update: {},
    create: {
      first_name: 'สมชาย',
      last_name: 'แอดมิน',
      email: 'admin@wood.ac.th',
      password: 'password123',
      role_id: adminRole.role_id,
      is_active: true,
    },
  })

  console.log('✅ Success!')
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); })