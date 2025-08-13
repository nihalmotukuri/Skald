export interface Note {
    _id?: string;
    firebaseUid: string;
    title: string;
    description: string;
    image: File | null
}