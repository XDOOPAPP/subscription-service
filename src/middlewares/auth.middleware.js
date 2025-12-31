const AppError = require("../utils/appError")

module.exports = (req, res, next) => {
  try {
    next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
};
