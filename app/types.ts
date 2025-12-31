export interface Pictogram {
  id: number;
  keywords: string[];
  backgroundColor: string; // Hex code mapping to semantic category
  url: string; // ARASAAC URL
  text: string; // Display text
}

export interface UserSettings {
  language: string;
  voiceGender: 'male' | 'female';
  gridSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  username: string;
  themeColor: string;
}

export enum AppView {
  LOGIN = 'LOGIN',
  WIZARD = 'WIZARD',
  DASHBOARD = 'DASHBOARD',
  GAMES = 'GAMES',
  SETTINGS = 'SETTINGS'
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: any;
}

export interface AgentResponse {
  text: string;
  action?: 'SHOW_PICTOGRAMS';
  keywords?: string[];
  mapData?: {
    uri: string;
    title: string;
  };
}