import { createSlice } from "@reduxjs/toolkit"

const sidebarSlice = createSlice({
    name: "open",
    initialState: {
        value: false
    },
    reducers: {
        toggleSidebar: state => { state.open = !state.open }
    }
});

export const { toggleSidebar } = sidebarSlice.actions
export default sidebarSlice