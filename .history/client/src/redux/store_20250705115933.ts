import { configureStore } from "@reduxjs/toolkit";
import sidebarSlice from "./sidebarSlice";
import 

const store = configureStore({
    reducer: {
        sidebarStore: sidebarSlice.reducer,
        themeStore: 
    }
})

export default store