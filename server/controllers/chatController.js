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

    // Создание чата
    const chat = await Chat.create({ type });
    // Добавление участников
    for (const participantId of participants) {
      await chat.addParticipant(participantId);
    }

    res.json({ message: 'Чат успешно создан', chat });
  } catch (error) {
    console.error('Ошибка при создании чата:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.getChats = async (req, res) => {
  try {
    const userId = req.userId;

    // Находим все чаты пользователя
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

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ chats: user.chats });
  } catch (error) {
    console.error('Ошибка при получении списка чатов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};