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

export const { toggleSidebar } = sidebarSlice.actions
export default sidebarSlice