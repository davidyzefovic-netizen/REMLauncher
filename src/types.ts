export interface GameInfo {
  id: string;
  name: string;
  version: string;
  size: string;
  image: string;
  icon: string;
  description: string;
  tags: string[];
  multiplayer: boolean;
}

export interface LibraryGame {
  id: string;
  game: GameInfo;
  isInstalled: boolean;
  downloadStatus: 'none' | 'downloading' | 'extracting' | 'installed' | 'error';
  progress: number;
}

export interface DownloadState {
  id: string;
  status: 'none' | 'downloading' | 'extracting' | 'installed' | 'error';
  progress: number;
  error?: string;
}
