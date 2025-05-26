import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = ({ token }) => {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [emailVisibility, setEmailVisibility] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); 

  // Состояние формы изменения пароля
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // console.log('Token В PROFILE.JS:', token);

  useEffect(() => {
    // Получаем информацию о текущем пользователе
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        setEmailVisibility(response.data.user.isEmailVisible);
        console.log('response.data.user = ', response.data.user);
      } catch (error) {
        console.error('Ошибка при получении профиля:', error.response?.data || error.message);
      }
    };

    fetchUser();
  }, [token]);

  // Обработчик выбора файла
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if(file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitAvatar = async (event) => {
    event.preventDefault();

    if(!selectedFile){
      alert('Выберите файл для загрузки.');
      return
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      alert("Размер файла не должен превышать 2 МБ.");
      return;
    }

    try {

      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await axios.put("/api/user/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", 
        },
      })

      alert("Аватар успешно обновлён.");
      setUser((prevUser) => prevUser && {...prevUser, avatarUrl: response.data.avatarUrl });

    } catch(error) {

      console.error("Ошибка при обновлении аватара:", error.response?.data || error.message);
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


  // Если токен отсутствует, показываем сообщение
  if (!token) {
    return (
      <div>
        <h2>Профиль</h2>
        <p>Чтобы увидеть профиль, вам необходимо войти в систему.</p>
        <a href="/login">Страница входа</a>
      </div>
    );
  }

  // // Если пользователь еще не загружен, показываем загрузку
  // if (!user) {
  //   return (
  //     <div>
  //       <h2>Профиль</h2>
  //       <p>Чтобы увидеть профиль, вам необходимо войти в систему</p>
  //       <a href="/login">Страница входа</a>
  //     </div>
  //   );
  // }

  return (
    <div>
      <h2>Профиль</h2>

      {/* Отображение информации о пользователе */}
      {user && (
        <div>

          <img src={user.avatarUrl || '../../public/default-avatar.png'}
            alt={`${user.nickname}'s avatar`}
            className="round-img-large"
          />
          <p>Никнейм: {user.nickname}</p>
          <p>Email: {emailVisibility ? user.email : 'Скрыт'}</p>

        </div>
      )}

      <br></br>
      <br></br>

      {/* Изменение аватара */}

        <form onSubmit={handleSubmitAvatar}>
          <label htmlFor='avatarInput' className='avatar-upload'>
            <span>Выбрать файл</span>
            <input 
              id='avatarInput'
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          {previewUrl && <img src={previewUrl} alt="Preview" style={{ width: "100px" }} />}
          <button type='submit'>Загрузить аватар</button>
        </form>


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