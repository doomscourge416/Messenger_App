// import React, { useState, useEffect } from 'react';
// import ChatList from './components/ChatList';

import React, { useState } from 'react';
import axios from 'axios';

import Login from './components/Login';
import Register from './components/Register'; 
import Profile from './components/Profile';
import Header from './components/Header';
import ChatList from './components/ChatList';

import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('messengerToken') || null);

  // Обработка входа
  const handleLogin = (newToken, newUserId) => {
    setToken(newToken);
    localStorage.setItem('messengerToken', newToken);
    localStorage.setItem('userId', newUserId); // Сохраняем ID пользователя
  };

  // Обработка выхода
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('messengerToken');
    localStorage.removeItem('userId'); // Удаляем ID пользователя
    alert('Вы вышли из системы.');
  };

  return (
    <div className="App">
      <Header token={token} setToken={setToken} />

      {!token ? (
        <Login 
          onLogin={handleLogin} 
          onRegister={() => setIsRegistering(true)} 
          onForgotPassword={() => setIsForgotPassword(true)} 
        />
      ) : (
        <div>
          <button onClick={handleLogout}>Выйти</button>
          <ChatList token={token} />
        </div>
      )}
    </div>
  );
}

// function App() {
//   // const [userId, setUserId] = useState(null);
//   const [token, setToken] = useState(null);
//   const [setUserId] = useState(null);
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [isForgotPassword, setIsForgotPassword] = useState(false);
//   const [isResetPassword, setIsResetPassword] = useState(false);
//   const [isProfileVisible, setIsProfileVisible] = useState(false);

  
//   // Обработка входа
//   const handleLogin = async (newToken) => {
//     try {
//       const response = await axios.post('/api/auth/login', {}, {
//         headers: { Authorization: `Bearer ${newToken}` },
//       });

//       const newUserId = response.data.user.id; // Строка 30: объявляем newUserId
//       setToken(newToken);
//       localStorage.setItem('messengerToken', newToken);
//       localStorage.setItem('userId', newUserId); // Сохраняем ID пользователя
//     } catch (error) {
//       console.error('Ошибка при входе:', error.response?.data || error.message);
//       alert('Не удалось войти.');
//     }
//   };

//   // Обработка выхода
//   const handleLogout = () => {
//     setToken(null);
//     // setUserId(null);
//     localStorage.removeItem('messengerToken');
//     setIsProfileVisible(false);
//     alert('Вы вышли из системы.');
//   };

//   const handleRegisterClick = () => setIsRegistering(true);
//   const handleLoginClick = () => setIsRegistering(false);

//   const handleForgotPasswordClick = () => setIsForgotPassword(true); 
//   const handleBackClick = () => setIsForgotPassword(false);

//   const handleResetPasswordClick = () => setIsResetPassword(true); // Сброс пароля
//   const handleResetBackClick = () => setIsResetPassword(false); 

  
//   return (
//     <div className="App">

//       <Header 
//         token={token}
//         setTokent={setToken}
//         setIsRegistering={setIsRegistering}
//         setIsForgotPassword={setIsForgotPassword}
//       />
      
//       <h1>Мессенджер</h1>

//       {!token ? (
//         isRegistering ? (
//           <Register onBack={handleLoginClick} />
//         ) : isForgotPassword ? (
//           <ForgotPassword 
//             onBack={handleBackClick} 
//             onReset={handleResetPasswordClick}
//           />
//         ) : isResetPassword ? (
//           <ResetPassword onBack={handleResetBackClick} />
//         ) : (
//           <Login 
//             onLogin={handleLogin} 
//             onRegister={handleRegisterClick} 
//             onForgotPassword={handleForgotPasswordClick} 
//           />
//         )
//       ) : (
//         <div>
//           <button onClick={handleLogout}>Выйти</button>
//           <button onClick={ () => setIsProfileVisible(true) }>Профиль</button>
//           <ChatList token={token}/>

//           {/* Отображаем профиль */}
//           {isProfileVisible && <Profile token={token} onClose={() => setIsProfileVisible(false)} />}
//           {/* <Profile token={token} /> */}
//         </div>
//       )}
//     </div>
//   );
// }

export default App;