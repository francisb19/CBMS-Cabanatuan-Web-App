import {configureStore} from '@reduxjs/toolkit';
import structureMapPropsReducer from "./features/structureMap-slice"
import { TypedUseSelectorHook, useSelector } from 'react-redux';

export const store = configureStore({
    reducer:  {
        structureMapPropsReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector:TypedUseSelectorHook<RootState> = useSelector;