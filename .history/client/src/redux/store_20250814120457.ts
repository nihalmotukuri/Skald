import { configureStore } from "@reduxjs/toolkit";
import sidebarSlice from "./sidebarSlice.ts";
import themeSlice from "./themeSlice.ts";
import breadcrumbSlice from "./breadcrumbSlice.ts";
import tasksReducer from "./tasksSlice.ts"
import notesReducer from "./notesSlice.ts"
import userReducer from "./userSlice.ts"

const store = configureStore({
    reducer: {
        sidebarStore: sidebarSlice,
        themeStore: themeRedu,
        breadcrumbStore: breadcrumbSlice,
        tasksStore: tasksReducer,
        notesStore: notesReducer,
        userStore: userReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch; 

export default store