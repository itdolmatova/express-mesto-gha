const {createCard, getCards, deleteCardById} = require('../controllers/cards');
const router = require('express').Router();

router.post('/cards', createCard);
router.get('/cards', getCards);
router.delete('/cards/:cardId', deleteCardById);

module.exports = router;