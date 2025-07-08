import { configureStore } from "@reduxjs/toolkit";
import { sidebarSlice from "./sidebarSlice";

const store = configureStore({
    reducer: {
        sidebarStore: sidebarSlice
    }
})

export default store