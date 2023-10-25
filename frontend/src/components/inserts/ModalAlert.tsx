"use client";
import React from "react";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { Bree_Serif } from "next/font/google";
import ButtonRegular from "./ButtonRegular";

const bree = Bree_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bree",
});

interface ModalAlertProps {
  isVisible: boolean;
  onClose: React.MouseEventHandler;
  alertText: string;
  alertHeader: string;
  alertType: string;
}

const ModalAlert: React.FC<ModalAlertProps> = ({
  isVisible,
  onClose,
  alertText,
  alertHeader,
  alertType,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-neutral-950 bg-opacity-25 backdrop-blur-sm flex justify-center items-center transition-all text-neutral-950">
      <div className="bg-neutral-50 w-[280px] h-[330px] flex flex-col rounded px-8">
        <div className="mt-12 mb-4 h-[50px] flex justify-center items-center rounded">
          {alertType === "success" && (
            <AiOutlineCheckCircle size={70} style={{ fill: "green" }} />
          )}
          {alertType === "fail" && (
            <AiOutlineCloseCircle size={70} style={{ fill: "red" }} />
          )}
        </div>
        <div
          className={`${bree.className} font-sans mt-2 mb-2 rounded flex justify-center items-center text-3xl uppercase`}
        >
          {alertHeader}
        </div>
        <div className="mb-4 rounded flex justify-center items-center text-md text-center font-thin text-xl">
          {alertText}
        </div>
        <div className=" my-4 flex justify-center items-center ">
          <ButtonRegular
            onClick={onClose}
            label={"OK"}
            btnType="btn-primary"
            small
          />
        </div>
      </div>
    </div>
  );
};

export default ModalAlert;
