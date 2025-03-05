import React from 'react';
import { useState } from 'react';
import Profile from './Profile';

const Header = ({ token, setToken, setIsRegistering, setIsForgotPassword }) => {

    const [isProfileVisible, setIsProfileVisible] = useState(false);

    // Обработка выхода
    const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('messengerToken');
    alert('Вы вышли из системы.');
    };

    return (

        <header style={{ padding: '10px', backgroundColor: '#f4f4f4', borderBottom: '1px solid #ccc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-beetwen', alignItems: 'center' }}>
            
                {/* Логотип и название приложения */}
                <h1 style={{ margin: 0 }}>Мессенджер</h1>

                {/* Меню навигации */}
                {!token ? (
                    <nav>
                        <button onClick={() => setIsRegistering(true)}>Зарегистрироваться</button>
                        <button onClick={() => setIsForgotPassword(true)}>Забыли пароль?</button>
                    </nav>
                ) : (
                    <nav>
                        <button onClick={handleLogout}>Выйти</button>
                        <button onClick={() => setIsProfileVisible(true)}>Профиль</button>
                    </nav>

                ) }

            </div>

            {/* Отображение профиля */}
            {isProfileVisible && (

                <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <Profile />
                    <button onClick={() => setIsProfileVisible(false) }>Закрыть профиль</button>
                </div>

            )}
        </header>

    );

};    

export default Header;