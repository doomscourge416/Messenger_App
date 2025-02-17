const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },

});

module.exports = async (to, subject, html) => {
    from: `"Мессенджер" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
};

console.log('Письмо отправлено:', info.messageId);
// };