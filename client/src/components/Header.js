import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ token, setToken }) => {
  const handleLogout = () => {
    localStorage.removeItem('messengerToken');
    setToken(null); // Обновляем состояние токена
    window.location.href = '/'; // Перенаправляем на главную страницу
  };

  return (
    <header>
      <nav>
        <Link to="/">Главная</Link> |{' '}
        {!token ? (
          <>
            <Link to="/register">Зарегистрироваться</Link> |{' '}
            <Link to="/login">Войти</Link> |{' '}
            <Link to="/forgot-password">Забыли пароль?</Link>
          </>
        ) : (
          <button onClick={handleLogout}>Выйти</button>
        )}
      </nav>
    </header>
  );
};

export default Header;