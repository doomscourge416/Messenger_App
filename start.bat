@echo off

echo Запуск Docker Compose...
docker-compose up -d

echo Запуск бэкенда (npm run dev)...
start npm run dev

echo Запуск фронтенда (npm start)...
cd client
start npm start