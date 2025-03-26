const { User, Token,PreguntaSecreta } = require("../config/index")
//Importacion de la funcion para enviar correos de activacion
const { sendRecoveryEmail } = require('../utils/nodemailer/nodemailerConfig.js'); // 1
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

exports.solicitarCodigoRecuperacion = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(req.body)
        // Buscar usuario
        const usuario = await User.findOne({ where: { email } });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Generar OTP seguro de 6 dígitos
        const otp = crypto.randomInt(100000, 999999).toString();
        const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 min

        // Guardar OTP en la tabla de tokens
        await Token.create({
            token: otp,
            tipo: "recuperacion",
            fecha_creacion: new Date(),
            fecha_expiracion: fechaExpiracion,
            id_usuario: usuario.id_usuario,
        });

        // Enviar OTP al correo
        await sendRecoveryEmail(usuario.email, `${otp}`);

        res.json({ message: "Código OTP enviado al correo." });
    } catch (error) {
        console.error("❌ Error al generar OTP:", error);
        res.status(500).json({ error: "Error al generar OTP." });
    }
};
exports.solicitarPreguntaSecreta = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email)

        // Buscar usuario y su pregunta secreta
        const usuario = await User.findOne({
            where: { email },
            attributes: ["id_pregunta"],
            include: {
                model: PreguntaSecreta,
                as: "preguntaSecreta",
                attributes: ["pregunta"],
            },
        });

        if (!usuario || !usuario.preguntaSecreta) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        res.json({ preguntaSecreta: usuario.preguntaSecreta.pregunta });
    } catch (error) {
        console.error("❌ Error al obtener la pregunta secreta:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};


exports.verificarPreguntaSecreta = async (req, res) => {
    try {
        const { email, respuesta } = req.body;
        console.log(respuesta)
        // Buscar usuario
        const usuario = await User.findOne({ where: { email } });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
   
        // Verificar la respuesta secreta
        const esCorrecta = bcrypt.compareSync(respuesta, usuario.respuesta_secreta);
        if (!esCorrecta) {
            return res.status(400).json({ error: "Respuesta incorrecta." });
        }

        // Generar código OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 min

        // Guardar OTP en la base de datos
        await Token.create({
            token: otp,
            tipo: "recuperacion",
            fecha_creacion: new Date(),
            fecha_expiracion: fechaExpiracion,
            id_usuario: usuario.id_usuario,
        });

        // Enviar OTP al correo
        await sendRecoveryEmail(usuario.email, `${otp}`);

        res.json({ message: "Código enviado al correo tras responder la pregunta secreta." });
    } catch (error) {
        console.error("❌ Error en recuperación con pregunta secreta:", error);
        res.status(500).json({ error: "Error en la recuperación." });
    }
};

exports.restablecerPasswordConCodigo = async (req, res) => {
    try {
        const { email, nuevaPassword } = req.body;

        // Buscar usuario
        const usuario = await User.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
      
        // 🔥 Encriptar la nueva contraseña
        const salt = 10;
        

         // Verificar que la nueva contraseña no sea igual a la actual
        if (bcrypt.compareSync(nuevaPassword, usuario.password)) {
            return res.status(401).json({ error: "La nueva contraseña no puede ser igual a la actual." });
        }

        usuario.password = bcrypt.hashSync(nuevaPassword, salt);
      
        // Guardar la nueva contraseña
        await usuario.save();

        res.json({ message: "Contraseña actualizada correctamente." });
    } catch (error) {
        console.error("❌ Error al restablecer la contraseña:", error);
        res.status(500).json({ error: "Error al restablecer la contraseña." });
    }
};

exports.verificarCodigoOTPRessetPass = async (req, res) => {
    try {
        const { email,code} = req.body;

        // Buscar usuario
        const usuario = await User.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Buscar OTP válido
        const token = await Token.findOne({
            where: { id_usuario: usuario.id_usuario, token: code, tipo: "recuperacion" },
        });

        // Validar OTP
        if (!token || new Date() > token.fecha_expiracion) {
            return res.status(400).json({ error: "Código OTP inválido o expirado." });
        }

        // 🔥 Eliminar OTP después de la verificación
        await token.destroy();

        res.json({ message: "Código OTP válido. Ahora puedes cambiar tu contraseña." });
    } catch (error) {
        console.error("❌ Error al verificar OTP:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};