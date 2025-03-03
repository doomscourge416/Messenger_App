import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = ({ onBack }) => {

    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await axios.post(
                '/api/auth/forgot-password',
                { email },
                {
                    headers: { 'Content-type': 'application/json' },
                }
            );

            alert('Ссылка для восстановления пароля отправлена на ваш email!');
            onBack();

        } catch(error) {

            console.error('Ошибка при отправке ссылки восстановления:', error.response?.data || error.message);
            alert('Не удалось отправить ссылку восстановления.');
        }

    };

    return (

        <div>
        <h2>Забыли пароль?</h2>
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Отправить ссылку</button>
                <button type="button" onClick={onBack}>Назад</button>
            </form>
        </div>

    );

};

export default ForgotPassword;