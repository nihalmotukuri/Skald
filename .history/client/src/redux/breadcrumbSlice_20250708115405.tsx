import { createSlice } from '@reduxjs/toolkit'

const breadcrumbSlice = createSlice({
    name: "breadcrumb",
    initialState: {
        v
    },
    reducers: {
        setBreadcrumb: (state, action) => action.payload
    }
})

export const { setBreadcrumb } = breadcrumbSlice.actions
export default breadcrumbSlice