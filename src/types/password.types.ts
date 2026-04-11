export type PasswordEntry = {
  id: string;
  site: string;
  username: string;
  password: string;
  createdAt: number;
  updatedAt: number;
};

export type VaultLockState = 'setup-required' | 'locked' | 'unlocked';

export type PendingPasswordDraft = {
  site: string;
  username: string;
  password: string;
} | null;
