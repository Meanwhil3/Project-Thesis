import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            user_id: true,
            email: true,
            password: true,
            first_name: true,
            last_name: true,
            is_active: true,
          },
        });

        if (!user) return null;
        if (user.is_active !== true) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          id: user.user_id.toString(), // BigInt -> string (สำคัญ)
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
};
