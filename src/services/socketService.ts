// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { socketActions } from '../Store/socketStore';
import { loginGetters } from '../Store/loginStore';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  private readonly SERVER_URL = 'https://gruzreis.ru';
  private readonly SOCKET_PATH = '/socket.io/';

  connect(token: string): Promise<boolean> {

    socketActions.setConnecting(true)

    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      this.socket = io(this.SERVER_URL, {
        auth:                   { token },
        transports:             ['polling', 'websocket'],
        withCredentials:        true
      });

      // Только критичные обработчики для Promise
      const handleConnect = () => {
        console.log("socketService connect", true)
        this.isConnected = true;
        this.socket?.off('connect', handleConnect);
        this.socket?.off('connect_error', handleError);

        socketActions.setConnected(true)
        socketActions.setConnecting(false)

        if(loginGetters.isAuthenticated()) this.socket?.emit("re_authorize", {token: loginGetters.getToken()})

        resolve(true);
      };
      const handleDisconnect = () => {
        console.log("socketService disconnect", true)
        this.isConnected = false;
        socketActions.setConnected(false)
        this.socket?.off('disconnect', handleConnect);

        socketActions.setConnecting(false)

        resolve(true);
      };
      const handleError = (error: any) => {
        console.error('Ошибка подключения:', error);
        this.socket?.off('connect', handleConnect);
        this.socket?.off('connect_error', handleError);
        
        socketActions.updateStatus(false, false)

        reject(error);
      };

      this.socket.once('disconnect', handleDisconnect);
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
    socketActions.updateStatus(false, false)
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