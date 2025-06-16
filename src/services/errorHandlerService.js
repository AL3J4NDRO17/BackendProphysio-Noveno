const { logRequest } = require("../services/loggerService");

/**
 * Middleware global para manejar errores.
 * - Si el error tiene status >= 500, se considera 'critical'.
 * - Si el error tiene .critical = true, también se considera 'critical'.
 * - Todo lo demás se loguea como 'error'.
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
    const errorMessage = err.message || "Error interno del servidor";

    const isCritical = err.critical === true;
    const logLevel = isCritical ? "critical" : "error";

    // ✅ Pasamos el error completo para incluir stack y ubicación si aplica
    logRequest(logLevel, req, errorMessage, err);

    res.status(statusCode).json({
        message: "Ocurrió un error en el servidor. Intenta más tarde.",
    });
};

module.exports = { errorHandler };
