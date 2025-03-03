import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin, onRegister, onForgotPassword }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Обработка отправки формы 
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await axios.post(
                '/api/auth/login',
                { email, password },
                {
                    headers: { 'Content-type': 'application/json' },
                }
            );

            const { token, user } = response.data;

            if (token && user ) {

                onLogin(token, user.id); //Передаем токен и ID пользователя в родительский компонент
                alert('Вы успешно вошли!');

            } else {

                alert('Неверный email или пароль!');

            }

        } catch(error) {

            console.error('Ошибка при входе:', error.response?.data || error.message );
            alert('Не удалось войти. Проверьте данные.');

        }

    };

    return (

        <div>
            <h2>Вход</h2>
            <form onSubmit={ handleSubmit }>

                <div>

                    <label>Email:</label>
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Введите Email'
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

                <button type='submit'>Войти</button>
                <button type="button" onClick={onRegister}>Зарегистрироваться</button>
                <button type="button" onClick={onForgotPassword}>Забыли пароль?</button>


            </form>
        </div>

    );

};

export default Login;