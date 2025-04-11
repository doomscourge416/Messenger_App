const { Chat, NotificationSettings, ChatParticipant } = require('../db');
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

exports.toggleMuteChat = async (req, res) => {
    try {
      const { chatId } = req.body;
      const userId = req.userId;

      if (!chatId) {
        return res.status(400).json({ message: 'Необходимо указать chatId' });
      }

      if (!userId) {
        return res.status(401).json({ message: 'Необходима авторизация' });
      }

      // Проверяем, забанен ли пользователь
      const isBanned = await isUserBanned(chatId, userId);
      if (isBanned) {
        return res.status(403).json({ message: 'Вы забанены в этом чате' });
      }

      // Находим или создаем настройки уведомлений
      let notificationSettings = await NotificationSettings.findOne({
        where: { userId, chatId },
      });

      if (!notificationSettings) {
        notificationSettings = await NotificationSettings.create({ userId, chatId });
      }
    
      // // Находим чат
      // const chat = await Chat.findByPk(chatId);
      // if (!chat) {
      //   return res.status(404).json({ message: 'Чат не найден' });
      // }
  
      // // Проверяем, является ли пользователь участником чата
      // const isParticipant = await chat.hasParticipant(userId);
      // if (!isParticipant) {
      //   return res.status(403).json({ message: 'Вы не являетесь участником этого чата' });
      // }
    
  
      // Переключаем статус mute
      notificationSettings.isMuted = !notificationSettings.isMuted;
      console.log('Статус уведомлений :' , notificationSettings.isMuted);
      await notificationSettings.save();
  
      res.json({ message: 'Настройки уведомлений успешно обновлены', isMuted: notificationSettings.isMuted });
    } catch (error) {
      console.error('Ошибка при управлении уведомлениями:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
};


exports.getNotificationSettings = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    console.log('Запрос на получение настроек уведомлений:', { chatId, userId });

    if (!chatId) {
      return res.status(400).json({ message: 'Необходимо указать chatId' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Необходима авторизация' });
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

    // Находим или создаем настройки уведомлений
    let notificationSettings = await NotificationSettings.findOne({
      where: { userId, chatId },
    });
    if (!notificationSettings) {
      notificationSettings = await NotificationSettings.create({ userId, chatId, isMuted: false });
    }


    console.log('Текущие настройки уведомлений:', notificationSettings);
    // Возвращаем текущее значение isMuted
    res.json({ isMuted: notificationSettings.isMuted });

  } catch (error) {
    console.error('Ошибка при получении настроек уведомлений:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }

};