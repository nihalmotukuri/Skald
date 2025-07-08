import { configureStore } from "@reduxjs/toolkit";
import sidebarSlice from "./sidebarSlice";
import themeSlice from "./themeSlice";
import breadcrumbSlice from "./breadcrumbSlice";

const store = configureStore({
    reducer: {
        sidebarStore: sidebarSlice.reducer,
        themeStore: themeSlice.reducer,
        breadcrumbSlice: breadcrumbSlice.reducer
    }
})

export default store