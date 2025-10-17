import React from 'react';
import { Header } from '@/components//Header';
import { RegisterForm } from '@/components//RegisterForm';

export const Register: React.FC = () => {
  return (
    <main className="flex flex-col overflow-hidden items-center font-normal pt-[138px] pb-56 px-20 max-md:px-5 max-md:py-[100px] min-h-screen bg-gray-50">
      <div className="flex w-[619px] max-w-full flex-col items-stretch">
        <Header />
        <RegisterForm />
      </div>
    </main>
  );
};

export default Register;
