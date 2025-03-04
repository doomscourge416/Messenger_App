import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword = ({ onBack }) => {

    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);  // Состояние загрузки
    const [error, setError] = useState(null);
    // const resetToken = match.params.token;

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
    
      try {
        const response = await axios.put(
          '/api/auth/reset-password',
          { email, resetCode, newPassword },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
    
        if (response.data.message === 'Пароль успешно сброшен') {
          alert('Пароль успешно сброшен!');
          onBack(); // Возвращаемся на страницу входа
        } else {
          alert('Неизвестная ошибка при сбросе пароля.');
        }
      } catch (error) {
        console.error('Ошибка при сбросе пароля:', error.response?.data || error.message);
        setError(error.response?.data?.message || 'Неизвестная ошибка');
        alert(`Ошибка: ${error.response?.data?.message || 'Неизвестная ошибка'}`);
      } finally {
        setLoading(false);
      }
    };


    return(

        // <div>
        //     <h2>Сброс пароля</h2>
        //     <form onSubmit={handleSubmit}>
        //     <div>
        //         <label>Новый пароль:</label>
        //         <input
        //         type="password"
        //         value={newPassword}
        //         onChange={(e) => setNewPassword(e.target.value)}
        //         placeholder="Введите новый пароль"
        //         required
        //         />
        //     </div>
        //     <button type="submit">Сбросить пароль</button> {/* Строка 20 */}
        //     </form>
        // </div>
        <div>
        <h2>Сброс пароля</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label>Код восстановления:</label>
            <input
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              placeholder="Введите код"
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Сброс...' : 'Сбросить пароль'}
            </button>

            <button type="button" onClick={onBack} disabled={loading}>
                Назад
            </button>
        </form>
      </div>

    )

};

export default ResetPassword;