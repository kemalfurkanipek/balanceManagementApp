import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    list: [],
};

const couponsSlice = createSlice({
    name: "coupons",
    initialState,
    reducers: {
        addCoupon: (state, action) => {
            state.list.push(action.payload);
        },
    },
});

export const { addCoupon } = couponsSlice.actions;
export default couponsSlice.reducer;
