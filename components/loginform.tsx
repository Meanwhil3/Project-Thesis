"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg("กรุณากรอก Email และรหัสผ่าน");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        email: trimmedEmail,
        password,
        redirect: false, // เราคุมการ redirect เอง
      });

      if (!res?.ok) {
        setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      router.push("/tree/treesearch");
      router.refresh();
    } catch {
      setErrorMsg("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-card-foreground mb-2">
          เข้าสู่ระบบ
        </h1>
        <p className="text-brand-green text-sm">
          กรอกEmailและรหัสผ่านที่ได้รับ เพื่อเข้าใช้งาน
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-card-foreground font-medium">
            Email
          </Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              placeholder="youremail@gmail.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-card-foreground font-medium">
            รหัสผ่าน
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12"
              placeholder="************"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-green"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-green-600 hover:bg-brand-green/90 text-white font-medium rounded-lg"
        >
          {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>
      </form>

      <div className="text-center mt-4">
        <Link href="/register" className="text-brand-green text-sm underline">
          ยังไม่มีบัญชีผู้ใช้งาน<span className="underline">ลงทะเบียน</span>
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
