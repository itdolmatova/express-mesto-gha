const {createCard, getCards, deleteCardById, addLikeCard, deleteLikeCard} = require('../controllers/cards');
const router = require('express').Router();

router.post('/cards', createCard);
router.get('/cards', getCards);
router.delete('/cards/:cardId', deleteCardById);
router.put('/cards/:cardId/likes', addLikeCard);
router.delete('/cards/:cardId/likes', deleteLikeCard);

module.exports = router;