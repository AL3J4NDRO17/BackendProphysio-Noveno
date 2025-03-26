/*
Propósito: Contiene middlewares para 
autenticar usuarios y verificar si 
son administradores.

middleware: son funciones que que funcionan
como guardianes para resguardar rutas

*/


const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const { JWT_SECRET } = process.env;

// Middleware para autenticar usuarios
exports.authenticateUser = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "No autorizado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Almacena el usuario en `req.user` para usarlo en controladores
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
};

// Middleware para verificar si el usuario es administrador
exports.adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado, solo administradores' });
  }
  next();
};
