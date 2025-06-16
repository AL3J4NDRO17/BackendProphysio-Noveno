const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10000, // Máximo 100 solicitudes por IP
  message: "Demasiadas solicitudes de esta ip.",
});

module.exports = limiter;
