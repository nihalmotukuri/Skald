import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Task } from '@/types/task'
import { supabase } from '@/lib/supabase'

type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'
type TaskPriority = 'low' | 'medium' | 'high'

interface TaskRow {
  id: string
  user_id: string
  task_list_id: string | null
  title: string
  description: string
  due_at: string | null
  priority: TaskPriority
  status: TaskStatus
  completed_at: string | null
  created_at: string
}

interface TaskListRow {
  id: string
  name: string
}

export const taskKeys = {
  all: ['tasks'] as const,
  list: (userId: string) => [...taskKeys.all, userId] as const
}

export const taskListKeys = {
  all: ['task-lists'] as const,
  list: (userId: string) => [...taskListKeys.all, userId] as const
}

export const activityKeys = {
  list: (userId: string) => ['task-activity', userId] as const
}

const toLocalDateTime = (value: string | null) => {
  if (!value) return { date: '', time: '' }
  const date = new Date(value)
  const pad = (part: number) => String(part).padStart(2, '0')
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }
}

const toTask = (row: TaskRow, taskListName?: string): Task => ({
  _id: row.id,
  title: row.title,
  description: row.description,
  ...toLocalDateTime(row.due_at),
  priority: row.priority[0].toUpperCase() + row.priority.slice(1),
  status: row.status === 'in_progress'
    ? 'In Progress'
    : row.status[0].toUpperCase() + row.status.slice(1),
  taskList: taskListName ?? '',
  taskListId: row.task_list_id,
  completed: row.status === 'done',
  completedAt: row.completed_at ? new Date(row.completed_at) : null
})

const toTaskStatus = (status?: string): TaskStatus => {
  switch (status?.toLowerCase()) {
    case 'in progress':
    case 'in_progress':
      return 'in_progress'
    case 'done':
      return 'done'
    case 'cancelled':
      return 'cancelled'
    default:
      return 'pending'
  }
}

const toTaskPriority = (priority?: string): TaskPriority => {
  switch (priority?.toLowerCase()) {
    case 'low':
      return 'low'
    case 'high':
      return 'high'
    default:
      return 'medium'
  }
}

const toDueAt = (task: Task) => {
  if (!task.date) return null
  const dueAt = new Date(`${task.date}T${task.time || '00:00'}`)
  if (Number.isNaN(dueAt.getTime())) throw new Error('Enter a valid task due date and time.')
  return dueAt.toISOString()
}

const getTaskListId = async (userId: string, taskListName?: string) => {
  if (!taskListName) return null
  const { data, error } = await supabase
    .from('task_lists')
    .select('id')
    .eq('user_id', userId)
    .eq('name', taskListName)
    .single()
  if (error) throw error
  return data.id
}

const reportMutationError = (action: string) => (error: Error) => {
  console.error(`${action} failed:`, error)
  window.alert(error.message || `${action} failed. Please try again.`)
}

export const useTasks = (userId: string | undefined) => useQuery({
  queryKey: userId ? taskKeys.list(userId) : [...taskKeys.all, 'signed-out'],
  enabled: Boolean(userId),
  queryFn: async () => {
    if (!userId) throw new Error('You must be signed in to manage tasks.')
    const [tasksResult, listsResult] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('task_lists').select('id, name').eq('user_id', userId)
    ])
    if (tasksResult.error) throw tasksResult.error
    if (listsResult.error) throw listsResult.error
    const listNames = new Map((listsResult.data as TaskListRow[]).map((list) => [list.id, list.name]))
    return (tasksResult.data as TaskRow[]).map((task) => toTask(
      task,
      task.task_list_id ? listNames.get(task.task_list_id) : undefined
    ))
  }
})

