"use client";
import { Metadata } from "next";
import Image from "next/image";
import { Bree_Serif } from "next/font/google";
import Navbar from "@/components/inserts/Navbar";

export const metadata: Metadata = {
  title: "Home",
};

const bree = Bree_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bree",
});

export default function Page() {
  return (
    <>
      <div className="bg-secondary-100 grid grid-rows-2 h-screen w-full lg:grid-cols-3 md:grid-cols-3 z-0 absolute">
        <div className="bg-primary-950 -skew-y-6 skew-x-0 -mt-[60px] flex justify-center items-center text-center ml-0 pl-14 lg:col-span-2 md:col-span-2 lg:h-screen md:h-screen lg:-skew-x-6 md:-skew-x-6 lg:skew-y-0 md:skew-y-0 lg:-ml-[60px] md:-ml-[60px] lg:mt-0 md:-mt-0 lg:pl-34 md:pl-32 select-none pointer-events-none">
          <div
            className={`${bree.className} font-sans text-gray-50 text-5xl p-5`}
          >
            COMMUNITY BASED MONITORING SYSTEM
          </div>
        </div>
        <div className="bg-secondary-100 lg:h-screen md:h-screen flex justify-center items-center pl-14 md:pl-0 lg:pl-0 select-none pointer-events-none">
          <div className="w-60 h-60 relative ">
            <Image
              src="/cablogo.png"
              object-fit="cover"
              fill={true}
              alt="Cabanatuan Logo"
            />
          </div>
        </div>
      </div>
      <Navbar />
    </>
  );
}
