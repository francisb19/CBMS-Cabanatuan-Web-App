"use client";
import React, { useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  InfoWindow,
} from "@react-google-maps/api";
import { ColorRing } from "react-loader-spinner";
import { useAppSelector } from "../redux/store";

const MapSearch = () => {
  const currentStructureList = useAppSelector(
    (state) => state.structureMapPropsReducer.value.currentStructureList
  );
  const currentCenter = useAppSelector(
    (state) => state.structureMapPropsReducer.value.currentCenter
  );
  const currentZoom = useAppSelector(
    (state) => state.structureMapPropsReducer.value.currentZoom
  );

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [infoWindowOpenState, setInfoWindowOpenState] = useState(false);

  if (!isLoaded) {
    return (
      <div className="w-full grid place-items-center pl-16 row-span-4">
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
  } else {
    return (
      <div className="pl-16 row-span-4">
        <GoogleMap
          zoom={currentZoom}
          center={currentCenter}
          mapContainerClassName={"h-full w-full"}
        >
          {currentStructureList.map((structure) => (
            <Marker
              key={structure.id}
              position={{ lat: structure.Latitude, lng: structure.Longitude }}
              onClick={(e) => setInfoWindowOpenState(true)}
            >
              {infoWindowOpenState === true && (
                <InfoWindow
                  position={{
                    lat: structure.Latitude,
                    lng: structure.Longitude,
                  }}
                  onCloseClick={() => setInfoWindowOpenState(false)}
                >
                  <span>Geotag Id: {structure.GeotagId}</span>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </div>
    );
  }
};

export default MapSearch;
