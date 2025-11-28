# WeShare

WeShare is a high-performance, local file-sharing application built with React Native. It enables secure, device-to-device file transfer over TCP/IP without requiring an internet connection.

## Features

- **Fast Transfer**: Uses a custom binary protocol for efficient data transmission.
- **Large File Support**: Streams files directly to disk, enabling transfer of large files without memory crashes.
- **Cross-Platform**: Works seamlessly on both Android and iOS.
- **Secure**: Direct device-to-device connection using local hotspots.
- **Resume Capability**: (Coming Soon) Smart chunk management allows for potential resume capabilities.
- **Modern UI**: Clean and intuitive user interface with real-time progress tracking.

## Technology Stack

- **Core**: React Native
- **Networking**: `react-native-tcp-socket`, `react-native-udp`
- **File System**: `react-native-fs`
- **State Management**: `zustand`
- **Navigation**: `react-navigation`

## Getting Started

### Prerequisites

- Node.js >= 18
- React Native CLI
- Android Studio / Xcode

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/hariskhalid366/WeShare.git
   ```

2. Install dependencies:

   ```bash
   cd WeShare
   npm install
   ```

3. Install iOS pods (iOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

**Android**:

```bash
npm run android
```

**iOS**:

```bash
npm run ios
```

## Architecture

The app uses a custom `TransferManager` service to handle binary data streams.

- **Protocol**: Custom binary header (Type + Length) + Payload.
- **Discovery**: UDP broadcast for device discovery.
- **Transfer**: TCP TLS connection for secure file transfer.

## Author

**Haris Khalid**

---

Built with ❤️ using React Native.
