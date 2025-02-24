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

    // Получаем данные отправителя
    const sender = await User.findByPk(userId, { attributes: ['id', 'nickname'] }) || {};
    // Отправляем сообщение через WebSocket
    const io = req.app.get('io');
    if (io) {
      io.clients.forEach((client) => {
        if (client.chatId === chatId.toString()) {
          client.send(
            JSON.stringify({
              type: 'newMessage',
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              chatId: message.chatId,
              createdAt: message.createdAt.toLocaleString(),
              sender: sender, // Добавляем данные отправителя
            })
          );
        }
      });
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

    // Получаем все сообщения из чата c данными отправитeля
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

exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.userId;

    if (!chatId) {
      return res.status(400).json({ message: 'Необходимо указать chatId' });
    }

    // Помечаем все сообщения чата как прочитанные для текущего пользователя
    await Message.update(
      { isRead: true }, // Обновляем поле isRead
      {
        where: {
          chatId,
          senderId: { [Op.ne]: userId }, // Исключаем сообщения, отправленные самим пользователем
        },
      }
    );

    res.json({ message: 'Сообщения успешно помечены как прочитанные' });
  } catch (error) {
    console.error('Ошибка при пометке сообщений:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
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

    // Проверяем, является ли пользователь автором сообщения
    if (message.senderId !== userId) {
      return res.status(403).json({ message: 'Вы не являетесь автором этого сообщения' });
    }

    // Обновляем содержимое + Сохраняем содержимое в БД
    message.content = newContent;
    await message.save();

    // Отправляем обновленное сообщение через WebSocket
    const io = req.app.get('io');
    if (io) {
      io.clients.forEach((client) => {
        if (client.chatId === message.chatId.toString()) {
          client.send(
            JSON.stringify({
              type: 'editMessage',
              id: message.id,
              content: newContent, // Используйте новое содержимое
              senderId: userId, // Добавьте ID пользователя
              chatId: message.chatId,
              createdAt: message.createdAt.toLocaleString(),
            })
          );
        }
      });
    }

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
              type: 'deleteMessage',
              id: message.id,
              chatId: message.chatId,
              createdAt: message.createdAt.toLocaleString(), // Добавьте createdAt
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

exports.forwardMessage = async (req, res) => {
  try {
    const { messageId, recipientId } = req.body; // Строка 50: получаем ID сообщения и ID чата
    const userId = req.userId;

    // Находим исходное сообщение
    const originalMessage = await Message.findByPk(messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: 'Исходное сообщение не найдено' });
    }

    // Проверяем, является ли пользователь автором сообщения
    if (originalMessage.senderId !== userId) {
      return res.status(403).json({ message: 'Вы не являетесь автором этого сообщения' });
    }

    // Находим чат получателя
    const recipientChat = await Chat.findByPk(recipientId); // Строка 60: ищем чат по ID
    if (!recipientChat) {
      return res.status(404).json({ message: 'Чат получателя не найден' });
    }

    // Проверяем, является ли пользователь участником чата получателя
    const isParticipant = await recipientChat.hasParticipant(userId); // Строка 65
    if (!isParticipant) {
      return res.status(403).json({ message: 'Вы не являетесь участником этого чата' });
    }

    // Создаем новое сообщение в чате получателя
    const newMessage = await Message.create({
      content: originalMessage.content,
      senderId: userId,
      chatId: recipientChat.id,
    });

    // Отправляем событие через WebSocket
    const io = req.app.get('io');
    if (io) {
      io.clients.forEach((client) => {
        if (client.chatId === recipientChat.id.toString()) {
          client.send(
            JSON.stringify({
              type: 'newMessage',
              id: newMessage.id,
              content: newMessage.content,
              senderId: userId,
              chatId: recipientChat.id,
              createdAt: newMessage.createdAt.toLocaleString(),
            })
          );
        }
      });
    }

    res.json({ message: 'Сообщение успешно переслано', newMessage });
  } catch (error) {
    console.error('Ошибка при пересылке сообщения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.getForwardedMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.findAll({
      where: { chatId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'nickname'],
        },
        {
          model: Chat,
          as: 'originalChat', // Таблица для хранения оригинального чата
          attributes: ['id'],
        },
      ],
    });

    res.json({ messages });
  } catch (error) {
    console.error('Ошибка при получении пересланных сообщений:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};