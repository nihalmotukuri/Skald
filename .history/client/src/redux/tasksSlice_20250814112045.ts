import { createSlice } from '@reduxjs/toolkit'
import { fetchTasks, addTask, editTask, deleteTask, removeTaskListInTask } from './tasksThunks.ts'
import type { Task } from '../types/task.ts'

const tasksSlice = createSlice({
    name: 'tasks',
    initialState: {
        tasks: [] as Task[],
        loading: false,
        error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false
                state.tasks = action.payload
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message ?? null
            })
            .addCase(addTask.fulfilled, (state, action) => {
                state.tasks.push(action.payload)
            })
            .addCase(editTask.fulfilled, (state, action) => {
                const index = state.tasks.findIndex(t => t._id === action.payload._id)
                if (index !== -1) {
                    state.tasks[index] = action.payload
                }
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.tasks = state.tasks.filter(t => t._id !== action.payload.taskId)
            })
            .addCase(removeTaskListInTask.fulfilled, (state, action) => {
                state.tasks = state.tasks.map(t => {
                    if (t.taskList == action.payload.taskList) {
                        t.taskList = ''
                    }
                })
            })
    }
})

export default tasksSlice.reducer