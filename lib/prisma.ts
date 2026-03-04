// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * เพิ่ม connection_limit=25 & pool_timeout=20 เพื่อรองรับผู้สอบพร้อมกัน 50 คน
 * หากต้องการปรับค่า ให้เพิ่ม ?connection_limit=N ใน DATABASE_URL โดยตรง
 */
function buildDatasourceUrl() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url || url.includes("connection_limit")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}connection_limit=25&pool_timeout=20`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatasourceUrl(),
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
