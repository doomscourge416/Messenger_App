#!/bin/bash

echo "Установка зависимостей..."
npm install

echo "Выполнение миграций базы данных..."
npx sequelize-cli db:migrate

echo "Запуск Docker Compose..."
docker-compose up -d

echo "Запуск бэкенда ..."
npm run dev &

echo "Запуск фронтенда ..."
cd client && npm start