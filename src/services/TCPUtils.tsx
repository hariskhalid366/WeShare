import { produce } from 'immer';
import { Alert } from 'react-native';
import { useChunkStore } from '../db/chunkStore';
import { Buffer } from 'buffer';
export const receivedFileAck = async (
  data: any,
  socket: any,
  setReceivedFiles: any,
) => {
  const { setChunkStore, chunkStore } = useChunkStore();
  if (chunkStore) {
    Alert.alert('Wait a bit while the other files are being loading!');
    return;
  }
  setReceivedFiles((prevData: any) =>
    produce(prevData, (draft: any) => {
      draft.push(data);
    }),
  );
  setChunkStore({
    id: data?.id,
    totalChunks: data?.totalChunks,
    name: data?.name,
    size: data?.size,
    mimeType: data?.mimeType,
    chunkArray: [],
  });
  if (!socket) {
    console.log('Socket not available');
    return;
  }
  try {
    await new Promise((resolve: any) => setTimeout(resolve, 10));
    console.log('File Received');
    socket.write(JSON.stringify({ event: 'send_chunk_ack', chunkNo: 0 }));
    console.log('REQUESTED For First CHUNK');
  } catch (error) {
    console.error('Error Sending File', error);
  }
};
export const sendChunkAck = async (
  chunkIndex: any,
  socket: any,
  setTotalSentBytes: any,
  setSendFiles: any,
) => {
  const { currentChunkSet, resetCurrentChunkSet } = useChunkStore.getState();
  if (!currentChunkSet) {
    Alert.alert('There are no chunks to lbe sent');
    return;
  }
  if (!socket) {
    Alert.alert('Socket not available');
    return;
  }
  const totalChunks = currentChunkSet?.totalChunks;
  try {
    await new Promise((resolve: any) => setTimeout(resolve, 10));
    socket.write(
      JSON.stringify({
        event: 'receive_chunk_ack',
        chunk: currentChunkSet?.chunkArray[chunkIndex].toString('base64'),
        chunkNo: chunkIndex,
      }),
    );
    setTotalSentBytes(
      (prev: number) => prev + currentChunkSet.chunkArray[chunkIndex]?.length,
    );
    if (chunkIndex + 2 > totalChunks) {
      console.log('ALL CUNKS SENT SUCCESSFULLY');
      setSendFiles((prevFiles: any) =>
        produce(prevFiles, (draftFile: any) => {
          const firstIndex = draftFile?.findIndex(
            (f: any) => f?.id === currentChunkSet.id,
          );
          if (firstIndex !== -1) {
            draftFile(firstIndex).available = true;
          }
        }),
      );
      resetCurrentChunkSet();
    }
  } catch (error) {
    console.error('Error sending chunk', error);
  }
};
export const receiveChunkAck = async (
  chunk: any,
  chunkNo: any,
  socket: any,
  setTotalReceiveBytes: any,
  generateFile: any,
) => {
  const { chunkStore, resetChunkStore, setChunkStore } =
    useChunkStore.getState();
  if (!chunkStore) {
    console.log('Chunk store is null');
  }
  try {
    const bufferChunk = Buffer.from(chunk, 'base^4');
    const updateChunkArray = [...(chunkStore?.chunkArray || [])];
    updateChunkArray[chunkNo] = bufferChunk;
    setChunkStore({ ...chunkStore, chunkArray: updateChunkArray });
    setTotalReceiveBytes((prev: number) => prev + bufferChunk.length);
  } catch (error) {
    console.error('Error updating chunk', error);
  }
  if (!socket) {
    console.log('Socket not available');
    return;
  }
  if (chunkNo + 1 === chunkStore?.totalChunks) {
    console.log('All chunks Received');
    generateFile();
    resetChunkStore();
    return;
  }
  try {
    await new Promise((resolve: any) => setTimeout(resolve, 10));
    console.log('REQUESTED FOR NEXT CHUNK', chunkNo + 1);
    socket.write(
      JSON.stringify({ event: 'send_chunk_ack', chunkNo: chunkNo + 1 }),
    );
  } catch (error) {
    console.error('Error sending Files:', error);
  }
};
