export interface Note {
    _id?: string;
    userId?: string;
    title: string;
    description: string;
    image: File | string | null;
    imagePath?: string | null;
    createdAt?: string;
}