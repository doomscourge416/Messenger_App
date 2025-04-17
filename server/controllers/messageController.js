const { Chat, Message, User, ForwardedMessages, ChatParticipant } = require('../db');
const { Op } = require('sequelize');

const isUserBanned = async (chatId, userId) => {
  if (!chatId || !userId) {
    console.error('Недостаточно данных для проверки бана:', { chatId, userId });
    return false;
  }

  const chatParticipant = await ChatParticipant.findOne({
    where: { chatId, userId },
  });

  return chatParticipant?.isBanned || false; // Возвращаем true, если пользователь забанен
};

// TODO:
// Отправка сообщения
exports.sendMessage = async (req, res) => {
  try {
    console.log('Тело запроса:', req.body);
    const { chatId, content } = req.body;
    const userId = req.userId;

    if (!chatId) {
      return res.status(400).json({ message: 'Необходимо указать chatId' });
    }

    // Проверяем, забанен ли пользователь
    const isBanned = await isUserBanned(chatId, userId);
    if (isBanned) {
      return res.status(403).json({ message: 'Вы забанены в этом чате' });
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


    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`; // URL загруженного файла
    }

    if (!content && !fileUrl) {
      return res.status(400).json({ message: 'Сообщение должно содержать текст или файл' });
    }

    // Создаем новое сообщение
    const message = await Message.create({
      content: content || null,
      fileUrl: fileUrl || null,
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
              fileUrl: message.fileUrl,
              senderId: message.senderId,
              chatId: message.chatId,
              createdAt: message.createdAt.toLocaleString(),
              sender: sender,
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

// TODO:
exports.getMessagesByChat = async (req, res) => {

  try {
    const { chatId } = req.params;
    const userId = req.userId;



    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' });
    }

    if (!chatId) {
      return res.status(400).json({ message: 'Необходимо указать chatId' });
    }


    // Проверяем, забанен ли пользователь
    const isBanned = await isUserBanned(chatId, userId);
    if (isBanned) {
      return res.status(403).json({ message: 'Вы забанены в этом чате' });
    }

    // Проверяем, существует ли чат
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    // Получаем все сообщения из чата с данными отправителя
    const messages = await Message.findAll({
      where: { chatId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'nickname', 'avatarUrl'],
        },
      ],
      order: [['createdAt', 'ASC']], // Сортируем сообщения по времени
    });

    // TODO: console.log('Загруженные сообщения:', messages); // Лог загруженных сообщений
    res.json({ messages, isBanned });
    // TODO: console.log('Ответ сервера из getmessagesbychat:', { messages, isBanned });
  } catch (error) {
    console.error('Ошибка при получении сообщений:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Пометка сообщений как прочитанных
exports.markAsRead = async (req, res) => {

  try {

    const { chatId } = req.body;
    const userId = req.userId;


    console.log('Помечаем сообщения как прочитанные:', { chatId, userId });

    if (!chatId) {
      return res.status(400).json({ message: 'Необходимо указать chatId' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('messageStatusUpdated', { chatId });
    }


    // Обновляем только сообщения, отправленные другими участниками
    const updatedCount = await Message.update(
      { isRead: 1 },
      {
        where: {
          chatId,
          senderId: { [Op.ne]: userId }, // Исключаем сообщения, отправленные самим пользователем
        },
      }
    );

    console.log('Обновлено сообщений:', updatedCount);

    if (updatedCount === 0) {
      console.warn('Нет подходящих сообщений для обновления');
    }

    res.json({ message: 'Сообщения успешно помечены как прочитанные' });
  } catch (error) {
    console.error('Ошибка при пометке сообщений:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Редактирование сообщения
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body; // Извлекаем новое содержимое из тела запроса
    const userId = req.userId;

    // Находим сообщение
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }

    // Проверяем права пользователя
    if (message.senderId !== userId) {
      return res.status(403).json({ message: 'Вы не являетесь автором этого сообщения' });
    }

    // Проверяем, что содержимое не пустое
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Содержимое сообщения не может быть пустым' });
    }

    // Обновляем содержимое сообщения
    message.content = content;
    await message.save();

    // Отправляем событие через WebSocket
    const io = req.app.get('io');
    if (io) {
      io.clients.forEach((client) => {
        if (client.readyState === 1 && client.chatId === message.chatId.toString()) {
          client.send(JSON.stringify({
            type: 'editMessage',
            id: message.id,
            content: content,
            senderId: userId,
            chatId: message.chatId,
            createdAt: message.createdAt.toISOString(),
          }));
        }
      });
    }

    res.json({ message: 'Сообщение успешно отредактировано' });
  } catch (error) {
    console.error('Ошибка при редактировании сообщения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удаление сообщения
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
              createdAt: message.createdAt.toLocaleString(),
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

// Пересылка сообщения
exports.forwardMessage = async (req, res) => {
  try {
    const { messageId, recipientChatId } = req.body;
    const userId = req.userId;

    // Находим исходное сообщение
    const originalMessage = await Message.findByPk(messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: 'Исходное сообщение не найдено' });
    }

    // Проверяем права пользователя
    if (originalMessage.senderId !== userId) {
      return res.status(403).json({ message: 'Вы не являетесь автором этого сообщения' });
    }

    // Находим чат получателя
    const recipientChat = await Chat.findByPk(recipientChatId);
    if (!recipientChat) {
      return res.status(404).json({ message: 'Чат получателя не найден' });
    }

    // Проверяем, является ли пользователь участником чата получателя
    const isParticipant = await recipientChat.hasParticipant(userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Вы не являетесь участником этого чата' });
    }

    // Создаем новое сообщение в чате получателя
    const newMessage = await Message.create({
      content: originalMessage.content,
      senderId: userId,
      chatId: recipientChat.id,
    });

    // Создаем запись о пересылке
    await ForwardedMessages.create({
      originalMessageId: messageId,
      forwardedChatId: recipientChat.id,
    });

    // Отправляем событие через WebSocket
    const io = req.app.get('io');
    if (io) {
      io.clients.forEach((client) => {
        if (client.chatId === recipientChat.id.toString()) {
          client.send(JSON.stringify({
            type: 'newMessage',
            id: newMessage.id,
            content: newMessage.content,
            senderId: userId,
            chatId: recipientChat.id,
            createdAt: newMessage.createdAt.toISOString(),
          }));
        }
      });
    }

    res.json({ message: 'Сообщение успешно переслано', newMessage });
  } catch (error) {
    console.error('Ошибка при пересылке сообщения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Отправление файлов
exports.uploadFile = async (req, res) => {

  try {

    console.log('Запрос на загрузку файла получен');
    console.log('req.file:', req.file);

    if(!req.file){
      return res.status(400).json({ message: 'Файл не был загружен'});
    }

    const fileUrl = `/uploads/${req.file.filename}`; 
    console.log('URL загруженного файла:', fileUrl);

    await Message.create({
      senderId: req.userId,
      chatId: req.body.chatId,
      fileUrl: fileUrl,
    });

    res.json({ message: 'Файл успешно загружен', fileUrl });

  } catch (error) {

    console.error('Ошибка при загрузке файла: ', error);
    res.status(500).json({ message: 'Ошибка сервера при загрузке файла' });

  }

};

// Получение истории пересылок
exports.getForwardedMessages = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Находим историю пересылок для сообщения
    const forwardedHistory = await ForwardedMessages.findAll({
      where: { originalMessageId: messageId },
      include: [
        {
          model: Chat,
          as: 'forwardedChat',
          attributes: ['id', 'type'],
        },
      ],
    });

    res.json({ forwardedHistory });
  } catch (error) {
    console.error('Ошибка при получении истории пересылок:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};