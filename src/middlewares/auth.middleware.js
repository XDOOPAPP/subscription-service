const AppError = require("../errors/app.error");

module.exports = (req, res, next) => {
  try {
    next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
};
