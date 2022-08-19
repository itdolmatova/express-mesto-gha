const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const auth = require('./middlewares/auth');
const { errors } = require('celebrate');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb')
  .then(() => console.log('Database Connected'))
  .catch((err) => console.log(err));

app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса
app.use((req, res, next) => {
  req.user = {
    _id: '62ea5d34d32cbe029536d479', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use(auth);
app.use('/', usersRouter);
app.use('/', cardsRouter);
app.use((req, res, next) => {
  res.status(404);
  res.json({ message: 'Некорректный роут' });
  next();
});
app.use(errors()); // обработчик ошибок celebrate
const escape = require('escape-html');

app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
