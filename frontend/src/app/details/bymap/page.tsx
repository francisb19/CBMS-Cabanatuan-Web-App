import { MapFilter } from "@/components/inserts/MapFilter";
import MapSearch from "@/components/inserts/MapSearch";
import Navbar from "@/components/inserts/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search by Map",
};

export default function Page() {
  return (
    <div className="bg-neutral-50 h-[100vh] w-full grid grid-flow-row grid-rows-6">
      <MapSearch />
      <MapFilter />
      <Navbar />
    </div>
  );
}
