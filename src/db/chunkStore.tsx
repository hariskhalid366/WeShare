import { create } from 'zustand';

export interface IncomingItem {
  id: string;
  name: string;
  size: number;
  totalChunks: number;
  receivedChunks: number;
  progress: number; // 0 to 1
  uri?: string;
  available?: boolean;
  mimeType?: string;
}

export interface OutgoingItem {
  id: string;
  name: string;
  size: number;
  progress: number; // 0 to 1
  uri?: string;
  available?: boolean;
  mimeType?: string;
}

interface ChunkStore {
  // Currently receiving file
  chunkStore: IncomingItem | null;
  
  // Currently sending file
  currentChunkSet: OutgoingItem | null;

  // History
  sentFiles: OutgoingItem[];
  receivedFiles: IncomingItem[];

  setChunkStore: (chunkStore: IncomingItem | null) => void;
  resetChunkStore: () => void;
  
  setCurrentChunkSet: (currentChunkSet: OutgoingItem | null) => void;
  resetCurrentChunkSet: () => void;
  
  updateProgress: (progress: number) => void;
  updateOutgoingProgress: (id: string, progress: number) => void;
  
  addSentFile: (file: OutgoingItem) => void;
  addReceivedFile: (file: IncomingItem) => void;
  
  setFileAvailable: (id: string, isSent: boolean) => void;
}

export const useChunkStore = create<ChunkStore>(set => ({
  chunkStore: null,
  currentChunkSet: null,
  sentFiles: [],
  receivedFiles: [],
  
  setChunkStore: chunkStore => set(() => ({ chunkStore })),
  resetChunkStore: () => set(() => ({ chunkStore: null })),
  
  setCurrentChunkSet: currentChunkSet => set(() => ({ currentChunkSet })),
  resetCurrentChunkSet: () => set(() => ({ currentChunkSet: null })),
  
  updateProgress: (progress) => set(state => ({
    chunkStore: state.chunkStore ? { ...state.chunkStore, progress } : null
  })),
  
  updateOutgoingProgress: (id, progress) => set(state => ({
    currentChunkSet: state.currentChunkSet?.id === id 
      ? { ...state.currentChunkSet, progress } 
      : state.currentChunkSet
  })),
  
  addSentFile: (file) => set(state => ({ sentFiles: [...state.sentFiles, file] })),
  addReceivedFile: (file) => set(state => ({ receivedFiles: [...state.receivedFiles, file] })),
  
  setFileAvailable: (id, isSent) => set(state => {
    if (isSent) {
      return {
        sentFiles: state.sentFiles.map(f => f.id === id ? { ...f, available: true } : f)
      };
    } else {
      return {
        receivedFiles: state.receivedFiles.map(f => f.id === id ? { ...f, available: true } : f)
      };
    }
  }),
}));
