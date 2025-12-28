// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// 1. จัดการเรื่อง BigInt ให้เรียบร้อยก่อน (ทำครั้งเดียวตอนโหลดไฟล์)
if (!(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// 2. สร้าง instance แบบ Singleton เพื่อป้องกัน Connection เต็มใน Dev mode
export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma