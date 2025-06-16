const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { id_cita: cita.id_cita },         // payload
  process.env.JWT_SECRET || "secreto", // clave secreta
  { expiresIn: "1d" }                // expira en 1 día
);