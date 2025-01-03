

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentLanguage: "tr",
};

const languageSlice = createSlice({
    name: "language",
    initialState,
    reducers: {
        setLanguage: (state, action) => {
            state.currentLanguage = action.payload;
        },
    },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
