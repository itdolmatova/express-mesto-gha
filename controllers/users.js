const User = require('../models/user');

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then(user => res.send({ data: user }))
    .catch(err => res.status(500).send({ message: 'Произошла ошибка: ' + err }));
}

module.exports.getUsers = (req, res) => {
  User.find({})
    .then(users => res.send({ data: users }))
    .catch(err => res.status(500).send({ message: 'Произошла ошибка: ' + err }));
}

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then(user => res.send({ data: user }))
    .catch(err => res.status(500).send({ message: 'Произошла ошибка' + err }));
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about},
    // Передадим объект опций:
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true // данные будут валидированы перед изменением
    }
  )
    .then(user => res.send({ data: user }))
    .catch(err => res.send({ message: 'Произошла ошибка' + err }));
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar},
    // Передадим объект опций:
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true // данные будут валидированы перед изменением
    }
  )
    .then(user => res.send({ data: user }))
    .catch(err => res.send({ message: 'Произошла ошибка' + err }));
};