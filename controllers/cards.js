const Card = require('../models/card');
const { extractUser } = require('./users');
const { WrongDataError } = require('../errors/wrong-data-error');
const { WrongIdError } = require('../errors/wrong-id-error');

const extractCard = (card) => {
  const {
    createdAt, link, likes, owner, _id,
  } = card;
  const likers = likes ? likes.map((user) => extractUser(user)) : likes;
  return {
    createdAt, link, likes: likers, owner: (owner ? extractUser(owner) : null), _id,
  };
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => Card.populate(card, { path: 'owner' }))
    .then((card) => res.send(extractCard(card)))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new WrongDataError('Переданы некорректные данные при создании карточки.');
      } else {
        throw err;
      }
    })
    .catch(next);
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards.map((card) => extractCard(card))))
    .catch(next);
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new WrongIdError('Карточка с указанным _id не найдена.');
      }
      if (card.owner._id.toString() !== req.user._id) {
        throw new Error('Карточка создана не Вами, запрещено удалять чужие карточки');
      }

      return res.send({ message: 'Пост удалён' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new WrongDataError('Передан некорректный _id для удаления карточки.');
      } else {
        throw err;
      }
    })
    .catch(next);
};

module.exports.addLikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  ).populate(['owner', 'likes'])
    .then((card) => {
      if (card) {
        res.send(extractCard(card));
      } else {
        throw new WrongIdError('Передан несуществующий _id карточки.');
      }
    }).catch((err) => {
      if (err.name === 'CastError') {
        throw new WrongDataError('Переданы некорректные данные для постановки лайка.');
      } else {
        throw err;
      }
    })
    .catch(next);
};

module.exports.deleteLikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  ).populate(['owner', 'likes'])
    .then((card) => {
      if (card) {
        res.send(extractCard(card));
      } else {
        throw new WrongIdError('Передан несуществующий _id карточки.');
      }
    }).catch((err) => {
      if (err.name === 'CastError') {
        throw new WrongDataError('Переданы некорректные данные для снятия лайка.');
      } else {
        throw err;
      }
    })
    .catch(next);
};
