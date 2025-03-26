const { Chat, User, ChatParticipant } = require('../db'); 
const sequelize = require('sequelize');
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

exports.createChat = async (req, res) => {
  try {
    
    if (!req.body || !req.body.participants || !req.body.type) {
      return res.status(400).json({ message: 'Необходимо указать participants и type' });
    }

    const { participants, type } = req.body;

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: 'Participants должны быть массивом и не пустыми' });
    }

    if (!['private', 'group'].includes(type)) {
      return res.status(400).json({ message: 'Type должен быть "private" или "group"' });
    }

    const existingUsers = await User.findAll({ where: { id: participants } });
    if(existingUsers.length !== participants.length ) {
      return res.status(400).json({ message: 'Один или несколько пользователей не найдены' });
    }


    const userId = req.userId;

    // Создание чата
    const chat = await Chat.create({ 
      type,
      adminId: userId,  // Назначение создавшего чат пользователя администратором
    });
    
    // Добавление участников
    for (const participantId of participants) {
      await chat.addParticipant(participantId);
    }

    // Автоматически добавляем текущего пользователя TODO: Поменять реализацию на нормальную
    await chat.addParticipant(userId);


    // Получаем обновленный список участников
    const updatedChat = await Chat.findByPk(chat.id, {
      include: [
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'nickname'],
        },
      ],
    });

    res.json({ message: 'Чат успешно создан', chat: updatedChat });
  } catch (error) {
    console.error('Ошибка при создании чата:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.getChats = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Ищем чаты для пользователя:', userId);

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Chat,
          as: 'chats',
          include: [
            {
              model: User,
              as: 'participants',
              attributes: ['id', 'nickname'],
            },
          ],
        },
      ],
    });

    // Фильтруем чаты, исключая те, где пользователь забанен
    const filteredChats = user.chats.filter((chat) => {
      const participant = chat.participants.find((p) => p.id === userId);
      return !participant.ChatParticipant.isBanned;
    });

    if (!user || !user.chats) {
      console.log('Чаты не найдены для пользователя:', userId);
      return res.status(404).json({ message: 'Чаты не найдены' });
    }

    console.log('Загруженные чаты:', filteredChats);
    res.json({ chats: filteredChats });
  } catch (error) {
    console.error('Ошибка при получении чатов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }

};

exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findByPk(chatId, {
      attributes: ['id', 'type', 'adminId'], // Возвращаем только нужные поля
      include: [
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'nickname'],
        },
      ],
    });
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }
    res.json({ chat });
  } catch (error) {
    console.error('Ошибка при получении чата:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.getParticipants = async (req, res) => {
  try {
    const { chatId } = req.params;

    console.log('Запрос на получение участников для чата:', chatId);

    // Находим чат
    const chat = await Chat.findByPk(chatId, {
      include: [
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'nickname', 'email'],
          through: { 
            attributes: ['isBanned'] 
          },
        },
      ],
    });

    if (!chat) {
      console.warn('Чат не найден для chatId:', chatId);
      return res.status(404).json({ message: 'Чат не найден' });
    }

    console.log('Найденные участники:', JSON.stringify(chat.participants, null, 2));

    // Разделяем участников на активных и забаненных
    // const activeParticipants = chat.participants.filter((p) => {
    //   const isBanned = p.ChatParticipant?.isBanned || false;
    //   return !isBanned;
    // });

    // const bannedParticipants = chat.participants.filter((p) => {
    //   const isBanned = p.ChatParticipant?.isBanned || false;
    //   return isBanned;
    // });

    // Разделяем участников на активных и забаненных
    const activeParticipants = chat.participants.filter((p) => !p.ChatParticipant?.isBanned);
    const bannedParticipants = chat.participants.filter((p) => p.ChatParticipant?.isBanned);

    res.json({
      participants: chat.participants,
      activeParticipants,
      bannedParticipants,
    });
  } catch (error) {
    console.error('Ошибка при получении участников:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.transferAdmin = async (req, res) => {
  try {
    const { chatId, newAdminId } = req.body;
    const currentUserId = req.userId;

    // Находим чат
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    // Проверяем права текущего пользователя
    if (chat.adminId !== currentUserId) {
      return res.status(403).json({ message: 'Вы не являетесь администратором этого чата' });
    }

    // Назначаем нового администратора
    await chat.update({ adminId: newAdminId });

    res.json({ message: 'Права администратора успешно переданы' });
  } catch (error) {
    console.error('Ошибка при передаче прав администратора:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.banParticipant = async (req, res) => {
  try {
    const { chatId, participantId } = req.body;
    const userId = req.user.id; // ID текущего пользователя

    console.log('Бан участника:', { chatId, participantId, userId });

    // Проверяем, указан ли chatId и participantId
    if (!chatId || !participantId) {
      return res.status(400).json({ message: 'Необходимо указать chatId и participantId' });
    }

    // Находим чат
    const chat = await Chat.findByPk(chatId);

    if (!chat) {
      console.warn('Чат не найден для chatId:', chatId);
      return res.status(404).json({ message: 'Чат не найден' });
    }

    // Проверяем, является ли текущий пользователь администратором чата
    if (chat.adminId !== userId) {
      return res.status(403).json({ message: 'У вас нет прав администратора' });
    }

    // Находим запись в таблице ChatParticipants
    const chatParticipant = await ChatParticipant.findOne({
      where: { chatId, userId: participantId },
    });

    if (!chatParticipant) {
      console.warn('Запись в таблице ChatParticipant не найдена:', { chatId, participantId });
      return res.status(404).json({ message: 'Участник не состоит в чате' });
    }

    // Баним участника
    chatParticipant.isBanned = true;
    await chatParticipant.save();

    console.log('Участник успешно забанен:', participantId);
    res.json({ message: 'Участник успешно забанен' });
  } catch (error) {
    console.error('Ошибка при бане участника:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.unbanParticipant = async (req, res) => {
  try {
    const { chatId, participantId } = req.body;
    const userId = req.user.id;

    console.log('Разбан участника:', { chatId, participantId, userId });

    // Находим чат
    const chat = await Chat.findByPk(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    // Проверяем, является ли текущий пользователь администратором чата
    if (chat.adminId !== userId) {
      return res.status(403).json({ message: 'У вас нет прав администратора' });
    }

    const chatParticipant = await ChatParticipant.findOne({
      where: { chatId, userId: participantId },
    });

    if (!chatParticipant) {
      console.warn('Запись в таблице ChatParticipant не найдена:', { chatId, participantId });
      return res.status(404).json({ message: 'Участник не состоит в чате' });
    }

    chatParticipant.isBanned = false;
    await chatParticipant.save();

    console.log('Участник успешно разбанен:', participantId);
    res.json({ message: 'Участник успешно разбанен' });
  } catch (error) {
    console.error('Ошибка при разбане участника:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.checkAccess = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    console.log('Проверка доступа для chatId:', chatId, 'userId:', userId);

    const chat = await Chat.findByPk(chatId, {
      include: [
        {
          model: User,
          as: 'participants',
          where: { id: userId },
        },
      ],
    });

    if (!chat) {
      console.warn('Чат не найден для chatId:', chatId);
      return res.status(404).json({ accessGranted: false });
    }

    console.log('Доступ разрешен для chatId:', chatId);
    res.json({ accessGranted: true });
  } catch (error) {
    console.error('Ошибка при проверке доступа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.addParticipant = async (req, res) => {
  try {
    const { chatId, participantId } = req.body;
    const parsedChatId = parseInt(chatId, 10);
    const parsedParticipantId = parseInt(participantId, 10);
    const userId = req.userId;

    // Находим чат
    const chat = await Chat.findByPk(parsedChatId);
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    // Проверяем права текущего пользователя
    if (chat.adminId !== parsedChatId) {
      return res.status(403).json({ message: 'Вы не являетесь администратором этого чата' });
    }

    // Добавляем участника
    await chat.addParticipant(parsedParticipantId);

    res.json({ message: 'Участник успешно добавлен в чат' });
  } catch (error) {
    console.error('Ошибка при добавлении участника:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.removeParticipant = async (req, res) => {
  try {
    const { chatId, participantId } = req.params;
    const currentUserId = req.userId;

    // Находим чат
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    // Проверяем права текущего пользователя
    if (chat.adminId !== currentUserId) {
      return res.status(403).json({ message: 'Вы не являетесь администратором этого чата' });
    }

    // Удаляем участника
    await chat.update({
      participants: sequelize.fn('array_remove', sequelize.col('participants'), participantId),
    });

    res.json({ message: 'Участник успешно удален из чата' });
  } catch (error) {
    console.error('Ошибка при удалении участника:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};