const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { body } = require('express-validator');
const crypto = require("crypto");
const { Token } = require('../config/index');
const { Op } = require('sequelize');

dotenv.config();
const { JWT_SECRET } = process.env;

exports.generateToken = (user) => {
  
  return jwt.sign(
    { id: user.id_usuario, email: user.email, role: user.rol , id_Perfil:user.id_perfil},
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};
exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id_usuario, email: user.email, role: user.rol,id_Perfil:user.id_perfil },
    process.env.REFRESH_TOKEN_SECRET,  // Cambiar a un secreto diferente
    { expiresIn: '7d' }  // Usar un tiempo de expiración más largo
  );
};

exports.verifyOTP = async (code) => {
  try {
    const tokenRecord = await Token.findOne({
      where: {
        token: code,
        tipo: 'otp',
        fecha_expiracion: { [Op.gt]: new Date() },
      },
    });

    if (!tokenRecord) {

      return null; //  Devolver `null` en lugar de lanzar un error
    }


    return tokenRecord;
  } catch (error) {
    console.error("❌ Error en verifyOTP:", error);
    return null; //  Evitar que el error rompa el servidor
  }
};

exports.comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 🔥 Código de 6 dígitos
};
exports.validateRegisterForm = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido.').escape(),
  body('email').isEmail().withMessage('El email no es válido.'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/[A-Z]/).withMessage('La contraseña debe incluir al menos una letra mayúscula.')
    .matches(/\d/).withMessage('La contraseña debe incluir al menos un número.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La contraseña debe incluir al menos un carácter especial.')
    .escape(),
 
];
