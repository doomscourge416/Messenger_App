const { Chat, Message, User } = require('../db');

exports.sendMessage = async (req, res) => {
  try {
    console.log('Тело запроса:', req.body);
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

    console.log('Пользователь является участником чата');

    // Создаем новое сообщение
    const message = await Message.create({
      content,
      senderId: userId,
      chatId,
    });

    console.log('Сообщение создано:', message);

    // Отправляем сообщение через WebSocket
    const io = req.app.get('io'); // Получаем экземпляр WebSocket
    if (io && io.clients.size > 0) {
      console.log('WebSocket доступен. Отправка сообщения...');
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
      console.warn('Нет подключенных клиентов для чата', chatId);
    }

    res.json({ message: 'Сообщение успешно отправлено', message });
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.getMessagesByChat = async (req, res) => {
  
  try {

    const{ chatId } = req.params;

    // Проверяем существует-ли чат
    const chat = await Chat.findByPk(chatId);
    if(!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    // Получаем все сообщения из чата
    const messages = await Message.findAll({
      where: { chatId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'nickname'],
        },
      ],
      order: [['createdAt', 'ASC']], // Sort messages by time
    });

    res.json({ messages });

  } catch (error) {

    console.error('Ошибка при получении сообщений', error);
    res.status(500).json({ message: 'Ошибка сервера'});

  }

};

exports.editMessage = async (req, res) => {

  try {

    const { messageId } = req.params;
    const { newContent } = req.body;
    const userId = req.userId;

    // Находим сообщение
    const message = await Message.findByPk(messageId);
    if(!message) {
      return res.status(404).json({ message:'Вы не являетесь автором этого сообщения' });
    };

    // Обновляем содержимое сообщения
    const io = req.app.get('io');
    if(io) {
      io.clients.forEach((client) => {
        if(client.chatId === message.chatId.toString()) {
          client.send(
            JSON.stringify({
              type: 'editMessage',
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              chatId: message.chatId,
              createdAt: message.createdAt,
            })
          )
        }
      })
    };

    res.json({ message: 'Сообщение успешно отредактировано', message });

  } catch(error) {
    console.error( 'Ошибка при редактировании сообщения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }

};

exports.deleteMessage = async (req, res) => {

  try {

    const { messageId } = req.params;
    const userId = req.userId;

    // Находим сообщение
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }

    // Проверяем, является ли пользователь автором сообщения
    if (message.senderId !== userId) {
      return res.status(403).json({ message: 'Вы не являетесь автором этого сообщения' });
    }

    // Удаляем сообщение
    await message.destroy();

    // Отправляем событие об удалении через WebSocket
    const io = req.app.get('io');
    if (io) {
      io.clients.forEach((client) => {
        if (client.chatId === message.chatId.toString()) {
          client.send(
            JSON.stringify({
              type: 'deleteMessage', // Тип события для клиента
              id: message.id,
              chatId: message.chatId,
            })
          );
        }
      });
    }

    res.json({ message: 'Сообщение успешно удалено' });

  } catch (error) {

    console.error('Ошибка при удалении сообщения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });

  }
  
};