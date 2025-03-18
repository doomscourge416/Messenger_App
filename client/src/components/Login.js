import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken, setUserId }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;

    // Сохраняем токен и ID пользователя в localStorage
    localStorage.setItem('messengerToken', token);
    localStorage.setItem('userId', user.id);

    // Обновляем состояние приложения
    setToken(token);
    setUserId(user.id);

      // Перенаправляем на главную страницу
      navigate('/');
    } catch (error) {
      console.log('Ошибка при входе:', error.response?.data || error.message);
      console.error('Ошибка при входе:', error.response?.data || error.message);
      alert('Не удалось войти.');
    }
  };

  return (
    <div className="login-form">
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default Login;