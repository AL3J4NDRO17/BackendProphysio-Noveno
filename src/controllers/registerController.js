
//Biblioteca para hashear contraseñas
const bcrypt = require("bcrypt");

//Biblioteca para generar y verificar tokens
const jwt = require("jsonwebtoken");

//Configuración de nodemailer
const { transporter } = require("../utils/nodemailer/nodemailerConfig");

//Funcion de validacion de formularios
const { validateRegisterForm } = require('../services/authService');

// Importar validationResult desde express-validator
const { validationResult } = require('express-validator');

//Modelos de la base de datos para Usuario, Perfil de Usuario y Token de registro
const { User,Token,PreguntaSecreta } = require("../config/index")

//Funcion para enviar correos de activacion
const { sendActivationEmail } = require("../utils/nodemailer/nodemailerConfig");

//Biblioteca para cargar las variables de entorno desde un archivo .env
const dotenv = require("dotenv");
dotenv.config();

//Variables de entorno para el codigo secreto y la url del FrontEnd
const { JWT_SECRET, APP_URL } = process.env;

 exports.register = [
    validateRegisterForm,
    async (req, res) => {
      console.log(req.body)
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }
      console.log("entro",req.body)

      const { nombre, email, password, preguntaSecreta, respuestaSecreta } = req.body;

      try {
        // Verificar si el email ya está registrado
        const usuarioExistente = await User.findOne({ where: { email } });
        if (usuarioExistente) {
          return res.status(401).json({ message: "El email ya está registrado." });
        }
        const preguntaExiste = await PreguntaSecreta.findByPk(preguntaSecreta);
        if (!preguntaExiste) {
          return res.status(400).json({ error: "Pregunta secreta inválida." });
        }

        // Hashear la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const hashedAnswer = await bcrypt.hash(respuestaSecreta, saltRounds);
         // Crear usuario
        const nuevoUsuario = await User.create({
          nombre,
          email,
          password: hashedPassword,
          id_pregunta: preguntaSecreta,
          respuesta_secreta: hashedAnswer,
          activo: false,
        });

        // Generar token de activación
        const token = jwt.sign(
          { id: nuevoUsuario.id_usuario, email: nuevoUsuario.email },
          JWT_SECRET,
          { expiresIn: "1h" }
        );

        // Guardar token en la base de datos
        await Token.create({
          id_usuario: nuevoUsuario.id_usuario,
          tipo: "activacion",
          token: token,
          fecha_creacion: new Date(),
          fecha_expiracion: new Date(Date.now() + 3600000), // 1 hora
        });
        // Enviar correo de activación
        const activationLink = `${APP_URL}/activate?token=${token}`;
        await sendActivationEmail(email, nombre, activationLink);

        res.status(201).json({
          message: "Usuario registrado con éxito. Por favor, verifica tu correo electrónico para activar tu cuenta.",
        });
      } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ message: "Error en el servidor. Intenta de nuevo más tarde." });
      }
    }
 ];

exports.getAllPreguntasSecretas = async (req, res) => {
  try {
    const preguntasSecretas = await PreguntaSecreta.findAll({
      attributes: ["id_pregunta", "pregunta"],
    });

    if (preguntasSecretas.length === 0) {
      return res.status(404).json({ message: "No se encontraron preguntas secretas." });
    }

    res.status(200).json(preguntasSecretas);
  } catch (error) {
    console.error("Error al obtener preguntas secretas:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
}

exports.activateAccount = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log("Token decodificado:", decoded);

    const usuario = await User.findByPk(decoded.id);
    if (!usuario) {
      return res.status(401).json({ message: "Usuario no encontrado." });
    }

    if (usuario.activo) {
      return res.status(401).json({ message: "La cuenta ya está activada." });
    }

    // Activamos la cuenta
    usuario.activo = true;
    await usuario.save();

    // Eliminamos el token solo si existe
    const tokenEliminado = await Token.destroy({ where: { token } });

    if (!tokenEliminado) {
      console.warn("No se encontró el token en la base de datos.");
    }

    return res.status(200).json({ message: "Cuenta activada exitosamente." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "El token ha expirado. Solicita un nuevo correo de activación." });
    }
    console.error("Error al activar cuenta:", error);
    return res.status(500).json({ message: "Token inválido o expirado." });
  }
};

exports.resendActivationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await User.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (usuario.activo) {
      return res.status(400).json({ message: "La cuenta ya está activada." });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await Token.create({
      id_usuario: usuario.id_usuario,
      tipo: "activacion",
      token: token,
      fecha_creacion: new Date(),
      fecha_expiracion: new Date(Date.now() + 3600000), // 1 hora
    });

    // Enviar email de activación
    const activationLink = `${APP_URL}/activate?token=${token}`;
    await transporter.sendMail({
      from: `"ProPhysio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reenvío de activación de cuenta",
      html: `
        <h1>Activa tu cuenta en ProPhysio</h1>
        <p>Haz clic en el enlace para activar tu cuenta:</p>
        <a href="${activationLink}" target="_blank">Activar cuenta</a>
        <p>Este enlace expirará en 1 hora.</p>
      `,
    });

    res.status(200).json({ message: "Correo de activación reenviado con éxito." });
  } catch (error) {
    console.error("Error al reenviar el correo de activación:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};
