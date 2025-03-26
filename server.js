const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./src/routes/routes");
const { sequelize, connectDB } = require("./src/config/database");
const { errorHandler } = require("./src/services/errorHandlerService");
const { logger, logRequest } = require("./src/services/loggerService");

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
app.use(csrfProtection);
app.use(limiter);

app.get("/test-critical", (req, res) => {
  try {
    // Simula un error fatal que causa la caída del servidor
    throw new Error("Este es un error CRÍTICO simulado.");
  } catch (error) {
    res.status(500).send(error,"CRITICAL ERROR: Algo muy grave salió mal.");
    process.exit(1); // Esto termina el servidor para simular un fallo crítico
  }
});
app.get("/test-error", (req, res) => {
  try {
    // Simula un error al hacer algo incorrecto
    throw new Error("Este es un error simulado.");
  } catch (error) {
    logger.error(`ERROR: ${error.message}`);
    res.status(500).send("ERROR: Algo salió mal.");
  }
});

app.get("/test-warn", (req, res) => {
  logger.warn("Este es un mensaje de advertencia.");
  res.status(200).send("WARN: Advertencia registrada.");
});


// Rutas
app.use("/api", routes);

// Middleware para manejar errores
app.use(errorHandler);

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
