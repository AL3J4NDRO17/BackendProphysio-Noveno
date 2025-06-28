const { CLIENT_URL } = require("../config/index");
console.log("CLIENT_URL", CLIENT_URL);
const corsOptions = {
    origin: [CLIENT_URL,"http://10.0.2.2:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"], //Permitir el header CSRF en la solicitud
    exposedHeaders: ["X-CSRF-Token"], //Asegurar que Axios pueda leerlo
};

module.exports = corsOptions;
