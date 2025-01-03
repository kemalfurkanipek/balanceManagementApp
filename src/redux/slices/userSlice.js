import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    userInfo: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login: (state, action) => {
            state.isAuthenticated = true;
            const { uid, email } = action.payload;
            state.userInfo = { uid, email };
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.userInfo = null;
        },
    },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
