import { createSlice } from "@reduxjs/toolkit"

const themeSlice = createSlice({
    name: "darkTheme",
    initialState: {
        isDark: true
    },
    reducers: {
        toggleTheme: (state, action) => { state.isDark = action.payload }
    }
})

export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer