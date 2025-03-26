const { createLogger, transports, format } = require("winston");
const path = require("path");
const fs = require("fs");
const { DateTime } = require("luxon");

// 📌 Ruta del archivo de logs
const logDir = path.join(__dirname, "../logs");

// 📌 Si la carpeta `logs/` no existe, créala
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 📌 Función para obtener la hora en formato `America/Mexico_City`
const getFormattedTime = () => {
    return DateTime.now().setZone("America/Mexico_City").toFormat("yyyy-MM-dd HH:mm:ss");
};

// 📌 Configuración del logger
// const logger = createLogger({
//     level: "info",
//     format: format.combine(
//         format.timestamp({ format: getFormattedTime }), // 🔥 Usa la hora en CDMX
//         format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
//     ),
//     transports: [
//         new transports.File({ filename: path.join(logDir, "app.log") }), // 📌 Guarda los logs en `logs/app.log`
//         new transports.Console(), // 📌 También muestra logs en la consola
//     ],
// });

const logger = createLogger({
    levels: {
        critical: 0, // 🔥 Nivel más alto para errores críticos
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    format: format.combine(
        format.timestamp({ format: getFormattedTime }),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        new transports.File({ filename: path.join(logDir, "app.log") }),
        new transports.Console(),
    ],
});

// 📌 Función personalizada para errores críticos
logger.critical = (message) => {
    logger.log({ level: "critical", message });
};


// 📌 Función para formatear logs con IP local detectada
const logRequest = (level, req, message) => {
    let ip = "IP desconocida";
    let route = "Ruta desconocida";

    if (req) {
        ip = req.headers?.["x-forwarded-for"] || req.connection?.remoteAddress || "IP desconocida";
        route = req.originalUrl || "Ruta desconocida";

        // 🔥 Convertir IP local IPv6 (::1) en IPv4 (127.0.0.1)
        if (ip === "::1" || ip === "::ffff:127.0.0.1") {
            ip = "127.0.0.1";
        }
    }

    const logMessage = `IP: ${ip} | Ruta: ${route} | Mensaje: ${message}`;
    logger.log(level, logMessage);
};

module.exports = { logger, logRequest };
