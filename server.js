const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./src/routes/routes");
const { sequelize, connectDB } = require("./src/config/database");
const { errorHandler } = require("./src/services/errorHandlerService");
const { logger, logRequest } = require("./src/services/loggerService");
const { createCriticalError } = require("./src/utils/errorUtils/errorUtils");

const corsOptions = require("./src/setup/corsSetup");
const helmetConfig = require("./src/setup/helmetSetup");
const csrfProtection = require("./src/setup/csrfSetup");
const limiter = require("./src/setup/rateLimiterSetup");

const { PORT } = require("./src/config/index");

const app = express();


// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(helmetConfig);
// app.use(csrfProtection);
app.use(limiter);


app.get("/test-critical", (req, res, next) => {
  const error = createCriticalError("Fallo crítico simulado");
  next(error);
});



app.get("/test-error", (req, res, next) => {
  try {
    throw new Error("Este es un error normal.");
  } catch (error) {
    next(error); // El middleware decide que es 'error'
  }
});

app.get("/generate-many-logs", (req, res) => {
  const total = 500; // cantidad de logs que quieres generar

  for (let i = 0; i < total; i++) {
    const random = Math.floor(Math.random() * 5);
    const msg = `Log de prueba #${i}`;

    switch (random) {
      case 0:
        logRequest("info", req, `${msg} - nivel info`);
        break;
      case 1:
        logRequest("warn", req, `${msg} - advertencia`);
        break;
      case 2:
        logRequest("debug", req, `${msg} - debug interno`);
        break;
      case 3:
        logRequest("error", req, `${msg} - error simulado`, new Error("Simulated error"));
        break;
      case 4:
        logRequest("critical", req, `${msg} - fallo crítico`, new Error("Simulated crash"));
        break;
    }
  }

  res.status(200).send(`${total} logs generados como prueba`);
});




app.get("/test-warn", (req, res) => {
  logRequest("warn", req, "Este es un mensaje de advertencia.");
  res.status(200).send("WARN: Advertencia registrada.");
});


process.on("uncaughtException", (err) => {
  logger.critical(`Excepción no capturada: ${err.message}`);
  process.exit(1); // si quieres cerrar el server
});

process.on("unhandledRejection", (reason, promise) => {
  logger.critical(`Rechazo no manejado: ${reason}`);
});




// Rutas
app.use("/api", routes);

// Middleware para manejar errores
app.use(errorHandler);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Conectar a la base de datos y arrancar el servidor
connectDB().then(() => {
  sequelize.sync().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("Error al sincronizar la base de datos:", err);
    process.exit(1);
  });
}).catch(err => {
  logger("critical", "Error al conectar a la base de datos");
  console.error("Error al conectar a la base de datos:", err);
  process.exit(1);
});
