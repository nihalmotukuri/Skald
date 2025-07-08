import { createSlice } from "@reduxjs/toolkit"

const sidebarSlice = createSlice({
    name: "sidebarSlice",
    initialState: {
        open: false
    },
    reducers: {
        toggleSibebar: state => { state.open = !state.open }
    }
});

export const { toggleSibebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;