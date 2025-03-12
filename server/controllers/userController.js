const { Op } = require('sequelize');
const { User } = require('../db');

// обновление никнейма
exports.updateNickname = async (req, res) => {
    try {
        const { newNickname } = req.body;
        const userId = req.userId; // Получаем Айди пользователя из middleware

        // Проверяем существует-ли пользователь
        const user = await User.findByPk(userId);
        if(!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Проверяем занят новый-ли никнейм
        const existingUser = await User.findOne({ where: { nickname: newNickname }});
        if(existingUser && existingUser.id !== userId) {
            return res.status(400).json({ message: 'Никнейм занят' });
        }

        // Обновляем никнейм
        user.nickname = newNickname;
        await user.save();

        res.json({ message: 'Никнейм успешно изменён', user: { nickname: user.nickname } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Обновление аватара
exports.updateAvatar = async (req, res) => {
    try {
      const { avatarUrl } = req.body;
      const userId = req.userId;
  
      if (!avatarUrl) {
        return res.status(400).json({ message: 'Необходимо указать avatarUrl' });
      }
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
  
      user.avatarUrl = avatarUrl;
      await user.save();
  
      res.json({ message: 'Аватар успешно обновлен', user });
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Настройка видимости email
exports.toggleEmailVisibility = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.isEmailVisible = !user.isEmailVisible;
    await user.save();

    res.json({ message: 'Настройки email успешно обновлены', user });
  } catch (error) {
    console.error('Ошибка при обновлении настроек email:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }

};

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
    
        if (!query) {
          return res.status(400).json({ message: 'Необходимо указать query' });
        }
    
        const users = await User.findAll({
          where: {
            [Op.or]: [
              { nickname: { [Op.like]: `%${query}%` } },
              { email: { [Op.like]: `%${query}%` } },
            ],
          },
        });
    
        res.json({ users });
    } catch (error) {
        console.error('Ошибка при поиске пользователей:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};