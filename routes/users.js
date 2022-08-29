const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUserById, getUser, updateUser, updateAvatar,
} = require('../controllers/users');
const { RegExpForLink } = require('../utils/RegExpForLink');

router.get('/users/me', getUser);
router.get('/users', getUsers);

router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24).required(),
  }),

}), getUserById);
router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().uri().pattern(RegExpForLink).required(),
  }),
}), updateAvatar);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUser);

module.exports = router;
