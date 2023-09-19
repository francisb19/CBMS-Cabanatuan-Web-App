"use client";

import { IconType } from "react-icons";

interface ButtonSubmitProps {
  label: string;
  disabled?: boolean;
  btnType?: string;
  thin?: boolean;
  small?: boolean;
  icon?: IconType;
}

const ButtonSubmit: React.FC<ButtonSubmitProps> = ({
  label,
  disabled,
  btnType,
  thin,
  small,
  icon: Icon,
}) => {
  return (
    <button
      disabled={disabled}
      className={`
        relative
        disabled:opacity-70
        disabled:cursor-not-allowed
        rounded-lg
        hover:opacity-80
        transition
        w-full
        font-semibold
        ${
          btnType === "submit-outline" &&
          "bg-neutral-50 border-primary-900 border-[2px] text-gray-950 hover:bg-primary-900 hover:text-neutral-50"
        }
        ${
          btnType === "submit" &&
          "bg-primary-900 border-primary-900 border-[2px] text-neutral-50 "
        }
        ${thin ? "text-sm py-1 border-[1px]" : "text-md py-3 border-2"}
        ${small ? "w-36" : "w-full"}
      `}
    >
      {Icon && (
        <Icon
          size={24}
          className="
            absolute
            left-4
            top-3
          "
        />
      )}
      {label}
    </button>
  );
};

export default ButtonSubmit;
