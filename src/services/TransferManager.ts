import { Buffer } from 'buffer';
import { Protocol, PacketType, HEADER_SIZE } from './Protocol';
import { useChunkStore } from '../db/chunkStore';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export class TransferManager {
  private socket: any;
  private buffer: Buffer = Buffer.alloc(0);
  private currentFileHandle: string | null = null;
  private currentFileSize: number = 0;
  private receivedBytes: number = 0;
  private isServer: boolean = false;

  constructor(socket: any, isServer: boolean) {
    this.socket = socket;
    this.isServer = isServer;
    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('data', (data: any) => {
      const chunk = typeof data === 'string' ? Buffer.from(data) : data;
      this.handleData(chunk);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    this.socket.on('close', () => {
      console.log('Socket closed');
    });
  }

  private handleData(data: Buffer) {
    this.buffer = Buffer.concat([this.buffer, data]);

    while (this.buffer.length >= HEADER_SIZE) {
      const header = Protocol.parseHeader(this.buffer);
      if (!header) break;

      if (this.buffer.length < HEADER_SIZE + header.length) {
        break;
      }

      const payload = this.buffer.slice(HEADER_SIZE, HEADER_SIZE + header.length);
      this.processPacket(header.type, payload);
      
      this.buffer = this.buffer.slice(HEADER_SIZE + header.length);
    }
  }

  private async processPacket(type: PacketType, payload: Buffer) {
    switch (type) {
      case PacketType.HANDSHAKE:
        const deviceInfo = JSON.parse(payload.toString());
        console.log('Connected to:', deviceInfo.name);
        break;

      case PacketType.METADATA:
        const metadata = JSON.parse(payload.toString());
        await this.handleMetadata(metadata);
        break;

      case PacketType.CHUNK:
        await this.handleChunk(payload);
        break;

      case PacketType.ACK:
        break;
        
      case PacketType.END:
        await this.handleEnd();
        break;
    }
  }

  private async handleMetadata(metadata: any) {
    const { name, size, id } = metadata;
    this.currentFileSize = size;
    this.receivedBytes = 0;
    
    const platformPath = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.DownloadDirectoryPath;
    const filePath = `${platformPath}/${name}`;
    
    await RNFS.writeFile(filePath, '', 'base64');
    this.currentFileHandle = filePath;
    
    const incomingItem = {
      id,
      name,
      size,
      totalChunks: Math.ceil(size / (1024 * 64)),
      receivedChunks: 0,
      progress: 0,
      uri: filePath,
      available: false,
    };

    useChunkStore.getState().setChunkStore(incomingItem);
    useChunkStore.getState().addReceivedFile(incomingItem);
    
    this.sendPacket(PacketType.ACK, Buffer.from(id));
  }

  private async handleChunk(chunk: Buffer) {
    if (!this.currentFileHandle) return;

    try {
      await RNFS.appendFile(this.currentFileHandle, chunk.toString('base64'), 'base64');
      this.receivedBytes += chunk.length;
      
      const progress = this.receivedBytes / this.currentFileSize;
      useChunkStore.getState().updateProgress(progress);
    } catch (err) {
      console.error('Error writing chunk:', err);
    }
  }

  private async handleEnd() {
    console.log('File transfer complete');
    const currentStore = useChunkStore.getState().chunkStore;
    if (currentStore) {
      useChunkStore.getState().setFileAvailable(currentStore.id, false);
    }
    
    this.currentFileHandle = null;
    this.receivedBytes = 0;
    useChunkStore.getState().resetChunkStore();
  }

  public sendPacket(type: PacketType, payload: Buffer) {
    const packet = Protocol.serialize(type, payload);
    this.socket.write(packet);
  }

  public async sendFile(file: any) {
    const normalizePath = Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;
    const stats = await RNFS.stat(normalizePath);
    
    const id = file.id || Date.now().toString();
    const metadata = {
      id,
      name: file.name || file.fileName,
      size: stats.size,
    };

    const outgoingItem = {
      id,
      name: metadata.name,
      size: metadata.size,
      progress: 0,
      uri: file.uri,
      available: false,
    };

    useChunkStore.getState().setCurrentChunkSet(outgoingItem);
    useChunkStore.getState().addSentFile(outgoingItem);

    this.sendPacket(PacketType.METADATA, Buffer.from(JSON.stringify(metadata)));

    const CHUNK_SIZE = 1024 * 64;
    let offset = 0;
    
    while (offset < stats.size) {
      const chunkBase64 = await RNFS.read(normalizePath, CHUNK_SIZE, offset, 'base64');
      const chunk = Buffer.from(chunkBase64, 'base64');
      this.sendPacket(PacketType.CHUNK, chunk);
      offset += chunk.length;
      
      useChunkStore.getState().updateOutgoingProgress(metadata.id, offset / stats.size);
      
      await new Promise(r => setTimeout(() => r(null), 2));
    }

    this.sendPacket(PacketType.END, Buffer.alloc(0));
    useChunkStore.getState().setFileAvailable(id, true);
    useChunkStore.getState().resetCurrentChunkSet();
  }
}
