export type TaskPriorityPreference = 'Low' | 'Medium' | 'High'
export type TaskViewPreference = 'all' | 'active' | 'today' | 'upcoming' | 'overdue' | 'completed'

export interface WorkspacePreferences {
  defaultTaskPriority: TaskPriorityPreference
  defaultTaskView: TaskViewPreference
}

const storageKey = 'skald_workspace_preferences'

const isTaskPriority = (value: unknown): value is TaskPriorityPreference =>
  value === 'Low' || value === 'Medium' || value === 'High'

const isTaskView = (value: unknown): value is TaskViewPreference =>
  value === 'all' || value === 'active' || value === 'today'
  || value === 'upcoming' || value === 'overdue' || value === 'completed'

export const getWorkspacePreferences = (): WorkspacePreferences => {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return { defaultTaskPriority: 'Medium', defaultTaskView: 'all' }
    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null) {
      return { defaultTaskPriority: 'Medium', defaultTaskView: 'all' }
    }
    const preferences = parsed as Record<string, unknown>
    return {
      defaultTaskPriority: isTaskPriority(preferences.defaultTaskPriority) ? preferences.defaultTaskPriority : 'Medium',
      defaultTaskView: isTaskView(preferences.defaultTaskView) ? preferences.defaultTaskView : 'all',
    }
  } catch (error) {
    console.error('Unable to read workspace preferences:', error)
    return { defaultTaskPriority: 'Medium', defaultTaskView: 'all' }
  }
}

export const saveWorkspacePreferences = (preferences: WorkspacePreferences) => {
  localStorage.setItem(storageKey, JSON.stringify(preferences))
}
