const { Chat, User } = require('../db'); 

exports.createChat = async (req, res) => {
  try {
    console.log('Тело запроса:', req.body); // Добавьте это для отладки

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

    res.json({ message: 'Чат успешно создан', chat });
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

    if (!user || !user.chats) {
      console.log('Чаты не найдены для пользователя:', userId);
      return res.status(404).json({ message: 'Чаты не найдены' });
    }

    console.log('Загруженные чаты:', user.chats);
    res.json({ chats: user.chats });
  } catch (error) {
    console.error('Ошибка при получении чатов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.transferAdmin = async (req, res) => {
  try {
    const { chatId, newAdminId } = req.body;
    const currentUserId = req.userId;

    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    if (chat.adminId !== currentUserId) {
      return res.status(403).json({ message: 'Вы не являетесь администратором этого чата' });
    }

    chat.adminId = newAdminId;
    await chat.save();

    res.json({ message: 'Администратор успешно назначен', chat });
  } catch (error) {
    console.error('Ошибка при назначении администратора:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};