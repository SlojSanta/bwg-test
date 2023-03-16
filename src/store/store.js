import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { dexApi } from "../services/DexService";


const rootReducer = combineReducers({
    [dexApi.reducerPath]: dexApi.reducer
})

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => 
            getDefaultMiddleware().concat(dexApi.middleware)
    })
}
