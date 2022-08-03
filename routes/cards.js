/*const Card = require('../models/card');
const router = require('express').Router();

router.post('/', (req, res) => {
  const { name, link, owner, likes, createdAt  } = req.body;

  Card.create({ name, link, owner, likes, createdAt })
    .then(user => res.send({ data: user }))
    .catch(err => res.status(500).send({ message: 'Произошла ошибка' }));
});*/