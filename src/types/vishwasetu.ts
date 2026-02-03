
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface TranscriptionEntry {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppState {
  SETUP = 'SETUP',
  SESSION = 'SESSION',
  ERROR = 'ERROR'
}
