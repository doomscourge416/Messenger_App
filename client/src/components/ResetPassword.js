import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const ResetPassword = ({ onBack }) => {
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const navigate = useNavigate(); // Инициализация навигации

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Введите email.');
      return;
    }

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      if (response.data.resetCode) {
        setResetCode(response.data.resetCode);
        alert(`Код восстановления отправлен на ваш email: ${response.data.resetCode}`);
      } else {
        alert('Не удалось отправить код восстановления.');
      }
    } catch (error) {
      console.error('Ошибка при отправке кода восстановления:', error.response?.data || error.message);
      alert('Не удалось отправить код восстановления.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
  
    if (!resetCode || !newPassword) {
      alert('Введите код восстановления и новый пароль.');
      return;
    }
  
    try {
      const response = await axios.put('/api/auth/reset-password', {
        resetCode,
        newPassword,
      });
  
      if (response.data.message === 'Пароль успешно изменен') {
        alert('Пароль успешно изменен!');
        navigate('/'); // Перенаправляем на главную страницу
      } else {
        alert('Неизвестная ошибка при сбросе пароля.');
      }
    } catch (error) {
      console.error('Ошибка при сбросе пароля:', error.response?.data || error.message);
      alert(`Ошибка: ${error.response?.data?.message || 'Неизвестная ошибка'}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/auth/reset-password', {
        resetCode,
        newPassword,
      });

      if (response.data.message === 'Пароль успешно изменен') {
        alert('Пароль успешно изменен!');
        onBack(); // Возвращаемся на страницу входа
      } else {
        setError('Неизвестная ошибка при сбросе пароля.');
      }
    } catch (error) {
      console.error('Ошибка при сбросе пароля:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Неизвестная ошибка');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Забыли пароль?</h2>

      {/* Форма отправки кода */}
      {!resetCode && (
        <form onSubmit={handleSendCode}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              required
            />
          </div>
          <button type="submit">Отправить код</button>
        </form>
      )}

      {/* Форма сброса пароля */}
      {resetCode && (
        <form onSubmit={handleResetPassword}>
          <div>
            <label>Код восстановления:</label>
            <input
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              placeholder="Введите код"
              required
            />
          </div>
          <div>
            <label>Новый пароль:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Введите новый пароль"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Сброс...' : 'Сбросить пароль'}
          </button>
          <button type="button" onClick={onBack} disabled={loading}>
            Назад
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;