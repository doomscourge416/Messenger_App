const { Server } = require('ws');

module.exports = (server, app) => {
  const wss = new Server({ server });

  // Сохраняем экземпляр WebSocket в приложении Express
  app.set('io', wss);

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const chatId = url.searchParams.get('chatId');

    if (!chatId) {
      console.error('Не указан chatId для WebSocket');
      ws.close();
      return;
    }

    ws.chatId = chatId; // Сохраняем ID чата для клиента
    console.log(`Клиент подключился к чату ${chatId}`);
    
    ws.on('message', (message) => {
      console.log(`Получено сообщение от клиента: ${message}`);
      wss.clients.forEach((client) => {
        if (client.readyState === 1 && client.chatId === chatId) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      console.log('Клиент отключился от WebSocket');
    });
  });

  return wss; // Возвращаем экземпляр WebSocket
};