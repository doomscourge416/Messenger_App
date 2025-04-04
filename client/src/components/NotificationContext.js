import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);

  const playNotificationSound = () => {
    console.log('Воспроизводим звук уведомления');
    if (isMuted) return;
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch((error) => {
      console.error('Ошибка при воспроизведении звука:', error);
    });
  };

  const showNotificationPopup = (message) => {
    console.log('Показываем всплывающее окно');
    if (!isMuted) {
      toast.info(`Новое сообщение: ${message.content}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <NotificationContext.Provider value={{ isMuted, setIsMuted, playNotificationSound, showNotificationPopup }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.error('useNotification должен использоваться внутри NotificationProvider');
  }
  return context;
};