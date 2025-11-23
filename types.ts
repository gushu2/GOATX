export interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface VaultData {
  code: string;
  notes: Note[];
  lastAccess: number;
}

export enum ViewState {
  LOCKED = 'LOCKED',
  VAULT = 'VAULT',
}

export interface AIResponse {
  text: string;
  error?: string;
}