import { createSlice } from "@reduxjs/toolkit"

const sidebarSlice = createSlice({
    name: "open",
    initialState: {
        value: false
    },
    reducers: {
        toggleSidebar: state => { state.value = !state.value }
    }
});

export const { toggleSidebar } = sidebarSlice.actions
export default sidebarSlice