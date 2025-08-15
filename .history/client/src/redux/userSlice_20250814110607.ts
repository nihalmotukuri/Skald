import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createUser, addTaskList, removeTaskList } from './userThunks'
import type { User } from '@/types/user.ts'

interface UserState {
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  user: null,
  loading: true,
  error: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    clearUser: (state) => {
      state.user = null
    },
    setUserLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? null
      })
      .addCase(addTaskList.fulfilled, (state, action) => {
        state.user?.taskList.push(action.payload.newTaskList)
      })
      .addCase(removeTaskList.fulfilled, (state, action) => {
        const updateTaskList = state.user?.taskList.filter(tL => action.payload.)
      })
  }
})

export const { setUser, clearUser, setUserLoading } = userSlice.actions
export default userSlice.reducer
