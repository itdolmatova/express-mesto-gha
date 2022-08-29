const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const {
  createUser, login,
} = require('./controllers/users');
const { RegExpForLink } = require('./utils/RegExpForLink');

const auth = require('./middlewares/auth');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb')
  .then(() => console.log('Database Connected'), {
    autoIndex: true,
  })
  .catch((err) => console.log(err));

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().uri().pattern(RegExpForLink),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

app.use(auth);
app.use('/', usersRouter);
app.use('/', cardsRouter);
app.use((req, res) => {
  res.status(404);
  res.json({ message: 'Некорректный роут' });
});
app.use(errors()); // обработчик ошибок celebrate
app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;
  console.log(err);
  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });

  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
