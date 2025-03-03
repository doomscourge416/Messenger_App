import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword = ({ match, history }) => {

    const [newPassword, setNewPassword] = useState('');
    const resetToken = match.params.token;

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await axios.put(
                '/api/auth/reset-password',
                { token: resetToken, newPassword },
                {
                    headers: {'Content-type': 'application/json'},
                }
            );

            alert('Пароль успешно сброшен!');
            history.push('/login');

        } catch(error) {

            console.error('Ошибка при сбросе пароля:', error.response?.data || error.message );
            alert('Не удалось сбросить пароль.')

        }

    };


    return(

        <div>
            <h2>Сброс пароля</h2>
            <form onSubmit={handleSubmit}>
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
            <button type="submit">Сбросить пароль</button> {/* Строка 20 */}
            </form>
        </div>

    )

};

export default ResetPassword;