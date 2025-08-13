export interface Task {
    _id?: string;
    firebaseUid?: string;
    title?: string;
    description?: string;
    date?: string;
    time?: string;
    priority?: string;
    status?: string;
    taskList?: string;
    completed?: boolean;
    completedAt?: Date | null;
}