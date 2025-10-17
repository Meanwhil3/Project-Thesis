import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  icon?: string;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  icon,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  className = ''
}) => {
  return (
    <div className={`relative flex flex-col items-stretch ${className}`}>
      <label htmlFor={name} className="text-[rgba(19,97,71,1)] text-xl">
        {label}
      </label>
      <div className="relative mt-[15px]">
        <div className="bg-white shadow-[0px_0px_2px_rgba(22,163,74,1)] flex items-stretch gap-[22px] flex-wrap px-3.5 py-[5px] rounded-[5px] min-h-10">
          {icon && (
            <img
              src={icon}
              alt=""
              className="aspect-[1] object-contain w-[25px] shrink-0 my-auto"
            />
          )}
          <input
            id={name}
            type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
            placeholder={placeholder}
            {...register(name)}
            className="grow shrink basis-auto bg-transparent outline-none text-[rgba(135,135,135,1)] placeholder:text-[rgba(135,135,135,1)]"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : undefined}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="aspect-[1] object-contain w-[25px] shrink-0"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/cd308ba80eeeab135caec22caa2abc99dc347656?placeholderIfAbsent=true"
                alt=""
                className="w-full h-full"
              />
            </button>
          )}
        </div>
      </div>
      {error && (
        <span id={`${name}-error`} className="text-red-500 text-sm mt-1" role="alert">
          {error.message}
        </span>
      )}
    </div>
  );
};
