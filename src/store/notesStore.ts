import { create } from 'zustand';

import type { NoteCategory, NoteItem } from '../types/notes.types';
import { getStoredItem, setStoredItem } from '../utils/storage';

const NOTES_STORAGE_KEY = 'utilz-notes';

type NotesStore = {
  notes: NoteItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  saveNote: (payload: {
    id?: string;
    title: string;
    body: string;
    category: NoteCategory;
    imageUri?: string | null;
    audioUri?: string | null;
    audioDurationMillis?: number | null;
  }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
};

async function persistNotes(notes: NoteItem[]) {
  await setStoredItem(NOTES_STORAGE_KEY, notes);
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  hydrated: false,
  hydrate: async () => {
    const notes = await getStoredItem<NoteItem[]>(NOTES_STORAGE_KEY, []);
    const normalized = notes.map((note) => ({
      ...note,
      category: note.category ?? 'personal',
      createdAt: note.createdAt ?? note.updatedAt,
      imageUri: note.imageUri ?? null,
      audioUri: note.audioUri ?? null,
      audioDurationMillis: note.audioDurationMillis ?? null,
    }));
    set({ notes: normalized, hydrated: true });
  },
  saveNote: async ({
    id,
    title,
    body,
    category,
    imageUri,
    audioUri,
    audioDurationMillis,
  }) => {
    const existing = get().notes;
    const timestamp = Date.now();
    const existingNote = id ? existing.find((item) => item.id === id) : undefined;
    const note = {
      id: id ?? `${timestamp}-${Math.random()}`,
      title: title.trim() || (audioUri ? 'Voice note' : 'Untitled note'),
      body,
      category,
      createdAt: existingNote?.createdAt ?? timestamp,
      updatedAt: timestamp,
      imageUri: imageUri ?? null,
      audioUri: audioUri ?? null,
      audioDurationMillis: audioDurationMillis ?? null,
    };

    const next = id
      ? [
          note,
          ...existing.filter((item) => item.id !== id),
        ]
      : [note, ...existing];

    set({ notes: next });
    await persistNotes(next);
  },
  deleteNote: async (id) => {
    const next = get().notes.filter((note) => note.id !== id);
    set({ notes: next });
    await persistNotes(next);
  },
}));
