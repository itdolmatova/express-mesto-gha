const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  ERROR_CODE_WRONG_DATA, ERROR_CODE_WRONG_EMAIL_OR_PASSWORD,
  ERROR_CODE_WRONG_ID, ERROR_CODE_UNKNOWN_SERVER_ERROR,
} = require('../utils/utils');

function extractUser(user) {
  const {
    about, avatar, name, _id, email, password,
  } = user;
  return {
    about, avatar, name, _id, email, password,
  };
}

module.exports.extractUser = extractUser;

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!password) {
    res.status(ERROR_CODE_WRONG_DATA).send({ message: 'Переданы некорректные данные при создании пользователя.' });
    return;
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.send(extractUser(user)))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_WRONG_DATA).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        res.status(ERROR_CODE_UNKNOWN_SERVER_ERROR).send({ message: `Произошла ошибка: ${err}` });
      }
    });
};

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users.map((user) => extractUser(user))))
    .catch((err) => res.status(ERROR_CODE_UNKNOWN_SERVER_ERROR).send({ message: `Произошла ошибка: ${err}` }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => (user ? res.send(extractUser(user)) : res.status(ERROR_CODE_WRONG_ID).send({ message: 'Пользователь по указанному _id не найден.' })))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_WRONG_DATA).send({ message: 'Пользователь по указанному _id не найден.' });
      } else {
        res.status(ERROR_CODE_UNKNOWN_SERVER_ERROR).send({ message: `Произошла ошибка: ${err}` });
      }
    });
};

module.exports.getUser = (req, res) => {
  User.findById(req.user._id)
    .then((user) => res.send(extractUser(user)))
    .catch((err) => {
      res.status(ERROR_CODE_UNKNOWN_SERVER_ERROR).send({ message: `Произошла ошибка: ${err}` });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    // Передадим объект опций:
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  ).then((user) => (user ? res.send(extractUser(user)) : res.status(ERROR_CODE_WRONG_ID).send({ message: 'Пользователь с указанным _id не найден.' })))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_WRONG_DATA).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      } else {
        res.status(ERROR_CODE_UNKNOWN_SERVER_ERROR).send({ message: `Произошла ошибка: ${err}` });
      }
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    // Передадим объект опций:
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  )
    .then((user) => (user ? res.send(extractUser(user)) : res.status(ERROR_CODE_WRONG_ID).send({ message: 'Пользователь с указанным _id не найден.' })))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_WRONG_DATA).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      } else {
        res.status(ERROR_CODE_UNKNOWN_SERVER_ERROR).send({ message: `Произошла ошибка: ${err}` });
      }
    });
};

module.exports.signUp = (req, res) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash, // записываем хеш в базу
    }))
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((err) => {
      res.status(ERROR_CODE_WRONG_DATA).send(err);
    });
};
// controllers/users.js

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // аутентификация успешна! пользователь в переменной user
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: 604800 }, // токен будет просрочен через неделю после создания
      );
      // вернём токен
      res.send({ token });
    })
    .catch((err) => {
      // ошибка аутентификации
      res
        .status(ERROR_CODE_WRONG_EMAIL_OR_PASSWORD)
        .send({ message: err.message });
    });
};
