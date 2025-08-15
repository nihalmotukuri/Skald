import { createSlice } from "@reduxjs/toolkit"

const themeSlice = createSlice({
    name: "darkTheme",
    initialState: {
        isDark: true
    },
    reducers: {
        toggleTheme: (state, action) => { state.isDark = !state.isDark }
    }
})

export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer