"use client";
import React from "react";
import { ColorRing } from "react-loader-spinner";

const LoadingScreen = () => {
  return (
    <div className="w-screen grid h-screen place-items-center absolute z-10 bg-neutral-100 bg-opacity-40">
      <ColorRing
        visible={true}
        height="80"
        width="80"
        ariaLabel="blocks-loading"
        wrapperStyle={{}}
        wrapperClass="blocks-wrapper"
        colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
      />
    </div>
  );
};

export default LoadingScreen;
