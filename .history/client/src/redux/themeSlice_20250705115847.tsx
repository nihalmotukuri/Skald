import { createSlice } from "@reduxjs/toolkit"

const themeSlice = createSlice({
    name: "darkTheme",
    initialState: {
        value: true
    },
    reducers: {
        // Add reducers here if needed, e.g. toggleTheme: (state) => { state.value = !state.value }
    }
})

export default themeSlice