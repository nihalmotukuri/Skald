import { configureStore } from "@reduxjs/toolkit";
import sidebarSlice from "./sidebarSlice";
import themeSlice from "./themeSlice";


interface RootState {
    sidebarStore: {
        open: boolean;
    };
}

const store = configureStore({
    reducer: {
        sidebarStore: sidebarSlice.reducer,
        themeStore: themeSlice.reducer
    }
})

export default store