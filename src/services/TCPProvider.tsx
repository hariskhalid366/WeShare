import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useChunkStore } from '../db/chunkStore';
import TCPSocket from 'react-native-tcp-socket';
import DeviceInfo from 'react-native-device-info';
import { Alert, Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import RNFS from 'react-native-fs';
import { receiveChunkAck, receivedFileAck, sendChunkAck } from './TCPUtils';

interface TCPContextType {
  server: any;
  client: any;
  isConnected: boolean;
  connectedDevices: any;
  sentFiles: any[];
  receivedFiles: any[];
  totalSentBytes: number;
  totalReceiveBytes: number;
  startServer: (port: number) => void;
  connectToServer: (host: string, port: number, deviceName: string) => void;
  sendMessage: (message: string | Buffer) => void;
  disconnect: () => void;
  sendFileAck: (file: any, type: 'file' | 'image' | 'video' | 'apk') => void;
}

const TCPContext = createContext<TCPContextType | undefined>(undefined);

export const useTCP = (): TCPContextType => {
  const context = useContext(TCPContext);
  if (!context) {
    throw new Error('useTCP must be used inside the TCPProvider');
  }
  return context;
};

const option = {
  keystore: require('../tls_certs/server-keystore.p12'),
};

export const TCPProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // === STATES ===
  const [server, setServer] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedDevices, setConnectedDevices] = useState<any>(null);
  const [sentFiles, setSentFiles] = useState<any[]>([]);
  const [serverSocket, setServerSocket] = useState<any>(null);
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [totalSentBytes, setTotalSentBytes] = useState<number>(0);
  const [totalReceiveBytes, setTotalReceiveBytes] = useState<number>(0);

  const { setChunkStore, currentChunkSet, setCurrentChunkSet } =
    useChunkStore();

  // Disconnect
  const disconnect = () => {
    if (client) {
      client.destroy();
    }
    if (server) {
      server.close();
    }
    setReceivedFiles([]);
    setSentFiles([]);
    setCurrentChunkSet(null);
    setTotalReceiveBytes(0);
    setChunkStore(null);
    setIsConnected(false);
    console.log('disconnect called');
  };

  // === EMPTY FUNCTIONS ===
  const startServer = useCallback(
    (port: number) => {
      if (server) {
        console.log('Server Already Running On Port ' + port);
        return;
      }
      const newServer = TCPSocket.createTLSServer(option, socket => {
        console.log('Client Connected', socket.address());
        setServerSocket(socket);
        socket.setNoDelay(true);
        socket.readableHighWaterMark = 1024 * 1024 * 1;
        socket.writableHighWaterMark = 1024 * 1024 * 1;

        socket.on('data', async data => {
          const parseData = await JSON.parse(data?.toString());
          if (parseData?.event === 'connect') {
            setIsConnected(true);
            setChunkStore(parseData?.deviceName);
          }

          if (parseData?.event === 'file_ack') {
            receivedFileAck(parseData?.file, socket, setReceivedFiles);
          }
          if (parseData.event === 'send_chunk_ack') {
            sendChunkAck(
              parseData?.chunkNo,
              socket,
              setTotalSentBytes,
              setSentFiles,
            );
          }
          if (parseData?.event === 'receive_chunk_ack') {
            receiveChunkAck(
              parseData?.chunk,
              parseData?.chunkNo,
              socket,
              setTotalReceiveBytes,
              generateFile,
            );
          }
        });

        socket.on('close', () => {
          console.log('Client Disconnected');
          setReceivedFiles([]);
          setSentFiles([]);
          setCurrentChunkSet(null);
          setTotalReceiveBytes(0);
          setChunkStore(null);
          setIsConnected(false);
          disconnect();
        });
        socket.on('error', err => {
          console.error('Socket Error', err);
        });
      });

      newServer.listen({ port, host: '0.0.0.0' }, () => {
        const address = newServer?.address();
        console.log(`Server running on ${address?.address}:${address?.port}`);
      });

      newServer.on('error', err => {
        console.log('Error while listening ', err);
      });
      setServer(newServer);
    },
    [server],
  );

  const connectToServer = useCallback(
    (host: string, port: number, deviceName: string) => {
      const newClient = TCPSocket.connectTLS(
        {
          host,
          port,
          cert: true,
          ca: require('../tls_certs/server-cert.pem'),
        },
        () => {
          setIsConnected(true);
          setConnectedDevices(deviceName);
          const myDeviceName = DeviceInfo.getDeviceNameSync();
          newClient.write(
            JSON.stringify({ event: 'connect', deviceName: myDeviceName }),
          );
        },
      );

      newClient.on('data', async data => {
        const parseData = JSON.parse(data?.toString());
        if (parseData?.event === 'file_ack') {
          receivedFileAck(parseData?.file, newClient, setReceivedFiles);
        }
        if (parseData.event === 'send_chunk_ack') {
          sendChunkAck(
            parseData?.chunkNo,
            newClient,
            setTotalSentBytes,
            setSentFiles,
          );
        }
        if (parseData?.event === 'receive_chunk_ack') {
          receiveChunkAck(
            parseData?.chunk,
            parseData?.chunkNo,
            newClient,
            setTotalReceiveBytes,
            generateFile,
          );
        }
      });

      newClient.on('close', () => {
        console.log('Client Disconnected');
        setReceivedFiles([]);
        setSentFiles([]);
        setCurrentChunkSet(null);
        setTotalReceiveBytes(0);
        setChunkStore(null);
        setIsConnected(false);
        disconnect();
      });

      newClient.on('error', err => {
        console.error('Client Error', err);
      });
      setClient(newClient);
    },
    [],
  );

  const generateFile = async () => {
    const { chunkStore, resetChunkStore } = useChunkStore.getState();
    if (!chunkStore) {
      console.log('No Chunks or files to process');
      return;
    }
    if (chunkStore?.totalChunks !== chunkStore.chunkArray.length) {
      console.error('Not all chunks have been received');
      return;
    }
    try {
      const combineChunks = Buffer.concat(chunkStore.chunkArray);
      const platformPath =
        Platform.OS === 'ios'
          ? `${RNFS.DocumentDirectoryPath}`
          : `${RNFS.DownloadDirectoryPath}`;
      const filePath = `${platformPath}/${chunkStore.name}`;

      await RNFS.writeFile(
        filePath,
        combineChunks.toString('base64'),
        'base64',
      );

      setReceivedFiles((prevFiles): any =>
        produce(prevFiles, (draftFiles): any => {
          const fileIndex = draftFiles?.findIndex(
            (f: any) => f?.id === chunkStore.id,
          );
          if (fileIndex !== -1) {
            draftFiles[fileIndex] = {
              ...draftFiles[fileIndex],
              uri: filePath,
              available: true,
            };
          }
        }),
      );

      console.log('File Saved Successfully', filePath);
      resetChunkStore();
    } catch (error) {
      console.error('Error combining chunks or saving files', error);
    }
  };

  // Send a message over the current socket (client or serverSocket)
  const sendMessage = useCallback(
    (message: string | Buffer) => {
      if (client) {
        client.write(JSON.stringify(message));
        console.log('Send message:', message);
      } else if (serverSocket) {
        serverSocket.write(JSON.stringify(message));
        console.log('Send from server:', message);
      } else {
        console.warn('No active socket to send message');
      }
    },
    [client, server],
  );

  // Send file acknowledgement
  const sendFileAck = async (
    file: any,
    type: 'file' | 'image' | 'video' | 'apk',
  ) => {
    if (currentChunkSet !== null) {
      Alert.alert('Wait for current file to be send!');
      return;
    }
    const normalizePath =
      Platform.OS === 'ios' ? file?.uri?.repplce('file://', '') : file?.uri;

    const fileData = await RNFS.readFile(normalizePath, 'base64');
    const buffer = Buffer.from(fileData, 'base64');
    const CHUNK_SIZE = 1024 * 8;

    let totalChunks = 0;
    let offset = 0;
    let chunkArray = [];

    while (offset < buffer.length) {
      const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
      totalChunks += 1;
      chunkArray.push(chunk);
      offset += chunk.length;
    }
    const rawData = {
      id: uuidv4(),
      name: type === 'file' ? file.name : file.fileName,
      size: type === 'file' ? file.size : file.fileSize,
      mimeType: type === 'file' ? 'file' : '.jpg',
      totalChunks,
    };

    setCurrentChunkSet({
      id: rawData.id,
      chunkArray,
      totalChunks,
    });

    setSentFiles(prevData =>
      produce(prevData, draft => {
        draft.push({
          ...rawData,
          uri: file?.uri,
        });
      }),
    );

    const socket = client || serverSocket;
    if (!socket) return;

    try {
      console.log('FILE ACKNOWLEDGE DONE');
      socket.write(JSON.stringify({ event: 'file_ack', file: rawData }));
    } catch (error) {
      console.error('got error while sending file:', error);
    }
  };

  return (
    <TCPContext.Provider
      value={{
        server,
        client,
        isConnected,
        connectedDevices,
        sentFiles,
        receivedFiles,
        totalSentBytes,
        totalReceiveBytes,
        startServer,
        connectToServer,
        sendMessage,
        disconnect,
        sendFileAck,
      }}
    >
      {children}
    </TCPContext.Provider>
  );
};
