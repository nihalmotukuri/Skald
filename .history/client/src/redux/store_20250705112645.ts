import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
    reducer: {
        sidebarStore: sidebarSlice.reducer
    }
})

export default store