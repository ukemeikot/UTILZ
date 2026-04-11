export type NoteCategory = 'personal' | 'work' | 'ideas';

export type NoteItem = {
  id: string;
  title: string;
  body: string;
  category: NoteCategory;
  createdAt: number;
  updatedAt: number;
  imageUri?: string | null;
  audioUri?: string | null;
  audioDurationMillis?: number | null;
};
