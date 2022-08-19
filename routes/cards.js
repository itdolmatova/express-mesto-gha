const router = require('express').Router();
const {
  createCard, getCards, deleteCardById, addLikeCard, deleteLikeCard,
} = require('../controllers/cards');

router.post('/cards', createCard);
router.get('/cards', getCards);
router.delete('/cards/:cardId', deleteCardById);
router.put('/cards/:cardId/likes', addLikeCard);
router.delete('/cards/:cardId/likes', deleteLikeCard);

module.exports.createCard = (req, res) => Card.create({
  name: req.body.name,
  link: req.body.link,
  owner: req.user._id, // используем req.user
});

module.exports = router;
