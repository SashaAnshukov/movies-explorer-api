// файл контроллеров пользователя.
const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const ForbiddenError = require('../errors/forbidden-error');

const { NODE_ENV, JWT_SECRET } = process.env;

// создание пользователя, signup
module.exports.createUser = (request, response, next) => {
  // получим из объекта запроса имя, описание, аватар пользователя
  const {
    name, email, password,
  } = request.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    })) // создадим пользователя на основе пришедших данных
    .then((user) => response.status(201).send(user))
    .catch((error) => {
      // console.log(error.name);
      if (error.name === 'ValidationError') {
        next(new BadRequestError(`${Object.values(error.errors).map((err) => err.message).join(', ')}`));
      } else if (error.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует'));
      } else {
        next(error); // Для всех остальных ошибок
      }
    });
};

// login
module.exports.login = (request, response, next) => {
  const { email, password } = request.body;
  // console.log(request.body);
  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      // const token = jwt.sign({ _id: user._id }, 'super-strong-secret');
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
      // вернём токен
      response
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          secure: true,
          sameSite: 'none', // <-- Выключаем данную опцию
        })
        .send({ data: user.toJSON() });
    })
    .catch(next);
};

// выход
module.exports.signout = (req, res) => {
  res
    .status(200)
    .clearCookie('jwt')
    .send({ message: 'Выход' });
};

// информация о текущем пользователе
module.exports.getUser = (request, response, next) => {
  const userId = request.user._id;
  console.log(request.user);
  User.findById(userId)
    .then((user) => {
      if (user) {
        return response.send({
          data: user,
        });
      }
      throw new ForbiddenError (`Пользователь по указанному id ${request.user._id} не найден`);
    })
    .catch(next);
};

// обновление профиля
module.exports.updateUser = (request, response, next) => User.findByIdAndUpdate(
  // console.log(request.user._id),
  request.user._id,
  { name: request.body.name, email: request.body.email },
  { new: true, runValidators: true }, // обработчик then получит на вход обновлённую запись
)
  .then((userUpdate) => {
    if (!userUpdate) {
      throw new NotFoundError(`Запрашиваемый пользователь с id ${request.user._id} не найден`);
    }
    return response.send({ data: userUpdate });
  })
  .catch((error) => {
    if (error.name === 'ValidationError') {
      next(new BadRequestError(`${Object.values(error.errors).map((err) => err.message).join(', ')}`));
    } else if (error.code === 11000) {
      next(new ConflictError
        (`Пользователь с таким email - ${request.body.email} уже существует, введите другой email`)
      );
    } else {
      next(error); // Для всех остальных ошибок
    }
  });
