const router = require('express').Router();
const {
  getUsers, getUserById, getUser, updateUser, updateAvatar,
} = require('../controllers/users');

router.get('/users/me', getUser);
router.get('/users', getUsers);
router.get('/users/:userId', getUserById);
router.patch('/users/me/avatar', updateAvatar);
router.patch('/users/me', updateUser);

module.exports = router;
