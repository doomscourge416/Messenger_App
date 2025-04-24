import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Header = ({ token, setToken }) => {

  const [user, setUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('messengerToken');
    setToken(null); // Обновляем состояние токена
    setUser(null); // Очищаем данные пользователя
    window.location.href = '/'; // Перенаправляем на главную страницу
  };
  
  useEffect(()=> {
    const fetchUserProfile = async () => {
      if(token){
        try{
          const response = await axios.get('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Fetch User Profile at HEADER returns: ', response.data.user)
          setUser(response.data.user);
        }catch(error){
          console.error('Ошибка при получении профиля', error.response?.data || error.message );

        }
      } else {
        setUser(null);
      }

    }

    fetchUserProfile();

  }, [token] );
  
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
          <>
          <img 
            className='round-img'
            src={user?.avatarUrl || '/default-avatar.png'}
            alt={user?.nickname || "Avatar"}
            onClick={() => (token ? window.location.href = '/profile' : window.location.href = '/login')}
          />
          <button onClick={handleLogout}>Выйти</button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;