"use client";
import React from "react";
import GoogleMapReact from "google-map-react";
function MapSearch() {
  const defaultProps = {
    center: {
      lat: 15.4865,
      lng: 120.9734,
    },
    zoom: 13,
  };

  return (
    <div className="h-full w-full pl-16 row-span-5">
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyAbwBZhbwO_9-hJJQe3wpn05eOEVmfwlvg" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        yesIWantToUseGoogleMapApiInternals
      ></GoogleMapReact>
    </div>
  );
}

export default MapSearch;
