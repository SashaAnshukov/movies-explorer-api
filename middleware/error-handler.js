const errorHandler = (error, request, response, next) => {
  const statusCode = error.statusCode || 500;

  const message = statusCode === 500 ? 'На сервере произошла ошибка' : error.message;
  console.log(error);
  response.status(statusCode).send({ message });
  next();
};

module.exports = errorHandler;
