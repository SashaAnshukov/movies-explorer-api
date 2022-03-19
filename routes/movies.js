// файл маршрутов карточек
const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middleware/auth');
const validateURL = require('../middleware/methods');

const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movies');

// авторизация
router.use(auth);

// роуты, требующие авторизации
router.get('/movies', getMovies);

router.post(
  '/movies',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().custom(validateURL, 'custom validation'),
      trailerLink: Joi.string().required().custom(validateURL, 'custom validation'),
      thumbnail: Joi.string().required().custom(validateURL, 'custom validation'),
      movieId: Joi.required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie,
);

router.delete(
  '/movies/:id',
  // валидация
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().hex().length(24),
    }),
  }),
  deleteMovie,
);

module.exports = router;
