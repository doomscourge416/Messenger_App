import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = ({ token }) => {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [emailVisibility, setEmailVisibility] = useState(false);

  useEffect(() => {
    // Получаем информацию о текущем пользователе
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        setEmailVisibility(response.data.user.isEmailVisible);
      } catch (error) {
        console.error('Ошибка при получении профиля:', error.response?.data || error.message);
      }
    };

    fetchUser();
  }, [token]);

  // Метод для изменения аватара
  const handleUpdateAvatar = async () => {
    try {
      const newAvatarUrl = prompt('Введите URL аватара:');
      if (!newAvatarUrl) return;

      await axios.put(
        '/api/user/avatar',
        { avatarUrl: newAvatarUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Аватар успешно обновлен!');
      setUser((prevUser) => prevUser && { ...prevUser, avatarUrl: newAvatarUrl });
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error.response?.data || error.message);
      alert('Не удалось обновить аватар.');
    }
  };

  // Метод для переключения видимости email
  const handleToggleEmailVisibility = async () => {
    try {
      await axios.put(
        '/api/user/email-visibility',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Настройки email успешно обновлены!');
      setEmailVisibility((prev) => !prev); // Переключаем состояние
    } catch (error) {
      console.error('Ошибка при обновлении настроек email:', error.response?.data || error.message);
      alert('Не удалось обновить настройки email.');
    }
  };

  return (
    <div>
      <h2>Профиль</h2>

      {/* Отображение информации о пользователе */}
      {user && (
        <div>
          <img src={user.avatarUrl || '/default-avatar.png'} alt="Avatar" style={{ width: '50px', height: '50px' }} />
          <p>Никнейм: {user.nickname}</p>
          <p>Email: {emailVisibility ? user.email : 'Скрыт'}</p>
        </div>
      )}

      {/* Изменение аватара */}
      <button onClick={handleUpdateAvatar}>Изменить аватар</button>

      {/* Переключение видимости email */}
      <button onClick={handleToggleEmailVisibility}>Переключить видимость email</button> {/* Строка 70 */}
    </div>
  );
};

export default Profile;