export const useTaskMutations = (userId: string | undefined) => {
  const queryClient = useQueryClient()
  const invalidateTasks = async () => {
    if (userId) await queryClient.invalidateQueries({ queryKey: taskKeys.list(userId) })
  }

  const addTask = useMutation({
    mutationFn: async (task: Task) => {
      if (!userId) throw new Error('You must be signed in to manage tasks.')
      const taskListId = await getTaskListId(userId, task.taskList)
      const status = toTaskStatus(task.status)
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          task_list_id: taskListId,
          title: task.title?.trim(),
          description: task.description ?? '',
          due_at: toDueAt(task),
          priority: toTaskPriority(task.priority),
          status,
          completed_at: status === 'done' ? new Date().toISOString() : null
        })
        .select('*')
        .single()
      if (error) throw error
      return toTask(data as TaskRow, task.taskList)
    },
    onSuccess: invalidateTasks,
    onError: reportMutationError('Adding task')
  })

  const editTask = useMutation({
    mutationFn: async (task: Task) => {
      if (!userId) throw new Error('You must be signed in to manage tasks.')
      if (!task._id) throw new Error('Cannot update a task without its ID.')
      const status = toTaskStatus(task.status)
      const { data, error } = await supabase
        .from('tasks')
        .update({
          task_list_id: await getTaskListId(userId, task.taskList),
          title: task.title?.trim(),
          description: task.description ?? '',
          due_at: toDueAt(task),
          priority: toTaskPriority(task.priority),
          status,
          completed_at: status === 'done'
            ? (task.completedAt ? new Date(task.completedAt).toISOString() : new Date().toISOString())
            : null
        })
        .eq('id', task._id)
        .eq('user_id', userId)
        .select('*')
        .single()
      if (error) throw error
      return toTask(data as TaskRow, task.taskList)
    },
    onSuccess: invalidateTasks,
    onError: reportMutationError('Updating task')
  })

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      if (!userId) throw new Error('You must be signed in to manage tasks.')
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId)
        .select('id')
        .single()
      if (error) throw error
    },
    onSuccess: invalidateTasks,
    onError: reportMutationError('Deleting task')
  })

  return { addTask, editTask, deleteTask }
}

export const useTaskLists = (userId: string | undefined) => useQuery({
  queryKey: userId ? taskListKeys.list(userId) : [...taskListKeys.all, 'signed-out'],
  enabled: Boolean(userId),
  queryFn: async () => {
    if (!userId) throw new Error('You must be signed in to manage task lists.')
    const { data, error } = await supabase
      .from('task_lists')
      .select('id, name')
      .eq('user_id', userId)
      .order('created_at')
    if (error) throw error
    return data as TaskListRow[]
  }
})

export const useTaskListMutations = (userId: string | undefined) => {
  const queryClient = useQueryClient()
  const invalidateLists = async () => {
    if (!userId) return
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: taskListKeys.list(userId) }),
      queryClient.invalidateQueries({ queryKey: taskKeys.list(userId) })
    ])
  }

  const addTaskList = useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error('You must be signed in to create a task list.')
      const normalizedName = name.trim()
      if (!normalizedName) throw new Error('Enter a name for the task list.')
      const { error } = await supabase.from('task_lists').insert({ user_id: userId, name: normalizedName })
      if (error) throw error
    },
    onSuccess: invalidateLists,
    onError: reportMutationError('Creating task list')
  })

  const deleteTaskList = useMutation({
    mutationFn: async (listId: string) => {
      if (!userId) throw new Error('You must be signed in to remove a task list.')
      const { error } = await supabase
        .from('task_lists')
        .delete()
        .eq('user_id', userId)
        .eq('id', listId)
        .select('id')
        .single()
      if (error) throw error
    },
    onSuccess: invalidateLists,
    onError: reportMutationError('Deleting task list')
  })

  return { addTaskList, deleteTaskList }
}

export const useTaskActivity = (userId: string | undefined) => useQuery({
  queryKey: userId ? activityKeys.list(userId) : [...activityKeys.list('signed-out')],
  enabled: Boolean(userId),
  queryFn: async () => {
    if (!userId) return []
    const activitySince = new Date()
    activitySince.setMonth(activitySince.getMonth() - 6)
    const { data, error } = await supabase
      .from('tasks')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'done')
      .gte('completed_at', activitySince.toISOString())
    if (error) throw error
    const counts = new Map<string, number>()
    for (const task of data) {
      if (!task.completed_at) continue
      const date = task.completed_at.slice(0, 10)
      counts.set(date, (counts.get(date) ?? 0) + 1)
    }
    return [...counts].map(([_id, count]) => ({ _id, count }))
  }
})
