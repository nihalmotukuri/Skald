import { createSlice } from "@reduxjs/toolkit"

const themeSlice = createSlice({
    name: "darkTheme",
    initialState: {
        value: true
    },
    reducers: {
        toggleTheme: (state) => { state.value = !state.value }
    }
})

export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer