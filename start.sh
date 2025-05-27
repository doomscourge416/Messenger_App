#!/bin/bash

echo "Запуск Docker Compose..."
docker-compose up -d

echo "Запуск бэкенда (npm run dev)..."
npm run dev &

echo "Запуск фронтенда (npm start)..."
cd client && npm start