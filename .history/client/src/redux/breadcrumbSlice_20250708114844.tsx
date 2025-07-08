import { createSlice } from '@reduxjs/toolkit'

const breadcrumbSlice = createSlice({
    name: "breadcrumb",
    initialState: "Dashboard",
    reducers: {
        setBreadcrumb
    }
})

export const { } = breadcrumbSlice.actions
export default breadcrumbSlice