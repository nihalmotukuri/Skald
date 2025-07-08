import { createSlice } from '@reduxjs/toolkit'

const breadcrumbSlice = createSlice({
    name: "breadcrumb",
    initialState: "Dashboard",
    reducers: {
        setBreadcrumb: (state, action) => {}
    }
})

export const { setBreadcrumb } = breadcrumbSlice.actions
export default breadcrumbSlice