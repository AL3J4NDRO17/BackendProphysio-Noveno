//Importacion de los modelos de la base de datos de usuario y token
const { User, Token } = require("../config/index")
const { DateTime } = require("luxon");

//Importacion de las funciones de autenticacion y servicios para el login

/*Funciones y utilidades para la autenticacion
  generateRefreshToken: Funcion para generar un token de refresco
  generateToken: Funcion para generar un token de autenticacion
  verifyOTP: Funcion para verificar el codigo OTP
  comparePassword: Funcion para comparar contraseñas
  generateOTP: Funcion para generar un codigo OTP
*/

const { generateRefreshToken, generateToken, verifyOTP, comparePassword, generateOTP } = require('../services/authService.js');

//Importacion de la funcion para enviar correos de activacion
const { sendOtpEmail } = require('../utils/nodemailer/nodemailerConfig.js'); // 1

const MAX_INTENTOS = 3
const BLOQUEO_MINUTOS = 1;

// Zona horaria de Ciudad de México
const ZONA_HORARIA = "America/Mexico_City";

// Obtener la fecha de desbloqueo en la zona horaria de CDMX
const fecha_bloqueo = DateTime.now().setZone(ZONA_HORARIA).toJSDate();
const fecha_desbloqueo = DateTime.now().setZone(ZONA_HORARIA).plus({ minutes: BLOQUEO_MINUTOS }).toJSDate();


// Convertir a la zona horaria del usuario
const fechaLocalBlock = fecha_bloqueo.toLocaleString();

const fechaLocalDesbloqueo = fecha_desbloqueo.toLocaleString();

const { logger, logRequest } = require("../services/loggerService"); // Importar el logger

//Funcion para iniciar sesion
exports.login = async (req, res) => {
  const { email, password } = req.body


  try {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      logRequest("warn", req, `Intento de inicio con email inexistente: ${email}`);
      return res.status(401).json({ message: "Usuario o contraseña incorrectos." });
    }
    const ahora = DateTime.now().setZone(ZONA_HORARIA);
    const fechaDesbloqueoUsuario = user.fecha_desbloqueo
      ? DateTime.fromJSDate(new Date(user.fecha_desbloqueo)).setZone(ZONA_HORARIA)
      : null;

    console.log(ahora)
    console.log(fechaDesbloqueoUsuario)
    if (!user) {
      logRequest("warn", req, `Intento de inicio con email inexistente: ${email}`);
      return res.status(401).json({ message: "Usuario o contraseña incorrectos." });
    }
    if (user.bloqueado) {

      if (fechaDesbloqueoUsuario && ahora >= fechaDesbloqueoUsuario) {
        // Desbloquear usuario automáticamente
        user.bloqueado = false;
        user.intentos_fallidos = 0;
        user.fecha_bloqueo = null;
        user.fecha_desbloqueo = null;
        await user.save();
        logRequest("info", `${user.email} ha sido desbloqueado automáticamente.`)

      } else {
        logRequest("warn", req, `Usuario ${user.email} intentó iniciar sesión, pero está bloqueado hasta ${fecha_desbloqueo}.`);
        return res.status(403).json({ message: `Usuario bloqueado hasta ${fecha_desbloqueo}.` });
      }
    }
    if (!(await comparePassword(password, user.password))) {
      user.intentos_fallidos += 1;

      if (user.intentos_fallidos >= MAX_INTENTOS) {
        user.bloqueado = true;
        user.fecha_bloqueo = ahora.toJSDate();
        user.fecha_desbloqueo = ahora.plus({ minutes: BLOQUEO_MINUTOS }).toJSDate();
        await user.save();
        logRequest("warn", req, `Usuario ${user.email} bloqueado por demasiados intentos fallidos.`);
        return res.status(403).json({
          message: `Demasiados intentos fallidos. Usuario bloqueado hasta ${fecha_desbloqueo}.`,
        });
      }

      await user.save();
      logRequest("warn", req, `Intento fallido (${user.intentos_fallidos}) para el usuario ${user.email}.`);
      return res.status(406).json({ message: "Usuario o contraseña incorrectos." });
    }

    user.intentos_fallidos = 0;
    await user.save();

    // Generar código OTP
    const otpCode = generateOTP()


    // Guardar el código OTP en la base de datos con expiración (5 minutos)
    await Token.create({
      id_usuario: user.id_usuario,
      tipo: "otp",
      token: otpCode,
      fecha_creacion: new Date(),
      fecha_expiracion: new Date(Date.now() + 5 * 60 * 1000),
    })

    // Enviar OTP al email del usuario
    await sendOtpEmail(user.email, otpCode)

    res.status(200).json({
      status: "success",
      message: "Código de verificación enviado a tu correo. Expira en 5 minutos.",
      otpSent: true,
    })
  } catch (error) {
    logRequest("error", req, `Error en el inicio de sesión: ${error.message}`);
    res.status(500).json({
      message: "Hubo un problema con el servidor. Intenta de nuevo más tarde.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

//Funcion para verificar el codigo de inicio de sesion
exports.verifyLoginCode = async (req, res) => {
  console.log("📥 Código recibido en la solicitud:", req.body);

  const { code } = req.body;
  if (!code) {

    return res.status(400).json({ message: "El código es obligatorio." });
  }

  try {
    const tokenRecord = await verifyOTP(code);

    if (!tokenRecord) {
      console.log("❌ Error: Código OTP inválido o expirado.");
      return res.status(401).json({ message: "El código es inválido o ha expirado." });
    }


    const user = await User.findByPk(tokenRecord.id_usuario);
    if (!user) {

      return res.status(401).json({ message: "Usuario no encontrado." });
    }


    await tokenRecord.destroy();


    const authToken = generateToken(user);

    const refreshToken = generateRefreshToken(user);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      ...(user.rol === "admin"
        ? { maxAge: 30 * 60 * 1000 } // 30 minutos para admin
        : { expires: new Date("9999-12-31T23:59:59.999Z") }), // Indefinido para usuarios
    };
    res.cookie("authToken", authToken, cookieOptions);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,  // Asegura que solo se use en HTTPS en producción
      sameSite: "None",

    });
    const userRole = user.rol === "admin" ? "Administrador" : "Usuario";
    logRequest("info", req, `${userRole} ${user.email} inició sesión exitosamente.`);
    
    res.status(200).json({
      status: "success",
      message: "Inicio de sesión exitoso.",
      // user: { id: user.id_usuario, email: user.email, nombre: user.nombre, rol: user.rol, id_Perfil: user.id_perfil },
    });

  } catch (error) {
    console.error("❌ Error inesperado en el servidor:", error);
    res.status(500).json({ message: "Error en el servidor. Intenta de nuevo más tarde." });
  }
};

// Función para reenviar el código OTP
exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Generar nuevo código OTP
    const otpCode = generateOTP();

    // Guardar el nuevo código OTP en la base de datos con expiración (5 minutos)
    await Token.create({
      id_usuario: user.id_usuario,
      tipo: "otp",
      token: otpCode,
      fecha_creacion: new Date(),
      fecha_expiracion: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Enviar el nuevo OTP al email del usuario
    await sendOtpEmail(user.email, otpCode);

    res.status(200).json({
      status: "success",
      message: "Nuevo código de verificación enviado a tu correo. Expira en 5 minutos.",
      otpSent: true,
    });
  } catch (error) {
    console.error("Error al reenviar el código OTP:", error);
    res.status(500).json({
      message: "Hubo un problema con el servidor. Intenta de nuevo más tarde.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};