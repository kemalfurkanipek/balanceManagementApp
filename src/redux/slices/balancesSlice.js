import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    balances: {
        fuel: 1000,
        cash: 2000,
        flight: 500,
        roadPass: 300,
        food: 100,
    },
};

const balancesSlice = createSlice({
    name: "balances",
    initialState,
    reducers: {
        updateBalance: (state, action) => {
            const { balanceType, amount } = action.payload;
            state.balances[balanceType] += amount;
        },
        setBalances: (state, action) => {
            state.balances = { ...action.payload };
        },
    },
});

export const { updateBalance, setBalances } = balancesSlice.actions;
export default balancesSlice.reducer;
