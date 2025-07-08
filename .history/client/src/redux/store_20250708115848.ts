import { configureStore } from "@reduxjs/toolkit";
import sidebarSlice from "./sidebarSlice";
import themeSlice from "./themeSlice";
import type breadcrumbSlice from "./breadcrumbSlice";

const store = configureStore({
    reducer: {
        sidebarStore: sidebarSlice.reducer,
        themeStore: themeSlice.reducer,
        breadcrumbSlice: themeSlice.reducer
    }
})

export default store