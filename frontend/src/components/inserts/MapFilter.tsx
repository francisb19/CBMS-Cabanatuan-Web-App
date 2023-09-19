"use client";
import React, { useEffect, useState } from "react";
import ButtonRegular from "./ButtonRegular";
import { Bree_Serif } from "next/font/google";
import InputDropdown from "./InputDropdown";
import axios from "axios";

const bree = Bree_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bree",
});

export const MapFilter = () => {
  const ip = "localhost:5010";
  const defaultOnDropdown = {
    marker: [{ id: 0, choice: "-- Pick a Marker --" }],
    barangay: [{ id: 99, choice: "All Barangay" }],
  };
  const [barangayList, setBarangayList] = useState([]);
  const markerList = [
    { id: 1, choice: "Structure" },
    { id: 2, choice: "Household" },
  ];

  useEffect(() => {
    (async () => {
      const barangayList = await axios(`http://${ip}/getBarangays`);
      await setBarangayList(barangayList.data);
    })();
  }, []);

  return (
    <div className="h-full w-full px-16 bg-secondary-950 text-neutral-50">
      <div className="h-full w-full grid grid-cols-6 gap-10 content-center px-10">
        <div className="col-span-2">
          <InputDropdown
            options={markerList}
            defaultOptions={defaultOnDropdown.marker}
            placeholder="Select Markers To Show"
            dropdownSize="btn-full"
            lightText
          />
        </div>
        <div className="col-span-2">
          <InputDropdown
            options={barangayList}
            defaultOptions={defaultOnDropdown.barangay}
            placeholder="Select Barangay"
            dropdownSize="btn-full"
            lightText
          />
        </div>
        <div className="col-span-1 pt-6">
          <ButtonRegular
            onClick={() => console.log("Test")}
            label={"Search"}
            btnType="btn-primary-light"
          />
        </div>
        <div
          className={`font-sans font-semibold text-neutral-50 text-2xl text-center self-center align-center inline-flex select-none`}
        >
          <span className={`${bree.className} font-sans italic`}>Count: </span>{" "}
          &nbsp;
          <span className="font-sans">0</span>
        </div>
      </div>
    </div>
  );
};
