import { Note, VaultData } from '../types';

const STORAGE_PREFIX = 'rv_vault_';

export const getVault = (code: string): VaultData => {
  const key = `${STORAGE_PREFIX}${code}`;
  const data = localStorage.getItem(key);
  
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse vault data", e);
    }
  }

  // Return new empty vault if none exists
  return {
    code,
    notes: [],
    lastAccess: Date.now(),
  };
};

export const saveVault = (vault: VaultData): void => {
  const key = `${STORAGE_PREFIX}${vault.code}`;
  const updatedVault = {
    ...vault,
    lastAccess: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(updatedVault));
};

export const createNote = (content: string): Note => {
  return {
    id: crypto.randomUUID(),
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: []
  };
};