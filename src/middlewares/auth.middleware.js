const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized - No token provided", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log('[Subscription Service] Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Subscription Service] Token verified. Payload:', JSON.stringify(decoded));

    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('[Subscription Service] Token verification failed:', error.message);
    throw new AppError("Unauthorized - Invalid or expired token", 401);
  }
};
