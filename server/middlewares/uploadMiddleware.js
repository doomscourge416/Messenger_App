const multer = require('multer');
const path = require('path');

// Настройка multer для сохранения файлов
const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, 'uploads/');

    }, 

    filename: function (req, file, cb) {

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9 );
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Уникально имя для файлов

    },

});

const upload = multer({ storage });

module.exports = upload;