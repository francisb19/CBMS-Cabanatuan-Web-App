"use client";
import LoadingScreen from "@/components/inserts/LoadingScreen";
import { MapFilter } from "@/components/inserts/MapFilter";
import MapSearch from "@/components/inserts/MapSearch";
import Navbar from "@/components/inserts/Navbar";
import { Metadata } from "next";
import { useState } from "react";

export const metadata: Metadata = {
  title: "Search by Map",
};

export default function Page() {
  const [loadingScreenState, setLoadingScreenState] = useState(false);

  return (
    <div className="bg-neutral-50 h-[100vh] w-full grid grid-flow-row grid-rows-6 lg:grid-rows-5">
      <MapSearch />
      <MapFilter setLoadingScreenState={setLoadingScreenState} />
      <Navbar />
      {loadingScreenState && <LoadingScreen />}
    </div>
  );
}
