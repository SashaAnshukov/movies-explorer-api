const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Ограничение каждого IP до 100 запросов на «окно» (за 15 мин)
  standardHeaders: true, // Ограничение скорости возврата информация в заголовках `RateLimit-*`
  legacyHeaders: false, // Отключение заголовков `X-RateLimit-*`
});

module.exports = limiter;
