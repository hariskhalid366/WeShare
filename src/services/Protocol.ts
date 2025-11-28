import { Buffer } from 'buffer';

export enum PacketType {
  HANDSHAKE = 0,
  METADATA = 1,
  CHUNK = 2,
  ACK = 3,
  END = 4,
}

export interface Packet {
  type: PacketType;
  payload: Buffer;
}

export const HEADER_SIZE = 5; // 1 byte type + 4 bytes length

export const Protocol = {
  serialize: (type: PacketType, payload: Buffer): Buffer => {
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32BE(payload.length, 0);
    const typeBuffer = Buffer.alloc(1);
    typeBuffer.writeUInt8(type, 0);
    return Buffer.concat([typeBuffer, lengthBuffer, payload]);
  },

  // Helper to parse header from a buffer
  parseHeader: (buffer: Buffer): { type: PacketType; length: number } | null => {
    if (buffer.length < HEADER_SIZE) return null;
    const type = buffer.readUInt8(0);
    const length = buffer.readUInt32BE(1);
    return { type, length };
  },
};
