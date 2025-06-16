const dotenv = require('dotenv');
dotenv.config();

const DailyRotateFile = require("winston-daily-rotate-file");
const { createLogger, transports, format } = require("winston");
const path = require("path");
const fs = require("fs");
const { DateTime } = require("luxon");

const isDev = process.env.NODE_ENV !== "production";

// ✅ Activa o desactiva JSON logs aquí:
const USE_JSON_LOGS = true; // ⬅️ Cambia a false para logs en texto plano

// 📌 Ruta del archivo de logs
const logDir = path.join(__dirname, "../logs");

const dailyRotateFileTransport = new DailyRotateFile({
    dirname: logDir, // carpeta logs/
    filename: "Log-%DATE%.log", // nombre del archivo por día
    datePattern: "YYYY-MM-DD", // formato del día
    zippedArchive: false, // puedes poner true si quieres .zip
    maxSize: "20m", // tamaño máximo antes de dividir
    maxFiles: "14d", // guarda logs por 14 días
});

// 📌 Si la carpeta `logs/` no existe, créala
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 📌 Función para obtener la hora en formato `America/Mexico_City`
const getFormattedTime = () => {
    return DateTime.now().setZone("America/Mexico_City").toFormat("yyyy-MM-dd HH:mm:ss");
};

const getStackLocation = (stack) => {
    const stackLines = stack?.split("\n");
    if (!stackLines || stackLines.length < 2) return null;

    const match = stackLines[1].match(/\((.*):(\d+):(\d+)\)/) || stackLines[1].match(/at (.*):(\d+):(\d+)/);
    if (match) {
        return {
            archivo: match[1],
            linea: match[2],
            columna: match[3],
        };
    }
    return null;
};

// 📌 Selección de formato según la constante
const selectedFormat = USE_JSON_LOGS
    ? format.combine(
        format.timestamp({ format: getFormattedTime }),
        format.errors({ stack: true }),
        format.json()
    )
    : format.combine(
        format.timestamp({ format: getFormattedTime }),
        format.errors({ stack: true }),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    );

// 📌 Configuración del logger
const logger = createLogger({
    levels: {
        critical: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    format: selectedFormat,
    transports: [
        dailyRotateFileTransport,
        new transports.Console(),
    ],
});


logger.critical = (message) => {
    logger.log({ level: "critical", message });
};


// 📌 Función para formatear logs con IP local detectada
// 🌍 Detecta si estás en desarrollo

const logRequest = (level, req, message, err = null) => {
    let ip = req?.headers?.["x-forwarded-for"] || req?.connection?.remoteAddress || "IP desconocida";
    let route = req?.originalUrl || "Ruta desconocida";
    let method = req?.method || "Método desconocido";
    let protocol = req?.protocol || "Protocolo desconocido";

    if (ip === "::1" || ip === "::ffff:127.0.0.1") {
        ip = "127.0.0.1";
    }

    const location = err?.stack ? getStackLocation(err.stack) : null;

    if (USE_JSON_LOGS) {
        const logData = {
            ip,
            metodo: method,
            protocolo: protocol.toUpperCase(),
            ruta: route,
            mensaje: message,
        };

        if (location) {
            logData.ubicacion = {
                archivo: location.archivo,
                linea: location.linea,
                columna: location.columna,
            };
        }

        if (err?.stack && isDev) {
            logData.stack = err.stack;
        }

        logger.log(level, logData);
    } else {
        let logMessage = `IP: ${ip} | Metodo: ${method} | Protocolo: ${protocol.toUpperCase()} | Ruta: ${route} | Mensaje: ${message}`;

        if (location) {
            logMessage += `| Ubicación: ${location.archivo} | Línea: ${location.linea} | Columna: ${location.columna}`;
        }

        if (err?.stack && isDev) {
            logMessage += `\nSTACK: ${err.stack}`;
        }

        logger.log(level, logMessage);
    }
};


module.exports = { logger, logRequest };
