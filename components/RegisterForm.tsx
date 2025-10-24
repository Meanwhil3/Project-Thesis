"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const registerSchema = z.object({
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีความยาวมากกว่า 6 ตัวอักษร"),
  agreeTerms: z.boolean().refine((val) => val === true, "กรุณายอมรับเงื่อนไขการใช้งาน"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreeTerms: false },
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log("Registration data:", data);
  };

  const handleTermsChange = (checked: boolean) => {
    setAgreeTerms(checked);
    setValue("agreeTerms", checked);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-card-foreground mb-2">ลงทะเบียน</h1>
        <p className="text-brand-green text-sm">ลงทะเบียนเพื่อบันทึกข้อมูลให้อยู่ในระบบ</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ชื่อ - นามสกุล */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="firstName" className="text-card-foreground font-medium">
              ชื่อ
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="กรอกชื่อ"
                className="pl-10 h-12"
              />
            </div>
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div className="flex-1">
            <Label htmlFor="lastName" className="text-card-foreground font-medium">
              นามสกุล
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="กรอกนามสกุล"
                className="pl-10 h-12"
              />
            </div>
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-card-foreground font-medium">
            Email
          </Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="youremail@gmail.com"
              className="pl-10 h-12"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="text-card-foreground font-medium">
            รหัสผ่าน
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="********"
              className="pl-10 pr-10 h-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-green"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={agreeTerms}
            onChange={(e) => handleTermsChange(e.target.checked)}
            className="h-4 w-4 accent-green-600"
          />
          <label htmlFor="agreeTerms" className="text-sm text-muted-foreground">
            Agree our{" "}
            <span className="text-brand-green underline cursor-pointer">Terms of Service</span>{" "}
            and{" "}
            <span className="text-brand-green underline cursor-pointer">Privacy Policy</span>
          </label>
        </div>
        {errors.agreeTerms && (
          <p className="text-red-500 text-sm mt-1">{errors.agreeTerms.message}</p>
        )}

        {/* Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-green-600 hover:bg-brand-green/90 text-white font-medium rounded-lg"
        >
          ลงทะเบียน
        </Button>

        <div className="text-center">
          <a href="/login" className="text-brand-green text-sm underline">
            มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
          </a>
        </div>
      </form>
    </div>
  );
};
