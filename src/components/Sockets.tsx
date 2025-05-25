// src/services/SocketService.ts
import { io, Socket } from 'socket.io-client';
import { Store } from '../components/Store';

interface MessageData {
  id: number;
  senderId: string;
  recipientId: string;
  cargoId: string;
  message: string;
  messageType?: string;
  timestamp: string;
  status: string;
}

interface PriceOfferData {
  cargoId: string;
  offerId: string;
  senderId: string;
  price: number;
  comment?: string;
  timestamp: string;
}

interface CargoNotification {
  cargoId: string;
  title: string;
  price: number;
  from: string;
  to: string;
  weight: number;
  timestamp: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private messageHandlers: Map<string, Function> = new Map();
  private notificationHandlers: Map<string, Function> = new Map();

  private readonly SERVER_URL   = 'https://gruzreis.ru';
  private readonly SOCKET_PATH  = '/node/socket.io/';

  // Подключение к серверу
  connect(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      this.socket = io(this.SERVER_URL, {
        path: this.SOCKET_PATH,
        transports: ['polling', 'websocket'],
        autoConnect: true,
        reconnection: true,
        timeout: 20000
      });

      // Обработка подключения
      this.socket.on('connect', () => {
        console.log('Подключен к Socket.IO серверу');
        this.isConnected = true;
        
        // Аутентификация
        this.socket?.emit('authenticate', { token });
      });

      // Обработка аутентификации
      this.socket.on('authenticated', (data) => {
        if (data.success) {
          console.log('Успешная аутентификация');
          this.setupEventHandlers();
          resolve(true);
        } else {
          console.error('Ошибка аутентификации:', data.message);
          reject(new Error(data.message));
        }
      });

      // Обработка отключения
      this.socket.on('disconnect', () => {
        console.log('Отключен от Socket.IO сервера');
        this.isConnected = false;
      });

      // Обработка ошибок подключения
      this.socket.on('connect_error', (error) => {
        console.error('Ошибка подключения:', error);
        reject(error);
      });
    });
  }

  // Настройка обработчиков событий
  private setupEventHandlers() {
    if (!this.socket) return;

    // Новое сообщение в чате
    this.socket.on('newMessage', (data: MessageData) => {
      console.log('Новое сообщение:', data);
      this.notifyHandlers('newMessage', data);
    });

    // Уведомление о сообщении
    this.socket.on('messageNotification', (data) => {
      console.log('Уведомление о сообщении:', data);
      this.notifyHandlers('messageNotification', data);
      
      // Показываем уведомление пользователю
      this.showNotification(`Новое сообщение от груза ${data.cargoId}`, data.message);
    });

    // Новое предложение цены
    this.socket.on('newPriceOffer', (data: PriceOfferData) => {
      console.log('Новое предложение цены:', data);
      this.notifyHandlers('newPriceOffer', data);
      
      this.showNotification('Новое предложение цены', `${data.price} руб.`);
    });

    // Обработка предложения
    this.socket.on('offerHandled', (data) => {
      console.log('Предложение обработано:', data);
      this.notifyHandlers('offerHandled', data);
    });

    // Новый доступный груз
    this.socket.on('newCargoAvailable', (data: CargoNotification) => {
      console.log('Новый груз доступен:', data);
      this.notifyHandlers('newCargoAvailable', data);
      
      if (Store.getState().swap) { // Если пользователь - водитель
        this.showNotification('Новый груз', `${data.from} → ${data.to}, ${data.price} руб.`);
      }
    });

    // Обновление статуса груза
    this.socket.on('cargoStatusUpdated', (data) => {
      console.log('Статус груза обновлен:', data);
      this.notifyHandlers('cargoStatusUpdated', data);
    });

    // Присоединение к комнате
    this.socket.on('joinedRoom', (data) => {
      console.log('Присоединился к комнате:', data);
    });

    // Общие уведомления
    this.socket.on('notification', (data) => {
      console.log('Уведомление:', data);
      this.notifyHandlers('notification', data);
    });

    // Ошибки
    this.socket.on('error', (data) => {
      console.error('Socket ошибка:', data);
      Store.dispatch({ type: "error", data: data.message });
    });
  }

  // Присоединение к чату груза
  joinChatRoom(cargoId: string, userId: string) {
    if (!this.socket?.connected) {
      console.error('Socket не подключен');
      return;
    }

    this.socket.emit('joinChatRoom', { cargoId, userId });
  }

  // Покидание чата груза
  leaveChatRoom(cargoId: string, userId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('leaveChatRoom', { cargoId, userId });
  }

  // Отправка сообщения
  sendMessage(cargoId: string, recipientId: string, message: string, messageType = 'text') {
    if (!this.socket?.connected) {
      console.error('Socket не подключен');
      return Promise.reject(new Error('Socket не подключен'));
    }

    return new Promise((resolve, reject) => {
      this.socket?.emit('sendMessage', {
        cargoId,
        recipientId,
        message,
        messageType
      });

      // Ждем подтверждения или ошибки
      const timeout = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 5000);

      const errorHandler = (error: any) => {
        clearTimeout(timeout);
        reject(new Error(error.message));
      };

      const successHandler = () => {
        clearTimeout(timeout);
        this.socket?.off('error', errorHandler);
        resolve(true);
      };

      this.socket?.once('error', errorHandler);
      // Можно добавить событие успешной отправки если нужно
      setTimeout(successHandler, 100); // Временное решение
    });
  }

  // Отправка предложения цены
  sendPriceOffer(cargoId: string, price: number, comment?: string) {
    if (!this.socket?.connected) {
      console.error('Socket не подключен');
      return;
    }

    this.socket.emit('sendPriceOffer', { cargoId, price, comment });
  }

  // Принятие/отклонение предложения
  handleOffer(offerId: string, action: 'accept' | 'reject', cargoId: string) {
    if (!this.socket?.connected) {
      console.error('Socket не подключен');
      return;
    }

    this.socket.emit('handleOffer', { offerId, action, cargoId });
  }

  // Уведомление о новом грузе
  notifyNewCargo(cargoData: any) {
    if (!this.socket?.connected) return;

    this.socket.emit('notifyNewCargo', { cargoData });
  }

  // Обновление статуса груза
  updateCargoStatus(cargoId: string, status: string, userId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('updateCargoStatus', { cargoId, status, userId });
  }

  // Регистрация обработчика сообщений
  onMessage(eventType: string, handler: Function) {
    this.messageHandlers.set(eventType, handler);
  }

  // Удаление обработчика сообщений
  offMessage(eventType: string) {
    this.messageHandlers.delete(eventType);
  }

  // Регистрация обработчика уведомлений
  onNotification(eventType: string, handler: Function) {
    this.notificationHandlers.set(eventType, handler);
  }

  // Удаление обработчика уведомлений
  offNotification(eventType: string) {
    this.notificationHandlers.delete(eventType);
  }

  // Уведомление всех обработчиков
  private notifyHandlers(eventType: string, data: any) {
    const handler = this.messageHandlers.get(eventType);
    if (handler) {
      handler(data);
    }

    const notificationHandler = this.notificationHandlers.get(eventType);
    if (notificationHandler) {
      notificationHandler(data);
    }
  }

  // Показ уведомления пользователю
  private showNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }

  // Отключение
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Проверка подключения
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Получение статуса
  getStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
    };
  }
}

// Экспорт синглтона
export const socketService = new SocketService();
export default socketService;