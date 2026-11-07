export interface Note {
    _id?: string;
    userId?: string;
    title: string;
    description: string;
    image: File | string | null;
    imagePath?: string | null;
    createdAt?: string;
    updatedAt?: string;
    pinned?: boolean;
    color?: 'default' | 'rose' | 'amber' | 'sage' | 'blue' | 'violet';
    fontFamily?: 'sans' | 'serif' | 'mono';
    reminderAt?: string | null;
    archivedAt?: string | null;
    imageAttachments?: NoteImageAttachment[];
}

export interface NoteImageAttachment {
    id: string;
    path?: string;
    url?: string;
    file?: File;
    width: number;
}