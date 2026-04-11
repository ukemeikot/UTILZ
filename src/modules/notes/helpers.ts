import * as FileSystem from 'expo-file-system/legacy';

import type { NoteCategory, NoteItem } from '../../types/notes.types';

export const noteCategories: Array<{
  key: NoteCategory;
  label: string;
}> = [
  { key: 'personal', label: 'Personal' },
  { key: 'work', label: 'Work' },
  { key: 'ideas', label: 'Ideas' },
];

export const noteFilterCategories: Array<{
  key: 'all' | NoteCategory;
  label: string;
}> = [{ key: 'all', label: 'All' }, ...noteCategories];

export function formatNoteDate(value: number) {
  return new Date(value).toLocaleString([], {
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatEditorDate(value: number) {
  return new Date(value).toLocaleString([], {
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDuration(durationMillis?: number | null) {
  const totalSeconds = Math.floor((durationMillis ?? 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function getNoteExcerpt(note: NoteItem) {
  const fallback = note.audioUri
    ? 'Voice note attached.'
    : note.imageUri
      ? 'Image note attached.'
      : 'Open note to continue writing.';

  return (note.body.trim() || fallback).slice(0, 140);
}

export function getCategoryLabel(category: NoteCategory) {
  return noteCategories.find((item) => item.key === category)?.label ?? 'Personal';
}

export function mergeTranscript(existingText: string, transcript: string) {
  const trimmedExisting = existingText.trim();
  const trimmedTranscript = transcript.trim();

  if (!trimmedTranscript) {
    return existingText;
  }

  return trimmedExisting
    ? `${trimmedExisting}\n${trimmedTranscript}`
    : trimmedTranscript;
}

export async function persistNoteMedia(uri: string, kind: 'audio' | 'image') {
  if (!FileSystem.documentDirectory || uri.startsWith(FileSystem.documentDirectory)) {
    return uri;
  }

  const extension =
    uri.match(/\.[a-zA-Z0-9]+(?=($|\?))/)?.[0] ??
    (kind === 'audio' ? '.m4a' : '.jpg');
  const target = `${FileSystem.documentDirectory}${kind}-${Date.now()}${extension}`;
  await FileSystem.copyAsync({ from: uri, to: target });
  return target;
}
