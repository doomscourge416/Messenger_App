const nodemailer = require('nodemailer');

// Создаем транспорт для отправки email
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Метод для отправки email
exports.sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    // Отправляем email
    const info = await transporter.sendMail(mailOptions); // Строка 19

    if (info && info.messageId) {
      console.log('Письмо отправлено:', info.messageId); // Строка 35
    } else {
      console.warn('Письмо не было отправлено или отсутствует messageId');
    }
  } catch (error) {
    console.error('Ошибка при отправке email:', error.message);
  }
};