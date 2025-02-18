class WebSocketService {
  constructor(chatId, token) {
    this.chatId = chatId;
    this.token = token;
    this.socket = null;
  }

  connect() {
    const url = `ws://localhost:5000/?chatId=${this.chatId}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('Подключен к WebSocket');
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Новое сообщение:', message);

      if (this.onMessage) {
        this.onMessage(message); // Вызываем коллбэк для обновления интерфейса
      }
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

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }

  setOnMessageCallback(callback) {
    this.onMessage = callback;
  }
}

export default WebSocketService;