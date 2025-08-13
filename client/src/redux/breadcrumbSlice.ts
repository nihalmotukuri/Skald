import { createSlice } from '@reduxjs/toolkit'

const breadcrumbSlice = createSlice({
    name: "breadcrumb",
    initialState: {
        value: ""
    },
    reducers: {
        setBreadcrumb: (state, action) => {
            state.value = action.payload
        }
    }
})

export const { setBreadcrumb } = breadcrumbSlice.actions
export default breadcrumbSlice.reducer