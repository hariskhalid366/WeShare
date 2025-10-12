// // stores/chunkStore.ts
// import { Buffer } from 'buffer';
// import { create } from 'zustand';

// interface OutgoingItem {
//   id: string;
//   name: string;
//   size?: number;
//   uri?: string;
//   totalChunks: number;
//   sentChunks: number; // how many chunks have been sent
//   progress: number; // 0..1
//   mimeType?: string;
// }

// interface IncomingItem {
//   id: string;
//   name: string;
//   size?: number;
//   totalChunks: number | null;
//   chunkArray: Buffer[];
//   receivedChunks: number;
//   progress: number;
//   mimeType?: string;
//   available?: boolean;
// }

// interface ChunkStoreState {
//   // receiver state (file currently being assembled)
//   chunkStore: IncomingItem | null;

//   // current file being SENT (holds chunkArray and metadata)
//   currentChunkSet: {
//     id: string | null;
//     totalChunks: number;
//     chunkArray: Buffer[];
//     sentChunks: number;
//   } | null;

//   // queue of files to send
//   outgoingQueue: OutgoingItem[];

//   // helper setters
//   setChunkStore: (chunkStore: IncomingItem | null) => void;
//   resetChunkStore: () => void;

//   setCurrentChunkSet: (currentChunkSet: any) => void;
//   resetCurrentChunkSet: () => void;

//   enqueueOutgoing: (item: OutgoingItem) => void;
//   dequeueOutgoing: () => OutgoingItem | null;
//   updateOutgoingProgress: (id: string, sentChunks: number) => void;
//   clearOutgoingQueue: () => void;
// }

// export const useChunkStore = create<ChunkStoreState>(set => ({
//   chunkStore: null,
//   currentChunkSet: null,
//   outgoingQueue: [],

//   setChunkStore: chunkStore => set(() => ({ chunkStore })),
//   resetChunkStore: () => set(() => ({ chunkStore: null })),

//   setCurrentChunkSet: currentChunkSet => set(() => ({ currentChunkSet })),
//   resetCurrentChunkSet: () => set(() => ({ currentChunkSet: null })),

//   enqueueOutgoing: item =>
//     set(state => ({ outgoingQueue: [...state.outgoingQueue, item] })),

//   dequeueOutgoing: () => {
//     let dequeued: OutgoingItem | null = null;
//     set(state => {
//       const [first, ...rest] = state.outgoingQueue;
//       dequeued = first ?? null;
//       return { outgoingQueue: rest };
//     });
//     return dequeued;
//   },

//   updateOutgoingProgress: (id, sentChunks) =>
//     set(state => ({
//       outgoingQueue: state.outgoingQueue.map(q =>
//         q.id === id
//           ? {
//               ...q,
//               sentChunks,
//               progress: q.totalChunks ? sentChunks / q.totalChunks : 0,
//             }
//           : q,
//       ),
//     })),

//   clearOutgoingQueue: () => set(() => ({ outgoingQueue: [] })),
// }));

import { Buffer } from 'buffer';
import { create } from 'zustand';
interface ChunkStore {
  chunkStore: {
    id: string | null;
    name: string;
    totalChunks: number | null;
    chunkArray: Buffer[];
  } | null;
  currentChunkSet: {
    id: string | null;
    totalChunks: number;
    chunkArray: Buffer[];
  } | null;
  setChunkStore: (chunkStore: any) => void;
  resetChunkStore: () => void;
  setCurrentChunkSet: (currentChunkSet: any) => void;
  resetCurrentChunkSet: () => void;
}
export const useChunkStore = create<ChunkStore>(set => ({
  chunkStore: null,
  currentChunkSet: null,
  setChunkStore: chunkStore => set(() => ({ chunkStore })),
  resetChunkStore: () => set(() => ({ chunkStore: null })),
  setCurrentChunkSet: currentChunkSet => set(() => ({ currentChunkSet })),
  resetCurrentChunkSet: () => set(() => ({ currentChunkSet: null })),
}));
