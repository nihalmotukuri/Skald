import { createSlice } from '@reduxjs/toolkit'

const breadcrumbSlice = createSlice({
    name: "breadcrumb",
    initialState: "Dashboard",
    reducers: {
        setBreadcrumb: (state, action) => action.payloa
    }
})

export const { setBreadcrumb } = breadcrumbSlice.actions
export default breadcrumbSlice