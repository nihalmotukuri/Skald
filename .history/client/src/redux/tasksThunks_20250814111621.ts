import type { RootState } from './store'
import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Task } from '../types/task.ts'

export const fetchTasks = createAsyncThunk(
    'tasksSlice/fetchTasks',
    async (_, thunkAPI) => {
        const state = thunkAPI.getState() as RootState
        const firebaseUid = state.userStore.user?.firebaseUid
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks/${firebaseUid}`)
        return res.data
    }
)

export const addTask = createAsyncThunk(
    'tasksSlice/addTask',
    async (newTask: Task) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/tasks`, newTask)
        return res.data
    }
)

export const editTask = createAsyncThunk(
    'tasksSlice/editTask',
    async (editedTask: Task) => {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${editedTask._id}`, editedTask)
        return res.data
    }
)

export const deleteTask = createAsyncThunk(
    'tasksSlice/deleteTask',
    async (taskId: string) => {
        const res = await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`)
        return {taskId, ...res.data}
    }
)

export const removeTaskListInTask = createAsyncThunk(
    'tasksSlice/removeTaskListInTask',
    async (taskList: string, thunkApi) => {
        const state = thunkApi.getState() as RootState
        const firebaseUid = state.userStore.user?.firebaseUid
        
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/tasks/remove_tasklist`, {
            firebaseUid,
            taskList
        })
    }
)