// файл контроллеров фильмов.
const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');

// возвращает все фильмы
module.exports.getMovies = (request, response, next) => Movie.find({})
  .then((movies) => response.status(200).send({ data: movies }))
  .catch(next);

// удаляет фильм по _id
module.exports.deleteMovie = (request, response, next) => {
  const { id } = request.params;
  // console.log(request.params);
  // console.log(request.user._id);
  Movie.findById(id)
    .orFail(() => new NotFoundError(`Фильм с id ${id} не найден`))
    .then((movie) => {
      if (!movie.owner.equals(request.user._id)) {
        return next(new ForbiddenError('Недостаточно прав для удаления этого фильма'));
      }
      return movie.remove()
        .then(() => response.send({ message: 'Фильм удален' }));
    })
    .catch(next);
};

// создаёт фильм
module.exports.createMovie = (request, response, next) => {
  const {
    country, director, duration,
    year, description, image, trailerLink,
    thumbnail, nameRU, nameEN,
  } = request.body; // получим из объекта запроса название и ссылку фильма
  console.log(request.body);
  const owner = request.user._id;
  return Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner,
  }) // создадим фильм на основе пришедших данных
    .then((movie) => response.status(201).send({ data: movie })) // вернём записанные в базу данные
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequestError(`${Object.values(error.errors).map((err) => err.message).join(', ')}`));
      } else {
        next(error); // Для всех остальных ошибок
      }
    });
};

/* module.exports.likeCard = (request, response, next) => {
  Card.findByIdAndUpdate(
    request.params.id,
    { $addToSet: { likes: request.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError(`Запрашиваемый пользователь с id ${request.params.id} не найден`);
      }
      return response.status(201).send(card);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestError(`Переданный id ${request.params.id} не корректен`));
      } else {
        next(error); // Для всех остальных ошибок
      }
    });
};

module.exports.dislikeCard = (request, response, next) => {
  Card.findByIdAndUpdate(
  // console.log(request.user._id),
    request.params.id,
    { $pull: { likes: request.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError(`Запрашиваемый пользователь с id ${request.params.id} не найден`);
      }
      return response.status(201).send(card);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestError(`Переданный id ${request.params.id} не корректен`));
      } else {
        next(error); // Для всех остальных ошибок
      }
    });
}; */
