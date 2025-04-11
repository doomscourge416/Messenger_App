let isWebSocketInitialized = false;

class WebSocketService {
  constructor(chatId, onMessageCallback) {
    this.chatId = chatId;
    this.socket = new WebSocket(`ws://localhost:5000?chatId=${chatId}`);
    this.onMessageCallback = onMessageCallback;
  }

  connect(onMessageCallback) { // Строка 15: принимаем коллбэк
    const url = `ws://localhost:5000/?chatId=${this.chatId}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('Подключен к WebSocket');
    };

    this.socket.onmessage = (event) => {

      if (typeof event.data !== 'string') {
        console.warn('Получены некорректные данные:', event.data);
        return;
      }

      try {
        const data = JSON.parse(event.data);
        console.log('Новое сообщение:', data);

        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      } catch (error) {
        console.error('Ошибка при парсинге данных WebSocket:', error.message);
      }
    };

    this.socket.onerror = (error) => {
      console.error('Ошибка WebSocket:', error);
    };

    this.socket.onclose = () => {
      console.log('Отключен от WebSocket');
    };
  }

  sendMessage(content) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket не подключен');
      return;
    }

    this.socket.send(
      JSON.stringify({
        content,
        chatId: this.chatId,
      })
    );
  }

  isWebSocketInitialized = true;

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export default WebSocketService;