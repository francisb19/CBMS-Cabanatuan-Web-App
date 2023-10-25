import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type StructureListState = {
    id: number;
    GeotagId: String;
    DateTagged: any;
    Latitude: any;
    Longitude: any;
    LocationPhoto: String;
    Photo: String;
    Barangay: String;
    BarangayCode: String;
    Purok: String;
    BuildingUse: String;
    BuildingType: String;
    NoOfFloor: String;
    ConstructionMaterial: String;
    TabletNo: number;
    Team: number;
    Remarks: String
}

type CurrentCenterState = {
    lat: any;
    lng: any;
}

type QuestionDataState = {
    currentSelectedBarangay: String;
    currentStructureList: StructureListState[];
    currentStructureListCount: number;
    currentHouseholdListCount: number;
    currentCenter: CurrentCenterState;
    currentZoom: number;
}

type InitialState = {
    value: QuestionDataState;
}

const initialState = {
    value: {
        currentSelectedBarangay: '',
        currentStructureList: [{
            id: 0,
            GeotagId: '',
            DateTagged: '',
            Latitude: 0,
            Longitude: 0,
            LocationPhoto: '',
            Photo: '',
            Barangay: '',
            BarangayCode: '',
            Purok: '',
            BuildingUse: '',
            BuildingType: '',
            NoOfFloor: '',
            ConstructionMaterial: '',
            TabletNo: 0,
            Team: 0,
            Remarks: ''
        }],
        currentStructureListCount: 0,
        currentHouseholdListCount: 0,
        currentCenter: {
            lat: 15.4865,
            lng: 120.9734,
          },
        currentZoom: 13

    }
} as InitialState

export const structureMapProps = createSlice({
    name: "structureMap",
    initialState,
    reducers: {
        resetCurrentData: () => {
            return initialState;
        },
        updateSelectedBarangay: (state, action: PayloadAction<String>) => {
            state.value.currentSelectedBarangay = action.payload;
        },
        updateStructureList: (state, action: PayloadAction<Array<any>>) => {
            state.value.currentStructureList = action.payload;
        },
        updateStructureListCount: (state, action: PayloadAction<number>) => {
            state.value.currentStructureListCount = action.payload;
        },
        updateHouseholdCount: (state, action: PayloadAction<number>) => {
            state.value.currentHouseholdListCount = action.payload;
        },
        updateCurrentCenter: (state, action: PayloadAction<CurrentCenterState>) => {
            state.value.currentCenter = action.payload;
        },
        updateCurrentZoom: (state, action: PayloadAction<number>) => {
            state.value.currentZoom = action.payload;
        }
    }
})

export const { resetCurrentData, updateSelectedBarangay, updateStructureList, updateStructureListCount, updateHouseholdCount, updateCurrentCenter, updateCurrentZoom } = structureMapProps.actions;
export default structureMapProps.reducer;