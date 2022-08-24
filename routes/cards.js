const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  createCard, getCards, deleteCardById, addLikeCard, deleteLikeCard,
} = require('../controllers/cards');

router.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().required(),
  }).unknown(true),
}), createCard);
router.get('/cards', getCards);
router.delete('/cards/:cardId', deleteCardById);
router.put('/cards/:cardId/likes', addLikeCard);
router.delete('/cards/:cardId/likes', deleteLikeCard);

module.exports = router;
