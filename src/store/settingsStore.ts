import { create } from 'zustand';

import { getStoredItem, setStoredItem } from '../utils/storage';
import { getStoredNotesPin, setStoredNotesPin } from '../utils/secure';

const SETTINGS_STORAGE_KEY = 'utilz-settings';

export type ThemePreference = 'auto' | 'light' | 'dark';
export type FontPreference = 'inter' | 'system' | 'serif';
export type LanguagePreference = 'en' | 'fr' | 'es';

type StoredSettings = {
  themePreference: ThemePreference;
  fontPreference: FontPreference;
  languagePreference: LanguagePreference;
  notesProtectionEnabled: boolean;
};

type SettingsStore = StoredSettings & {
  hydrated: boolean;
  hasNotesPin: boolean;
  notesUnlocked: boolean;
  hydrate: () => Promise<void>;
  setThemePreference: (value: ThemePreference) => Promise<void>;
  setFontPreference: (value: FontPreference) => Promise<void>;
  setLanguagePreference: (value: LanguagePreference) => Promise<void>;
  setNotesProtectionEnabled: (value: boolean) => Promise<void>;
  saveNotesPin: (pin: string) => Promise<void>;
  unlockNotes: (pin: string) => Promise<boolean>;
  lockNotes: () => void;
};

const defaultSettings: StoredSettings = {
  themePreference: 'auto',
  fontPreference: 'inter',
  languagePreference: 'en',
  notesProtectionEnabled: false,
};

async function persistSettings(settings: StoredSettings) {
  await setStoredItem(SETTINGS_STORAGE_KEY, settings);
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaultSettings,
  hydrated: false,
  hasNotesPin: false,
  notesUnlocked: true,
  hydrate: async () => {
    const stored = await getStoredItem<Partial<StoredSettings>>(
      SETTINGS_STORAGE_KEY,
      defaultSettings,
    );
    const pin = await getStoredNotesPin();
    const normalized: StoredSettings = {
      themePreference: stored.themePreference ?? defaultSettings.themePreference,
      fontPreference: stored.fontPreference ?? defaultSettings.fontPreference,
      languagePreference:
        stored.languagePreference ?? defaultSettings.languagePreference,
      notesProtectionEnabled:
        stored.notesProtectionEnabled ?? defaultSettings.notesProtectionEnabled,
    };

    set({
      ...normalized,
      hydrated: true,
      hasNotesPin: Boolean(pin),
      notesUnlocked: !normalized.notesProtectionEnabled,
    });
  },
  setThemePreference: async (value) => {
    const next = { ...get(), themePreference: value };
    set({ themePreference: value });
    await persistSettings({
      themePreference: next.themePreference,
      fontPreference: next.fontPreference,
      languagePreference: next.languagePreference,
      notesProtectionEnabled: next.notesProtectionEnabled,
    });
  },
  setFontPreference: async (value) => {
    const next = { ...get(), fontPreference: value };
    set({ fontPreference: value });
    await persistSettings({
      themePreference: next.themePreference,
      fontPreference: next.fontPreference,
      languagePreference: next.languagePreference,
      notesProtectionEnabled: next.notesProtectionEnabled,
    });
  },
  setLanguagePreference: async (value) => {
    const next = { ...get(), languagePreference: value };
    set({ languagePreference: value });
    await persistSettings({
      themePreference: next.themePreference,
      fontPreference: next.fontPreference,
      languagePreference: next.languagePreference,
      notesProtectionEnabled: next.notesProtectionEnabled,
    });
  },
  setNotesProtectionEnabled: async (value) => {
    const next = { ...get(), notesProtectionEnabled: value };
    set({
      notesProtectionEnabled: value,
      notesUnlocked: !value,
    });
    await persistSettings({
      themePreference: next.themePreference,
      fontPreference: next.fontPreference,
      languagePreference: next.languagePreference,
      notesProtectionEnabled: next.notesProtectionEnabled,
    });
  },
  saveNotesPin: async (pin) => {
    await setStoredNotesPin(pin);
    set({
      hasNotesPin: true,
      notesProtectionEnabled: true,
      notesUnlocked: true,
    });
    const next = { ...get(), notesProtectionEnabled: true };
    await persistSettings({
      themePreference: next.themePreference,
      fontPreference: next.fontPreference,
      languagePreference: next.languagePreference,
      notesProtectionEnabled: true,
    });
  },
  unlockNotes: async (pin) => {
    const storedPin = await getStoredNotesPin();
    const isValid = storedPin === pin;

    if (isValid) {
      set({ notesUnlocked: true });
    }

    return isValid;
  },
  lockNotes: () => {
    if (get().notesProtectionEnabled) {
      set({ notesUnlocked: false });
    }
  },
}));
