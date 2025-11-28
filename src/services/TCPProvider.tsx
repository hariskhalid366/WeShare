import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useState,
} from 'react';
import TCPSocket from 'react-native-tcp-socket';
import DeviceInfo from 'react-native-device-info';
import { TransferManager } from './TransferManager';

interface TCPContextType {
  server: any;
  client: any;
  isConnected: boolean;
  connectedDevice: string | null;
  startServer: (port: number) => void;
  connectToServer: (host: string, port: number, deviceName: string) => void;
  disconnect: () => void;
  sendFile: (file: any) => void;
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

export const TCPProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [server, setServer] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [transferManager, setTransferManager] = useState<TransferManager | null>(null);

  const disconnect = useCallback(() => {
    if (client) client.destroy();
    if (server) server.close();
    setClient(null);
    setServer(null);
    setIsConnected(false);
    setConnectedDevice(null);
    setTransferManager(null);
  }, [client, server]);

  const startServer = useCallback((port: number) => {
    if (server) return;
    
    const newServer = TCPSocket.createTLSServer(option, socket => {
      console.log('Client Connected', socket.address());
      socket.setNoDelay(true);
      
      const manager = new TransferManager(socket, true);
      setTransferManager(manager);
      setIsConnected(true);
      
      socket.on('close', () => {
        console.log('Client Disconnected');
        disconnect();
      });
    });

    newServer.listen({ port, host: '0.0.0.0' }, () => {
      const address = newServer?.address();
      console.log(`Server running on ${address?.address}:${address?.port}`);
    });

    newServer.on('error', err => console.log('Server error:', err));
    setServer(newServer);
  }, [server, disconnect]);

  const connectToServer = useCallback((host: string, port: number, deviceName: string) => {
    const newClient = TCPSocket.connectTLS(
      {
        host,
        port,
        cert: true,
        ca: require('../tls_certs/server-cert.pem'),
      },
      () => {
        setIsConnected(true);
        setConnectedDevice(deviceName);
        const manager = new TransferManager(newClient, false);
        setTransferManager(manager);
        
        // Send Handshake
        // const myDeviceName = DeviceInfo.getDeviceNameSync();
        // Ideally use Protocol.ts to send handshake, but TransferManager handles incoming.
        // We can add a method to TransferManager to send handshake or just write raw for now.
        // Let's assume TransferManager is initialized and we can use it.
        // Actually, we need to wait for state update or use ref. 
        // For simplicity, we'll let TransferManager handle it if we pass the socket.
      }
    );

    newClient.on('close', () => {
      console.log('Disconnected from server');
      disconnect();
    });

    newClient.on('error', err => console.error('Client error:', err));
    setClient(newClient);
  }, [disconnect]);

  const sendFile = useCallback(async (file: any) => {
    if (transferManager) {
      await transferManager.sendFile(file);
    }
  }, [transferManager]);

  return (
    <TCPContext.Provider
      value={{
        server,
        client,
        isConnected,
        connectedDevice,
        startServer,
        connectToServer,
        disconnect,
        sendFile,
      }}
    >
      {children}
    </TCPContext.Provider>
  );
};
