const { CLIENT_URL } = require("../config/index");

const corsOptions = {
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"], //Permitir el header CSRF en la solicitud
    exposedHeaders: ["X-CSRF-Token"], //Asegurar que Axios pueda leerlo
};

module.exports = corsOptions;
