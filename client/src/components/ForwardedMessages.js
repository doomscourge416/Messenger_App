import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ForwardedMessages = ({ chatId, token }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchForwardedMessages = async () => {
      try {
        const response = await axios.get(`/api/messages/forwarded/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessages(response.data.messages);
      } catch (error) {
        console.error('Ошибка при получении пересланных сообщений:', error.response?.data || error.message);
      }
    };

    fetchForwardedMessages();
  }, [chatId, token]);

  return (
    <div>
      <h3>История пересланных сообщений</h3>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            {msg.content} (отправлено из чата #{msg.originalChatId})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ForwardedMessages;