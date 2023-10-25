"use client";
import React, { useEffect, useState } from "react";
import ButtonRegular from "./ButtonRegular";
import { Bree_Serif } from "next/font/google";
import InputDropdown from "./InputDropdown";
import axios from "axios";
import ModalAlert from "./ModalAlert";
import {
  resetCurrentData,
  updateSelectedBarangay,
  updateStructureList,
  updateStructureListCount,
  updateHouseholdCount,
  updateCurrentCenter,
  updateCurrentZoom,
} from "../redux/features/structureMap-slice";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "../redux/store";

const bree = Bree_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bree",
});

interface MapFilterProps {
  setLoadingScreenState: (params: any) => void;
}

export const MapFilter: React.FC<MapFilterProps> = ({
  setLoadingScreenState,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentSelectedBarangay = useAppSelector(
    (state) => state.structureMapPropsReducer.value.currentSelectedBarangay
  );
  const currentStructureListCount = useAppSelector(
    (state) => state.structureMapPropsReducer.value.currentStructureListCount
  );
  const currentHouseholdListCount = useAppSelector(
    (state) => state.structureMapPropsReducer.value.currentHouseholdListCount
  );

  const ip = "localhost:5010";
  const defaultOnDropdown = {
    barangay: [
      { id: 0, choice: "-- Pick a Barangay --" },
      { id: 99, choice: "All Barangay" },
    ],
  };
  const [barangayList, setBarangayList] = useState([]);

  const [alertModalState, setAlertModalState] = useState({
    visibility: false,
    alertHeader: "",
    alertText: "",
    alertType: "",
  });

  useEffect(() => {
    (async () => {
      const barangayList = await axios(`http://${ip}/getBarangays`);
      await setBarangayList(barangayList.data);
    })();
  }, []);

  const fetchMarkers = async () => {
    if (currentSelectedBarangay === "") {
      await setAlertModalState({
        visibility: true,
        alertHeader: "Fail!",
        alertText: "Please select a Barangay!",
        alertType: "fail",
      });
    } else {
      await setLoadingScreenState(true);
      const structureListData = await axios(
        `http://${ip}/getStructuresByBarangay/${currentSelectedBarangay}`
      );
      const householdCountData = await axios(
        `http://${ip}/getHouseholdCountByBarangay/${currentSelectedBarangay}`
      );
      await dispatch(updateStructureList(structureListData.data));
      await dispatch(updateStructureListCount(structureListData.data.length));
      await dispatch(updateHouseholdCount(householdCountData.data));
      await setLoadingScreenState(false);
      if (structureListData.data.length === 0) {
        await setAlertModalState({
          visibility: true,
          alertHeader: "Fail!",
          alertText: "No Structure Found!",
          alertType: "fail",
        });
      } else {
        await dispatch(
          updateCurrentCenter({
            lat: structureListData.data[0].Latitude,
            lng: structureListData.data[0].Longitude,
          })
        );
        await dispatch(updateCurrentZoom(16));
      }
    }
  };

  const onModalAlertClose = async () => {
    await setAlertModalState({
      ...alertModalState,
      visibility: false,
      alertHeader: "",
      alertText: "",
      alertType: "",
    });
  };

  return (
    <div className="h-full w-full px-16 bg-secondary-950 text-neutral-50 row-span-2 lg:row-span-1">
      <div className="h-full w-full grid grid-cols-3 lg:grid-cols-5 lg:gap-10 content-center pl-10 gap-2">
        <div className="col-span-3 lg:col-span-3">
          <InputDropdown
            options={barangayList}
            defaultOptions={defaultOnDropdown.barangay}
            placeholder="Select Barangay"
            dropdownSize="btn-full"
            lightText
            OnChangeFunction={(value) => {
              dispatch(updateSelectedBarangay(value));
            }}
          />
        </div>
        <div className="col-span-1 pt-6">
          <ButtonRegular
            onClick={() => fetchMarkers()}
            label={"Search"}
            btnType="btn-primary-light"
          />
        </div>
        <div
          className={`font-sans font-semibold text-neutral-50 text-xl self-center select-none col-span-2 lg:col-span-1 text-center`}
        >
          <span className={`${bree.className} font-sans italic`}>
            Structure Count:{" "}
          </span>{" "}
          &nbsp;
          <span className="font-sans">{currentStructureListCount}</span>
          <br />
          <span className={`${bree.className} font-sans italic`}>
            Household Count:{" "}
          </span>{" "}
          &nbsp;
          <span className="font-sans">{currentHouseholdListCount}</span>
        </div>
      </div>
      <ModalAlert
        isVisible={alertModalState.visibility}
        onClose={() => onModalAlertClose()}
        alertText={alertModalState.alertText}
        alertHeader={alertModalState.alertHeader}
        alertType={alertModalState.alertType}
      />
    </div>
  );
};
