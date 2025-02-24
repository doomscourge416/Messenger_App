import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onRegister }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');

    // Обработка отправки формы регистрации
    const handleSubmit = async (e) => {

        e.preventDefault();

        if(!email || !password || !nickname) {
            alert('Все поля должны быть заполнены.');
            return;
        };

        try {

            await axios.post(

                '/api/auth/register',
                { email, password, nickname },
                {
                    headers: { 'Content-type': 'application/json' },
                },

            )

            alert('Регистрация успешно завершена!');
            onRegister();
        } catch (error) {

            console.error('Ошибка при регистрации:', error.response?.data || error.message);
            alert('Не удалось зарегистрироваться. Проверьте данные.');

        }

    };

    return (

        <div>
            <h2>Регистрация</h2>
            <form onSubmit={handleSubmit}>

                <div>

                    <label>Email:</label>
                    <input 
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Введите email'
                        required
                    />

                </div>

                <div>

                    <label>Пароль:</label>
                    <input 
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Введите пароль'
                        required
                    />

                </div>

                <div>

                    <label>Никнейм:</label>
                    <input 
                        type='text'
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder='Введите никнейм'
                        required
                    />

                </div>

                <button type='submit'>Зарегистрироваться</button>

            </form>
        </div>

    )

};

export default Register;