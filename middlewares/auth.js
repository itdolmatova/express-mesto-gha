const jwt = require('jsonwebtoken');
const { WrongEmailOrPasswordError } = require('../errors/wrong-email-or-password-error');

module.exports = (req, res, next) => {
  // достаём авторизационный заголовок
  const { authorization } = req.headers;

  // убеждаемся, что он есть или начинается с Bearer
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res
      .status(WrongEmailOrPasswordError.statusCode)
      .send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    // отправим ошибку, если не получилось
    return res
      .status(WrongEmailOrPasswordError.statusCode)
      .send({ message: 'Необходима авторизация' });
  }

  req.user = payload;

  next();
  return undefined;
};
