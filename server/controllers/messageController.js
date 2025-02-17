const { Chat, Message } = require('../db');

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const userId = req.userId;

    if (!chatId || !content) {
      return res.status(400).json({ message: 'Необходимо указать chatId и content' });
    }

    // Проверяем, существует ли чат
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    // Проверяем, является ли пользователь участником чата
    const isParticipant = await chat.hasParticipant(userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Вы не являетесь участником этого чата' });
    }

    // Создаем новое сообщение
    const message = await Message.create({
      content,
      senderId: userId,
      chatId,
    });

    console.log('Экземпляр WebSocket:', req.app.get('io'));

    // Отправляем сообщение через WebSocket
    const io = req.app.get('io'); // Получаем экземпляр WebSocket
    if (io) {
      io.clients.forEach((client) => {
        if (client.chatId === chatId.toString()) {
          client.send(
            JSON.stringify({
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              chatId: message.chatId,
              createdAt: message.createdAt,
            })
          );
        }
      });
    } else {
      console.error('WebSocket не инициализирован');
    }

    res.json({ message: 'Сообщение успешно отправлено', message });
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};