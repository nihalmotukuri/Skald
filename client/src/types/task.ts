export interface Task {
    _id?: string;
    title?: string;
    description?: string;
    date?: string;
    time?: string;
    priority?: string;
    status?: string;
    taskList?: string;
    taskListId?: string | null;
    completed?: boolean;
    completedAt?: Date | null;
}