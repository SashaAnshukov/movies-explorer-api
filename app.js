require('dotenv').config(); // модуль для загрузки env-переменных в Node.js
const express = require('express');

const app = express();
const mongoose = require('mongoose'); //+
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const userRoutes = require('./routes/users'); // импортируем роуты пользователя
const movieRoutes = require('./routes/movies'); // импортируем роуты фильмов
const errorHandler = require('./middleware/error-handler');
const { requestLogger, errorLogger } = require('./middleware/logger');
const rateLimiter = require('./middleware/rateLimiter');
const NotFoundError = require('./errors/not-found-error');

const { PORT = 3001 } = process.env;

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(requestLogger);
app.use(rateLimiter);

// Массив доменов, с которых разрешены кросс-доменные запросы
const allowedCors = [
  'http://localhost:3001',
  'http://jet.nomoredomains.work',
  'https://jet.nomoredomains.work',
  'http://api.jet.nomoredomains.work',
  'https://api.jet.nomoredomains.work',
];

// безопасность
app.use((req, res, next) => {
  // Сохраняем источник запроса в переменную origin и
  // проверяем, что источник запроса есть среди разрешённых
  const { origin } = req.headers;
  const { method } = req; // Сохраняем тип запроса (HTTP-метод) в соответствующую переменную
  const requestHeaders = req.headers['access-control-request-headers'];
  // Значение для заголовка Access-Control-Allow-Methods по умолчанию (разрешены все типы запросов)
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  if (allowedCors.includes(origin)) {
    // устанавливаем заголовок, который разрешает браузеру запросы с этого источника
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', true);
  }
  // Если это предварительный запрос, добавляем нужные заголовки
  if (method === 'OPTIONS') {
    // разрешаем кросс-доменные запросы любых типов (по умолчанию)
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    // завершаем обработку запроса и возвращаем результат клиенту
    res.header('Access-Control-Allow-Headers', requestHeaders);
    // завершаем обработку запроса и возвращаем результат клиенту
    res.end();
    return;
  }
  next();
});

app.use('/', userRoutes); // запускаем импортированные роуты
app.use('/', movieRoutes); // запускаем импортированные роуты

mongoose.connect('mongodb://localhost:27017/bitfilmsdb');

app.use((req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

app.use(errorLogger); // подключаем логгер ошибок
app.use(errors()); // обработчик ошибок celebrate
app.use(errorHandler); // централизованный обработчик ошибок (500 )

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});