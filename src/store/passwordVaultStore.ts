import { create } from 'zustand';

import type {
  PasswordEntry,
  PendingPasswordDraft,
  VaultLockState,
} from '../types/password.types';
import {
  getStoredVaultEntries,
  getStoredVaultPin,
  setStoredVaultEntries,
  setStoredVaultPin,
} from '../utils/secure';

type SavePasswordEntryPayload = {
  id?: string;
  site: string;
  username: string;
  password: string;
};

type PasswordVaultStore = {
  entries: PasswordEntry[];
  hydrated: boolean;
  hasPin: boolean;
  lockState: VaultLockState;
  pendingDraft: PendingPasswordDraft;
  selectedEntryId?: string;
  hydrate: () => Promise<void>;
  setPendingDraft: (draft: PendingPasswordDraft) => void;
  clearPendingDraft: () => void;
  setSelectedEntryId: (id?: string) => void;
  saveVaultPin: (pin: string) => Promise<void>;
  verifyVaultPin: (pin: string) => Promise<boolean>;
  lockVault: () => void;
  saveEntry: (payload: SavePasswordEntryPayload) => Promise<PasswordEntry>;
  savePendingDraft: () => Promise<PasswordEntry | null>;
  deleteEntry: (id: string) => Promise<void>;
};

async function persistEntries(entries: PasswordEntry[]) {
  await setStoredVaultEntries(entries);
}

export const usePasswordVaultStore = create<PasswordVaultStore>((set, get) => ({
  entries: [],
  hydrated: false,
  hasPin: false,
  lockState: 'setup-required',
  pendingDraft: null,
  selectedEntryId: undefined,
  hydrate: async () => {
    const [entries, pin] = await Promise.all([
      getStoredVaultEntries<PasswordEntry[]>([]),
      getStoredVaultPin(),
    ]);
    const currentState = get();

    const normalized = entries.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt ?? entry.updatedAt,
    }));

    const nextLockState: VaultLockState = pin
      ? currentState.lockState === 'unlocked'
        ? 'unlocked'
        : 'locked'
      : 'setup-required';

    set({
      entries: normalized,
      hydrated: true,
      hasPin: Boolean(pin),
      lockState: nextLockState,
    });
  },
  setPendingDraft: (draft) => {
    set({ pendingDraft: draft });
  },
  clearPendingDraft: () => {
    set({ pendingDraft: null });
  },
  setSelectedEntryId: (id) => {
    set({ selectedEntryId: id });
  },
  saveVaultPin: async (pin) => {
    await setStoredVaultPin(pin);
    set({
      hasPin: true,
      lockState: 'unlocked',
    });
  },
  verifyVaultPin: async (pin) => {
    const storedPin = await getStoredVaultPin();
    const isValid = storedPin === pin;

    if (isValid) {
      set({ lockState: 'unlocked' });
    }

    return isValid;
  },
  lockVault: () => {
    const hasPin = get().hasPin;
    set({ lockState: hasPin ? 'locked' : 'setup-required' });
  },
  saveEntry: async ({ id, site, username, password }) => {
    const existing = get().entries;
    const timestamp = Date.now();
    const existingEntry = id ? existing.find((entry) => entry.id === id) : undefined;
    const nextEntry: PasswordEntry = {
      id: id ?? `${timestamp}-${Math.random()}`,
      site: site.trim(),
      username: username.trim(),
      password,
      createdAt: existingEntry?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    const next = id
      ? [
          nextEntry,
          ...existing.filter((entry) => entry.id !== id),
        ]
      : [nextEntry, ...existing];

    set({ entries: next });
    await persistEntries(next);
    return nextEntry;
  },
  savePendingDraft: async () => {
    const draft = get().pendingDraft;
    if (!draft) {
      return null;
    }

    const entry = await get().saveEntry(draft);
    set({ pendingDraft: null });
    return entry;
  },
  deleteEntry: async (id) => {
    const next = get().entries.filter((entry) => entry.id !== id);
    set({
      entries: next,
      selectedEntryId: get().selectedEntryId === id ? undefined : get().selectedEntryId,
    });
    await persistEntries(next);
  },
}));
