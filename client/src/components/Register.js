import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  // Обработка отправки формы регистрации
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !nickname) {
      alert('Все поля должны быть заполнены.');
      return;
    }

    try {
      await axios.post(
        '/api/auth/register',
        { email, password, nickname },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      alert('Регистрация успешно завершена!');
      navigate('/'); // Перенаправляем на главную страницу
    } catch (error) {
      console.error('Ошибка при регистрации:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Не удалось зарегистрироваться. Проверьте данные.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Введите email"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Никнейм:</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Введите никнейм"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};

export default Register;