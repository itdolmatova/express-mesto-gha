const Card = require('../models/card');
const { extractUser } = require('./users');

const extractCard = (card) => {
  const {
    createdAt, link, likes, owner, _id,
  } = card;
  const likers = likes ? likes.map((user) => extractUser(user)) : likes;
  return {
    createdAt, link, likes: likers, owner: extractUser(owner), _id,
  };
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .populate('owner')
    .then((card) => res.send(extractCard(card)))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        res.status(500).send({ message: `Произошла ошибка: ${err}` });
      }
    });
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards.map((card) => extractCard(card))))
    .catch((err) => res.status(500).send({ message: `Произошла ошибка: ${err}` }));
};

module.exports.deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => (card ? res.send({ message: 'Пост удалён' }) : res.status(404).send({ message: 'Карточка с указанным _id не найдена.' })))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Передан некорректный _id для удаления карточки.' });
      } else {
        res.status(500).send({ message: `Произошла ошибка: ${err}` });
      }
    });
};

module.exports.addLikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  ).populate(['owner', 'likes'])
    .then((card) => (card ? res.send(extractCard(card)) : res.status(404).send({ message: 'Передан несуществующий _id карточки.' })))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка.' });
      } else {
        res.status(500).send({ message: `Произошла ошибка: ${err}` });
      }
    });
};

module.exports.deleteLikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  ).populate(['owner', 'likes'])
    .then((card) => (card ? res.send(extractCard(card)) : res.status(404).send({ message: 'Передан несуществующий _id карточки.' })))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные для снятия лайка.' });
      } else {
        res.status(500).send({ message: `Произошла ошибка: ${err}` });
      }
    });
};
