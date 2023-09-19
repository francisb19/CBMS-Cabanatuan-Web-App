"use client";
import { useState } from "react";
import Image from "next/image";
import { Bree_Serif } from "next/font/google";
import {
  AiFillHome,
  AiFillQuestionCircle,
  AiOutlineUserAdd,
  AiFillCaretRight,
} from "react-icons/ai";
import { FaMapMarkedAlt } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { CgProfile } from "react-icons/cg";
import { HiMenuAlt3 } from "react-icons/hi";
import { useRouter, usePathname } from "next/navigation";

const bree = Bree_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bree",
});

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarCollapseState, setSidebarCollapseState] = useState(false);
  const [isStructureDropdownOpen, setIsStructureDropdownOpen] = useState(false);

  return (
    <div
      className={`w-64 h-full py-5 bg-opacity-90 bg-neutral-50 absolute select-none transition-all rounded flex flex-col
      ${sidebarCollapseState ? "ml-0 items-start" : "-ml-48 items-end"}`}
    >
      {!sidebarCollapseState && (
        <div className="text-center flex flex-col">
          <div
            onClick={() => setSidebarCollapseState(!sidebarCollapseState)}
            className="hover:bg-secondary-100 px-2 py-1 mr-[11px] cursor-pointer"
          >
            <GiHamburgerMenu
              size={25}
              style={{
                fill: "black",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            />
          </div>
          <div
            onClick={() => setIsStructureDropdownOpen(!isStructureDropdownOpen)}
            className={`hover:bg-secondary-100 px-2 py-1 mr-[11px] cursor-pointer
              ${isStructureDropdownOpen && "bg-secondary-100"}
              ${
                (pathname === "/details/bymap" ||
                  pathname === "/details/bystructure" ||
                  pathname === "/details/byhousehold") &&
                "bg-secondary-100"
              }
              `}
          >
            <AiFillHome
              size={25}
              style={{
                fill: "black",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            />
          </div>
          <div
            onClick={() => console.log("Question Data")}
            className="hover:bg-secondary-100 px-2 py-1 mr-[11px] cursor-pointer"
          >
            <AiFillQuestionCircle
              size={25}
              style={{
                fill: "black",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            />
          </div>
          <div
            onClick={() => console.log("Map Data")}
            className="hover:bg-secondary-100 px-2 py-1 mr-[11px] cursor-pointer"
          >
            <FaMapMarkedAlt
              size={25}
              style={{
                fill: "black",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            />
          </div>
          <div
            onClick={() => console.log("Users")}
            className="hover:bg-secondary-100 px-2 py-1 mr-[11px] cursor-pointer"
          >
            <AiOutlineUserAdd
              size={25}
              style={{
                fill: "black",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            />
          </div>
          <div className="absolute bottom-0 hover:bg-secondary-100 px-2 py-1 mr-[11px] cursor-pointer">
            <CgProfile
              onClick={() => console.log("Account")}
              size={25}
              style={{
                fill: "black",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            />
          </div>
        </div>
      )}

      {sidebarCollapseState && (
        <div className="w-full text-center flex flex-col select-none">
          <div className="pl-3 py-3 grid grid-flow-row grid-cols-2">
            <div
              onClick={() => router.push("/home")}
              className={`${bree.className} font-sans pt-[1px] text-3xl cursor-pointer`}
            >
              <div className="w-10 h-10 relative">
                <Image
                  src="/cablogo.png"
                  object-fit="cover"
                  fill={true}
                  alt="Cabanatuan Logo"
                />
                <p className="pl-14 pt-[1px]">CBMS</p>
              </div>
            </div>
            <div
              onClick={() => setSidebarCollapseState(!sidebarCollapseState)}
              className="place-self-end mr-[15px] px-2 hover:bg-secondary-100 cursor-pointer"
            >
              <HiMenuAlt3
                size={25}
                style={{
                  fill: "black",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              />
            </div>
          </div>
          <div
            onClick={() => setIsStructureDropdownOpen(!isStructureDropdownOpen)}
            className={`inline-flex items-center px-2 py-4 hover:bg-secondary-100 cursor-pointer
            ${isStructureDropdownOpen && "bg-secondary-100"}
            ${
              (pathname === "/details/bymap" ||
                pathname === "/details/bystructure" ||
                pathname === "/details/byhousehold") &&
              "bg-secondary-100"
            }
            `}
          >
            <AiFillHome
              size={25}
              style={{
                fill: "black",
                marginLeft: "10px",
                marginRight: "10px",
              }}
            />
            <p className={`${bree.className} font-sans text-xl font-semibold`}>
              Structure Data
            </p>
            <AiFillCaretRight
              size={15}
              style={{
                fill: "black",
                marginLeft: "30px",
              }}
            />
          </div>
          <div className="inline-flex items-center px-2 py-4 hover:bg-secondary-100 cursor-pointer">
            <AiFillQuestionCircle
              size={25}
              style={{
                fill: "black",

                marginLeft: "10px",
                marginRight: "10px",
              }}
            />
            <p className={`${bree.className} font-sans text-xl font-semibold`}>
              Question Data
            </p>
          </div>
          <div className="inline-flex items-center px-2 py-4 hover:bg-secondary-100 cursor-pointer">
            <FaMapMarkedAlt
              size={25}
              style={{
                fill: "black",
                marginLeft: "10px",
                marginRight: "10px",
              }}
            />
            <p className={`${bree.className} font-sans text-xl font-semibold`}>
              Map Data
            </p>
          </div>
          <div className="inline-flex items-center px-2 py-4 hover:bg-secondary-100 cursor-pointer">
            <AiOutlineUserAdd
              size={25}
              style={{
                fill: "black",
                marginLeft: "10px",
                marginRight: "10px",
              }}
            />
            <p className={`${bree.className} font-sans text-xl font-semibold`}>
              Users
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 inline-flex items-center px-2 py-4 hover:bg-secondary-100 cursor-pointer">
            <CgProfile
              size={25}
              style={{
                fill: "black",
                marginLeft: "10px",
                marginRight: "10px",
              }}
            />
            <p className={`${bree.className} font-sans text-xl font-semibold`}>
              Profile
            </p>
          </div>
        </div>
      )}
      {isStructureDropdownOpen && (
        <div
          className={`${
            bree.className
          } font-sans bg-opacity-90 bg-neutral-50 absolute shadow-md w-[40vw] md:w-3/4  text-lg ${
            sidebarCollapseState ? "left-64 top-[89px]" : "left-64 top-[75px]"
          }`}
        >
          <div className="flex flex-col cursor-pointer">
            <div
              onClick={() => router.push("/details/bymap")}
              className={`px-4 py-3 hover:bg-secondary-100 transition ${
                pathname === "/details/bymap" && "bg-secondary-100"
              }`}
            >
              By Map
            </div>
            <div
              className={`px-4 py-3 hover:bg-secondary-100 transition ${
                pathname === "/details/bystructure" && "bg-secondary-100"
              }`}
            >
              By Structure
            </div>
            <div
              className={`px-4 py-3 hover:bg-secondary-100 transition ${
                pathname === "/details/byhousehold" && "bg-secondary-100"
              }`}
            >
              By Household
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
