const {createUser, getUsers, getUserById} = require('../controllers/users');
const router = require('express').Router();

router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:userId', getUserById);

module.exports = router