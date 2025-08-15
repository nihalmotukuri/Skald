import { createSlice } from "@reduxjs/toolkit"

const themeSlice = createSlice({
    name: "darkTheme",
    initialState: {
        isDark: false
    },
    reducers: {
        toggleTheme: (state) => { state.isDark = !state.isDark }
    }
})

export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer