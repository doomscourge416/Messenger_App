import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = ({ token, onClose }) => {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [emailVisibility, setEmailVisibility] = useState(false);

  // Состояние формы изменения пароля
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

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


  // Метод для изменения пароля
  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        '/api/auth/change-password',
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Пароль успешно изменен!');
      setOldPassword(''); // Очищаем старый пароль
      setNewPassword(''); // Очищаем новый пароль
    } catch (error) {
      console.error('Ошибка при изменении пароля:', error.response?.data || error.message);
      alert('Не удалось изменить пароль. Проверьте данные.');
    }
  };


  return (
    <div>

      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', maxWidth: '400px', margin: '20px auto' }}>
        <h2>Профиль</h2>
        {user && (
          <div>
            <p>Никнейм: {user.nickname}</p>
            <p>Email: {user.isEmailVisible ? user.email : 'Скрыт'}</p>
            <img src={user.avatarUrl || '/default-avatar.png'} alt="Avatar" style={{ width: '50px', height: '50px' }} />
          </div>
        )}

        {/* Кнопка закрытия профиля */}
        <button onClick={onClose}>Закрыть профиль</button> {/* Строка 90 */}
        
      </div>


      {/* Изменение аватара */}
      <button onClick={handleUpdateAvatar}>Изменить аватар</button>

      {/* Переключение видимости email */}
      <button onClick={handleToggleEmailVisibility}>Переключить видимость email</button> {/* Строка 70 */}

      {/* Форма для изменения пароля */}
      <form onSubmit={handleChangePassword}>

        <div>
          <label>Текущий пароль:</label>
          <input
            type='password'
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder='Введите текущий пароль'
            required
          />
        </div>

        <div>
          <label>Новый пароль:</label>
          <input
            type='password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder='Введите новый пароль'
            required
          />
        </div>
        <button type='submit'>Изменить пароль</button>

      </form>
    </div>
  );
};

export default Profile;