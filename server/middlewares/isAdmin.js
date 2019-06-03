const { ADMIN_ROLE } = require('../constants');

module.exports = (req, res, next) => {
  if (req.user.role !== ADMIN_ROLE) {
    return res.status(401).send('The user must be administrator')
  }
  
  next();
}