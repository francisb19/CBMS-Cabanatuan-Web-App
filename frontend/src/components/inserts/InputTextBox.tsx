"use client";

import { forwardRef } from "react";

interface InputTextBoxProps
  extends React.PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  label: string;
  disabled?: boolean;
  thin?: boolean;
  textBoxSize?: string;
  placeholder: string;
  inputType: string;
  minLength?: number;
  autocomplete?: string;
  labelFor: string;
  lightText?: boolean;
}

const InputTextBox = forwardRef<HTMLInputElement, InputTextBoxProps>(
  (
    {
      label,
      disabled,
      thin,
      textBoxSize,
      placeholder,
      inputType,
      minLength,
      autoComplete,
      labelFor,
      lightText,
      ...props
    },
    ref
  ) => {
    return (
      <div className="mb-4">
        <label
          className={`block mb-2 text-md font-bold ${
            lightText ? "text-neutral-50" : "text-neutral-950"
          }`}
          htmlFor={labelFor}
        >
          {label}
        </label>
        <input
          {...props}
          ref={ref}
          id={labelFor}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          disabled={disabled}
          className={`border rounded py-2 px-3 text-gray-700 hover:border-gray-400 bg-gray-50 focus:bg-neutral-50 focus:border focus:border-primary-500 !outline-none transition-all focus:shadow-md focus:shadow-primary-200
          ${textBoxSize === "btn-sm" && "w-6"}
          ${textBoxSize === "btn-md" && "w-12"}
          ${textBoxSize === "btn-lg" && "w-24"}
          ${textBoxSize === "btn-full" && "w-full"}
          ${thin && "h-6"}

          `}
        />
      </div>
    );
  }
);

export default InputTextBox;
