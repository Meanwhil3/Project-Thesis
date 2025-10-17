import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="self-center flex w-[274px] max-w-full items-stretch text-[40px] text-green-900 whitespace-nowrap">
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/213960b022bf5f7c6f0559e577870bea34947bd0?placeholderIfAbsent=true"
        alt="WoodCertify Logo"
        className="aspect-[1] object-contain w-[50px] shrink-0 my-auto"
      />
      <h1 className="grow shrink w-[214px]">
        WoodCertify
      </h1>
    </header>
  );
};
