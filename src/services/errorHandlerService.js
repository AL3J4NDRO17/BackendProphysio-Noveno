const { logRequest } = require("../services/loggerService");

const errorHandler = (err, req, res, next) => {
    let ip = req?.headers?.["x-forwarded-for"] || req?.connection?.remoteAddress || "IP desconocida";

    // 🔥 Convertir IP local IPv6 (::1) en IPv4 (127.0.0.1)
    if (ip === "::1" || ip === "::ffff:127.0.0.1") {
        ip = "127.0.0.1";
    }
    console.log(err)
    const statusCode = err.status || 500;
    const errorMessage = err.message || "Error interno del servidor";

    // 🔥 Registrar error en el logger con IP detectada
    logRequest("critical", req, errorMessage);

    res.status(statusCode).json({
        message: "Ocurrió un error en el servidor. Intenta más tarde.",
    });
};

module.exports = { errorHandler };
