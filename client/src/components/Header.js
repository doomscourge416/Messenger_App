import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ token, setToken, setIsRegistering, setIsForgotPassword }) => {
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const navigate = useNavigate();

  // Обработка выхода
  const handleLogout = async () => {
    try {
      // Отправляем запрос на сервер для logout
      await axios.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('messengerToken')}` },
      });
  
      // Очищаем локальное состояние
      localStorage.removeItem('messengerToken');
      setToken(null);
  
      alert('Вы успешно вышли из системы.');
      navigate('/'); // Перенаправляем на главную страницу
    } catch (error) {
      console.error('Ошибка при выходе:', error.response?.data || error.message);
      alert('Не удалось выйти из системы.');
    }
  };

  return (
    <header style={{ padding: '10px', backgroundColor: '#f4f4f4', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Логотип и название приложения */}
        <h1 style={{ margin: 0 }}>Мессенджер</h1>

        {/* Меню навигации */}
        <nav>
          {!token ? (
            <>
              <Link to="/register">
                <button>Зарегистрироваться</button>
              </Link>
              <Link to="/forgot-password">
                <button>Забыли пароль?</button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/">
                <button onClick={handleLogout}>Выйти</button>
              </Link>
              <Link to="/profile">
                <button>Профиль</button>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Отображение профиля */}
      {isProfileVisible && (
        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p>Информация о профиле...</p>
          <button onClick={() => setIsProfileVisible(false)}>Закрыть профиль</button>
        </div>
      )}
    </header>
  );
};

export default Header;