import { useEffect, useMemo } from 'react';

import { router } from 'expo-router';

import { useSettingsStore } from '../store/settingsStore';

export function useNotesProtection(
  nextPathname: '/more/notes' | '/more/note-editor',
  params?: Record<string, string | undefined>,
) {
  const hydrated = useSettingsStore((state) => state.hydrated);
  const protectionEnabled = useSettingsStore(
    (state) => state.notesProtectionEnabled,
  );
  const notesUnlocked = useSettingsStore((state) => state.notesUnlocked);

  const isAllowed = useMemo(
    () => hydrated && (!protectionEnabled || notesUnlocked),
    [hydrated, notesUnlocked, protectionEnabled],
  );

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (protectionEnabled && !notesUnlocked) {
      router.replace({
        pathname: '/more/notes-unlock',
        params: {
          next: nextPathname,
          ...params,
        },
      });
    }
  }, [hydrated, nextPathname, notesUnlocked, params, protectionEnabled]);

  return isAllowed;
}
