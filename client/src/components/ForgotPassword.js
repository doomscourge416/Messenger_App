import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const navigate = useNavigate();

  // Шаг 1: Отправка кода восстановления
  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('Введите email.');
      return;
    }

    try {
      const response = await axios.post(
        '/api/auth/forgot-password',
        { email },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data.resetCode) {
        setResetCode(response.data.resetCode);
        setIsCodeSent(true);
        alert(`Код восстановления отправлен на ваш email: ${response.data.resetCode}`);
      } else {
        alert('Не удалось отправить код восстановления.');
      }
    } catch (error) {
      console.error('Ошибка при отправке кода восстановления:', error.response?.data || error.message);
      alert('Не удалось отправить код восстановления.');
    }
  };

  // Шаг 2: Сброс пароля
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetCode || !newPassword) {
      alert('Введите код восстановления и новый пароль.');
      return;
    }

    try {
      await axios.post(
        '/api/auth/reset-password',
        { resetCode, newPassword },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      alert('Пароль успешно изменен!');
      navigate('/'); // Перенаправляем на главную страницу
    } catch (error) {
      console.error('Ошибка при сбросе пароля:', error.response?.data || error.message);
      alert('Не удалось сбросить пароль. Проверьте код восстановления.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Забыли пароль?</h2>

      {/* Форма отправки кода */}
      {!isCodeSent && (
        <form onSubmit={handleSendCode}>
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

          <button
            type="submit"
            style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Получить код
          </button>
        </form>
      )}

      {/* Форма сброса пароля */}
      {isCodeSent && (
        <form onSubmit={handleResetPassword}>
          <div style={{ marginBottom: '10px' }}>
            <label>Код восстановления:</label>
            <input
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              placeholder="Введите код восстановления"
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Новый пароль:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Введите новый пароль"
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <button
            type="submit"
            style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Сбросить пароль
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;