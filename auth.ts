// auth.ts (หรือไฟล์ที่คุณ export authOptions)
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

        // ✅ ดึง user จาก DB (ไม่ใช้ select เพื่อให้ได้ scalar fields มาครบ)
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            user_id: true,
            email: true,
            first_name: true,
            last_name: true,
            password: true, // หรือ field hash ของคุณ
            role_id: true,
            role: {
              // ✅ relation to Role
              select: { name: true }, // ✅ เอาชื่อ role มา
            },
          },
        });

        if (!user) return null;

        // ⚠️ เปลี่ยน field รหัสผ่านให้ตรงกับ schema ของคุณ
        const hash =
          (user as any).password ??
          (user as any).password_hash ??
          (user as any).hashed_password;
        if (!hash) return null;

        const ok = await bcrypt.compare(password, String(hash));
        if (!ok) return null;

        // ✅ role อาจเป็นคอลัมน์ หรือชื่ออื่นใน DB ของคุณ
        const role =
          (user as any).role ??
          (user as any).user_role ??
          (user as any).userRole ??
          null;

        return {
          id: String(user.user_id),
          user_id: String(user.user_id),
          email: user.email,
          name:
            `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
            user.email,
          role_id: String(user.role_id), // ✅ เก็บ role_id ด้วย
          role: user.role?.name ?? null, // ✅ นี่แหละที่ทำให้ role ไม่เป็น null
        } as any;
      },
    }),
  ],

  callbacks: {
    // ✅ เก็บ role/user_id ลง token เพื่อให้ session callback เอาไปใช้ได้ :contentReference[oaicite:1]{index=1}
    async jwt({ token, user, trigger }) {
      if (user) {
        token.user_id = (user as any).user_id ?? user.id;
        token.role = (user as any).role ?? null;
        token.name = user.name;
      }
      // เมื่อ client เรียก update() ให้ดึงชื่อล่าสุดจาก DB
      if (trigger === "update" && token.user_id) {
        const freshUser = await prisma.user.findUnique({
          where: { user_id: BigInt(String(token.user_id)) },
          select: { first_name: true, last_name: true },
        });
        if (freshUser) {
          token.name = `${freshUser.first_name ?? ""} ${freshUser.last_name ?? ""}`.trim();
        }
      }
      return token;
    },

    // ✅ ยัด role/user_id ลง session.user ให้ server/client อ่านได้
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).user_id = token.user_id;
        (session.user as any).role = token.role;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
};
