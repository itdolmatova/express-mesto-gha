const router = require('express').Router();
const {
  createCard, getCards, deleteCardById, addLikeCard, deleteLikeCard,
} = require('../controllers/cards');

router.post('/cards', createCard);
router.get('/cards', getCards);
router.delete('/cards/:cardId', deleteCardById);
router.put('/cards/:cardId/likes', addLikeCard);
router.delete('/cards/:cardId/likes', deleteLikeCard);

module.exports = router;
