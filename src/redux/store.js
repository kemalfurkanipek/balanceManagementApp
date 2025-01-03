import { configureStore } from "@reduxjs/toolkit";
import balancesReducer from "./slices/balancesSlice";
import couponsReducer from "./slices/couponsSlice";
import userReducer from "./slices/userSlice";
import languageReducer from "./slices/languageSlice";
const store = configureStore({
    reducer: {
        balances: balancesReducer,
        coupons: couponsReducer,
        user: userReducer,
        language: languageReducer,
    },
});

export default store;
