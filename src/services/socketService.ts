// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  private readonly SERVER_URL = 'https://gruzreis.ru';
  private readonly SOCKET_PATH = '/node/socket.io/';

  connect(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      this.socket = io(this.SERVER_URL, {
        path: this.SOCKET_PATH,
        auth: { token },
        transports: ['polling', 'websocket'],
        autoConnect: true,
        reconnection: true,
        timeout: 20000
      });

      // Только критичные обработчики для Promise
      const handleConnect = () => {
        this.isConnected = true;
        this.socket?.off('connect', handleConnect);
        this.socket?.off('connect_error', handleError);

        resolve(true);
      };

      const handleError = (error: any) => {
        console.error('Ошибка подключения:', error);
        this.socket?.off('connect', handleConnect);
        this.socket?.off('connect_error', handleError);
        reject(error);
      };

      this.socket.once('connect', handleConnect);
      this.socket.once('connect_error', handleError);
    });
  }

  emit(eventName: string, data: any): boolean {
    if (!this.socket?.connected) {
      console.error('Socket не подключен');
      return false;
    }
    
    this.socket.emit(eventName, data);
    return true;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;

    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
    };
  }
    
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;