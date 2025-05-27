@echo off

echo Установка зависимостей...
call npm install

echo Выполнение миграций базы данных...
call npx sequelize-cli db:migrate

echo Запуск Docker Compose...
docker-compose up -d

echo Запуск бэкенда ...
start npm run dev

echo Запуск фронтенда ...
cd client
start npm start