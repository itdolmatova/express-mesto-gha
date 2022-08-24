const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { WrongDataError } = require('../errors/wrong-data-error');
const { WrongEmailOrPasswordError } = require('../errors/wrong-email-or-password-error');
const { WrongIdError } = require('../errors/wrong-id-error');
const { EmailAlreadyExistError } = require('../errors/email-already-exist-error');

function extractUser(user) {
  const {
    about, avatar, name, _id, email, password,
  } = user;
  return {
    about, avatar, name, _id, email, password,
  };
}

module.exports.extractUser = extractUser;

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!password) {
    throw new WrongDataError('Переданы некорректные данные при создании пользователя.');
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.send(extractUser(user)))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new WrongDataError('Переданы некорректные данные при создании пользователя.');
      } else if (err.code === 11000) {
        throw new EmailAlreadyExistError('Пользователь с таким email уже существует');
      } else {
        throw err;
      }
    })
    .catch(next);
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users.map((user) => extractUser(user))))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send(extractUser(user));
      } else {
        throw new WrongIdError('Пользователь по указанному _id не найден.');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') { // mongoose object id invalid format
        throw new WrongDataError('Пользователь по указанному _id не найден.');
      } else {
        throw err;
      }
    }).catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send(extractUser(user)))
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    // Передадим объект опций:
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  ).then((user) => {
    if (user) {
      res.send(extractUser(user));
    } else throw new WrongIdError('Пользователь с указанным _id не найден.');
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      throw new WrongDataError('Переданы некорректные данные при обновлении профиля.');
    } else {
      throw err;
    }
  }).catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
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
    .then((user) => {
      if (user) {
        res.send(extractUser(user));
      } else throw new WrongIdError('Пользователь с указанным _id не найден.');
    }).catch((err) => {
      if (err.name === 'ValidationError') {
        throw new WrongDataError('Переданы некорректные данные при обновлении аватара.');
      } else {
        throw err;
      }
    }).catch(next);
};

module.exports.login = (req, res, next) => {
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
    .catch(() => {
      // ошибка аутентификации
      throw new WrongEmailOrPasswordError('Некорректный Email или пароль');
    }).catch(next);
};
