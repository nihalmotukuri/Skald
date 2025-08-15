import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { RootState } from './store'

export const createUser = createAsyncThunk(
  'userSlice/createUser',
  async (idToken: string) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/firebase`, { idToken })
    return res.data
  }
)

export const addTaskList = createAsyncThunk(
  'userSlice/addTaskList',
  async (newTaskList: string, thunkApi) => {
    const state = thunkApi.getState() as RootState
    const firebaseUid = state.userStore.user?.firebaseUid
    const res = await axios.put(`${import.meta.env.VITE_API_URL}/user/add_taskList`, {
      firebaseUid,
      newTaskList
    })
    return res.data
  }
)

export const removeTaskList = createAsyncThunk(
  'userSlice/removeTaskList',
  async (taskListToRemove: string, thunkApi) => {
    const state = thunkApi.getState() as RootState 
    const firebaseUid = state.
  }
)