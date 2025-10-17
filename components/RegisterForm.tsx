"use client"
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from './FormField';

const registerSchema = z.object({
  firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  email: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีความยาวมากกว่า 6 ตัวอักษร'),
  agreeTerms: z.boolean().refine(val => val === true, 'กรุณายอมรับเงื่อนไขการใช้งาน')
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeTerms: false
    }
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log('Registration data:', data);
    // Handle form submission here
  };

  const handleTermsChange = (checked: boolean) => {
    setAgreeTerms(checked);
    setValue('agreeTerms', checked);
  };

  return (
    <div className="bg-white shadow-[0px_0px_10px_rgba(202,224,188,1)] flex w-full flex-col items-stretch mt-[46px] px-[38px] py-[27px] rounded-[20px] max-md:max-w-full max-md:mt-10 max-md:px-5">
      <h2 className="text-green-900 text-[32px] font-medium self-center">
        ลงทะเบียน
      </h2>
      <p className="text-green-600 text-base self-center mt-[9px]">
        ลงทะเบียนเพื่อบันทึกข้อมูลให้อยู่ในระบบ
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-4 max-md:max-w-full">
        <fieldset className="w-full">
          <legend className="sr-only">ข้อมูลส่วนตัว</legend>
          <div className="flex w-full items-start gap-[30px] text-xl whitespace-nowrap flex-wrap max-md:max-w-full">
            <FormField
              label="ชื่อ"
              name="firstName"
              placeholder="กรอกชื่อ"
              register={register}
              error={errors.firstName}
              className="min-w-60 grow shrink w-[206px]"
            />
            <FormField
              label="นามสกุล"
              name="lastName"
              placeholder="กรอกนามสกุล"
              register={register}
              error={errors.lastName}
              className="min-w-60 grow shrink w-[206px]"
            />
          </div>
          
          <div className="w-full mt-5 max-md:max-w-full">
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="youremail@gmail.com"
              register={register}
              error={errors.email}
              icon="https://api.builder.io/api/v1/image/assets/TEMP/d3e92e7bc7075172a3cb0ca9502dcd034339d480?placeholderIfAbsent=true"
            />
          </div>
          
          <div className="flex w-full flex-col items-stretch mt-5 py-0.5 max-md:max-w-full">
            <FormField
              label="รหัสผ่าน"
              name="password"
              placeholder="********"
              register={register}
              error={errors.password}
              icon="https://api.builder.io/api/v1/image/assets/TEMP/cf59f6744d5ff1593dcaa27679bd5a37fbb70d03?placeholderIfAbsent=true"
              showPasswordToggle={true}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
            <div className="text-[rgba(17,139,62,1)] text-sm mt-1.5">
              รหัสผ่านต้องมีความยาวมากกว่า 6 ตัวอักษร มีทั้งตัวอังษรและเลข
            </div>
          </div>
        </fieldset>
        
        <div className="flex items-stretch gap-[9px] text-sm text-[rgba(17,139,62,1)] mt-2 max-md:ml-0.5">
          <div className="relative">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => handleTermsChange(e.target.checked)}
              className="sr-only"
              aria-describedby={errors.agreeTerms ? 'terms-error' : undefined}
            />
            <label
              htmlFor="agreeTerms"
              className="bg-white shadow-[0px_0px_3px_rgba(22,163,74,1)] flex w-[19px] h-[19px] cursor-pointer relative"
              aria-label="ยอมรับเงื่อนไขการใช้งาน"
            >
              {agreeTerms && (
                <span className="absolute inset-0 flex items-center justify-center text-green-600 text-xs">
                  ✓
                </span>
              )}
            </label>
          </div>
          <label htmlFor="agreeTerms" className="basis-auto grow shrink cursor-pointer">
            Agree our{" "}
            <span className="underline">Terms of Service</span>{" "}
            and{" "}
            <span className="underline">Privacy Policy</span>
          </label>
        </div>
        {errors.agreeTerms && (
          <span id="terms-error" className="text-red-500 text-sm mt-1 block" role="alert">
            {errors.agreeTerms.message}
          </span>
        )}
        
        <button
          type="submit"
          className="bg-green-600 flex flex-col items-center text-base text-white whitespace-nowrap justify-center mt-[17px] px-[62px] py-2 rounded-[5px] w-full max-md:px-5 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          ลงทะเบียน
        </button>
      </form>
    </div>
  );
};
