import * as SecureStore from 'expo-secure-store';

const NOTES_PIN_KEY = 'utilz-notes-pin';
const VAULT_PIN_KEY = 'utilz-vault-pin';
const VAULT_ENTRIES_KEY = 'utilz-vault-entries';

export async function getStoredNotesPin() {
  return SecureStore.getItemAsync(NOTES_PIN_KEY);
}

export async function setStoredNotesPin(pin: string) {
  await SecureStore.setItemAsync(NOTES_PIN_KEY, pin);
}

export async function deleteStoredNotesPin() {
  await SecureStore.deleteItemAsync(NOTES_PIN_KEY);
}

async function getSecureJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function setSecureJson<T>(key: string, value: T) {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

export async function getStoredVaultPin() {
  return SecureStore.getItemAsync(VAULT_PIN_KEY);
}

export async function setStoredVaultPin(pin: string) {
  await SecureStore.setItemAsync(VAULT_PIN_KEY, pin);
}

export async function deleteStoredVaultPin() {
  await SecureStore.deleteItemAsync(VAULT_PIN_KEY);
}

export async function getStoredVaultEntries<T>(fallback: T) {
  return getSecureJson(VAULT_ENTRIES_KEY, fallback);
}

export async function setStoredVaultEntries<T>(entries: T) {
  await setSecureJson(VAULT_ENTRIES_KEY, entries);
}
