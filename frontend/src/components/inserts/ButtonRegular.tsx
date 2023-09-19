"use client";

import { IconType } from "react-icons";

interface ButtonRegularProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  btnType?: string;
  thin?: boolean;
  small?: boolean;
  icon?: IconType;
}

const ButtonRegular: React.FC<ButtonRegularProps> = ({
  label,
  onClick,
  disabled,
  btnType,
  thin,
  small,
  icon: Icon,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        relative
        disabled:opacity-70
        disabled:cursor-not-allowed
        rounded-lg
        hover:opacity-80
        transition
        font-semibold
        ${
          btnType === "btn-primary" &&
          "bg-primary-900 border-primary-900 border-[2px] text-neutral-50"
        }
        ${
          btnType === "btn-primary-light" &&
          "bg-primary-400 border-primary-400 border-[2px] text-neutral-950"
        }
        ${
          btnType === "btn-primary-outline" &&
          "bg-neutral-50 border-primary-900 text-gray-950 hover:bg-primary-900 hover:text-neutral-50"
        }
        ${
          btnType === "btn-secondary" &&
          "bg-secondary-500 border-secondary-300 border-[2px] text-neutral-50"
        }
        ${
          btnType === "btn-secondary-outline" &&
          "bg-neutral-50 border-secondary-500 text-gray-950 hover:bg-secondary-500 hover:border-secondary-300 hover:text-neutral-50"
        }
        ${
          btnType === "btn-error" &&
          "bg-error-700 border-error-500 border-[2px] text-neutral-50"
        }
        ${
          btnType === "btn-error-outline" &&
          "bg-neutral-50 border-error-700 text-gray-950 hover:bg-error-700 hover:border-error-500 hover:text-neutral-50"
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

export default ButtonRegular;
