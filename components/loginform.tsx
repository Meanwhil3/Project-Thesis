"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-card-foreground mb-2">เข้าสู่ระบบ</h1>
        <p className="text-brand-green text-sm">กรอกEmailและรหัสผ่านที่ได้รับ เพื่อเข้าใช้งาน</p>
      </div>

      <form className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-card-foreground font-medium">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              placeholder="youremail@gmail.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-card-foreground font-medium">รหัสผ่าน</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12"
              placeholder="************"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-green"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="terms" 
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            Agree our{" "}
            <span className="text-brand-green underline cursor-pointer">Terms of Service</span>
            {" "}and{" "}
            <span className="text-brand-green underline cursor-pointer">Privacy Policy</span>
          </label>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-brand-green hover:bg-brand-green/90 text-white font-medium rounded-lg"
        >
          เข้าสู่ระบบ
        </Button>

        <div className="text-center">
          <a href="#" className="text-brand-green text-sm underline">
            ไม่สามารถเข้าสู่ระบบได้ <span className="underline">ติดต่อ</span>
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;