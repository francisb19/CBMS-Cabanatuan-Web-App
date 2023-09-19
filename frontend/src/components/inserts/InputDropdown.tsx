"use client";

interface Choice {
  id: number;
  choice: String;
}

interface InputDropdownProps {
  disabled?: boolean;
  thin?: boolean;
  dropdownSize: string;
  placeholder: string;
  labelFor?: string;
  lightText?: boolean;
  options: Choice[];
  defaultOptions?: Choice[];
}

const InputDropdown: React.FC<InputDropdownProps> = ({
  disabled,
  thin,
  dropdownSize,
  placeholder,
  labelFor,
  lightText,
  options,
  defaultOptions,
}) => {
  return (
    <div className="mb-4">
      <label
        className={`block mb-2 text-md font-bold ${
          lightText ? "text-neutral-50" : "text-neutral-950"
        }`}
        htmlFor={labelFor}
      >
        {placeholder}
      </label>
      <select
        name={labelFor}
        id={labelFor}
        disabled={disabled}
        className={`font-semibold border rounded py-2 px-3 text-gray-700 hover:border-gray-400 bg-gray-50 focus:bg-neutral-50 focus:border focus:border-primary-500 !outline-none transition-all focus:shadow-md focus:shadow-primary-200
          ${dropdownSize === "btn-sm" && "w-6"}
          ${dropdownSize === "btn-md" && "w-12"}
          ${dropdownSize === "btn-lg" && "w-24"}
          ${dropdownSize === "btn-full" && "w-full"}
          ${thin && "h-6"}
          `}
      >
        {defaultOptions?.map((opt) => (
          <option key={opt.id} className="font-semibold">
            {opt.choice}
          </option>
        ))}
        {options.map((opt) => (
          <option key={opt.id} className="font-semibold">
            {opt.choice}
          </option>
        ))}
      </select>
    </div>
  );
};

export default InputDropdown;
