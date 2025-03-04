import React, { useState } from 'react';
import axios from 'axios';


const ForgotPassword = ({ onBack, onReset }) => {

    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState(null);

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {


            const response = await axios.post(
                '/api/auth/forgot-password',
                { email },
                {
                    headers: { 'Content-type': 'application/json' },
                }
            );

            if (response.data.resetCode) {
                setResetCode(response.data.resetCode); // Получаем код восстановления
                alert(`Код восстановления: ${response.data.resetCode}. Сохраните его.`);
                onReset();
                // onBack();
            } else {
                alert('Не удалось получить код восстановления.')
            }

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
                <button type="submit">Получить код</button>
                <button type="button" onClick={onBack}>Назад</button>
            </form>

            {/* Отображаем код восстановления */}
            {resetCode && (
                <p>
                    Ваш код восстановления: <strong>{resetCode}</strong>
                </p>
            )}
        </div>

    );

};

export default ForgotPassword;