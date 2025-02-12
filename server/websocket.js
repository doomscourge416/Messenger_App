const { Server } = require('ws');

module.exports = (server) => {
  const wss = new Server({ server });

  wss.on('connection', (ws) => {
    console.log('Клиент подключился к WebSocket');

    ws.on('message', (message) => {
      console.log(`Получено сообщение: ${message}`);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      console.log('Клиент отключился от WebSocket');
    });
  });
};