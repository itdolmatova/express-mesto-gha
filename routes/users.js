const {createUser, getUsers, getUserById, updateUser, updateAvatar } = require('../controllers/users');
const router = require('express').Router();

router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:userId', getUserById);
router.patch('/users/me', updateUser);
router.patch('/users/me/avatar', updateAvatar)

module.exports = router