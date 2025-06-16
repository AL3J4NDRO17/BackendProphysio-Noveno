const { Cita, User,PerfilUsuario } = require("../config/index");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const dotenv = require('dotenv');
const { transporter } = require("../utils/nodemailer/nodemailerConfig");

dotenv.config();


// Crear una cita (usuario)
exports.createCita = async (req, res) => {
  try {
    const { id_usuario, fecha_hora, notes } = req.body;

    const usuario = await User.findByPk(id_usuario);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    // 🚫 Verificar si ya tiene una cita agendada o pendiente
    const citaExistente = await Cita.findOne({
      where: {
        id_usuario,
        estado: ["confirmada", "pendiente"], // puedes quitar "pendiente" si solo te importa "agendada"
      },
    });

    if (citaExistente) {
      return res.status(400).json({
        message: "Ya tienes una cita activa. No puedes agendar otra.",
      });
    }

    const token_confirmacion = jwt.sign(
      { id_cita: null }, // Lo actualizaremos después de crear la cita
      process.env.JWT_SECRET || "secreto",
      { expiresIn: "1d" }
    );

    if (req.file) {
      const urlArchivo = await subirArchivoCloudinary(req.file.buffer);
      return crearCitaEnBD(urlArchivo);
    } else {
      return crearCitaEnBD(null);
    }

    async function crearCitaEnBD(foto_documento) {
      const cita = await Cita.create({
        id_usuario,
        fecha_hora,
        notes,
        foto_documento,
        estado: "pendiente",
        token_confirmacion: "", // temporal
      });

      const tokenJWT = jwt.sign(
        { id_cita: cita.id_cita },
        process.env.JWT_SECRET || "secreto",
        { expiresIn: "1d" }
      );

      cita.token_confirmacion = tokenJWT;
      await cita.save();
      await enviarCorreoConfirmacion(usuario.email, cita.id_cita, tokenJWT);

      console.log("Cita creada:", cita);
      return res.status(201).json({ message: "Cita pendiente, confirma en el correo." });
    }

  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({ message: "Error al crear cita" });
  }
};


// Confirmar cita vía link
exports.confirmarCita = async (req, res) => {
  try {

    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto");
    const { id_cita } = decoded;

    const cita = await Cita.findByPk(id_cita);
    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    cita.estado = "confirmada";
    await cita.save();

    res.status(200).json({ message: "Cita confirmada correctamente" });
  } catch (error) {
    console.error("Error al confirmar cita:", error);
    return res.status(400).json({ message: "Token inválido o expirado" });
  }
};


// Función auxiliar: subir archivo a Cloudinary
function subirArchivoCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
}

// Función auxiliar: enviar correo de confirmación
async function enviarCorreoConfirmacion(email, id_cita, token) {
  const confirmURL = `${process.env.CLIENT_URL}/user/confirmAppointment?id=${token}`;
  const html = `
    <h2>Gracias por agendar tu cita</h2>
    <p>Haz clic en el siguiente botón para confirmar:</p>
    <a href="${confirmURL}" style="padding:10px 15px; background:#28a745; color:#fff; text-decoration:none;">Confirmar Cita</a>
    <p>Si no fuiste tú, ignora este mensaje.</p>
  `;

  await transporter.sendMail({
    from: '"Clínica ProPhysio" <TU_CORREO@gmail.com>',
    to: email,
    subject: "Confirma tu cita",
    html
  });
}

// Obtener todas las citas (admin)
exports.getAllCitas = async (req, res) => {
  console.log("Obteniendo todas las citas...");
  try {
    const citas = await Cita.findAll({
      include: [
        { model: User, as: "usuario", attributes: ["id_usuario", "nombre", "email"] },
      ],
    });
    res.status(200).json(citas);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({ message: "Error al obtener citas" });
  }
};

// Cancelar o postergar cita (admin)
exports.updateCitaEstado = async (req, res) => {
  try {
    console.log(req.params);
    const { id } = req.params;
    const { estado, motivo, nueva_fecha_hora } = req.body;

    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    // Actualizar estado
    if (estado) cita.estado = estado;

    // Actualizar fecha y hora si se pospone
    if (nueva_fecha_hora) cita.fecha_hora = nueva_fecha_hora;

    // Agregar motivo a notes (opcional)
    if (motivo) {
      cita.notes = cita.notes ? `${cita.notes} | ${motivo}` : motivo;
    }

    await cita.save();

    res.status(200).json(cita);
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(500).json({ message: "Error al actualizar cita" });
  }
};

// Eliminar cita (admin)
exports.deleteCita = async (req, res) => {
  try {
    const { id_cita } = req.params;
    const cita = await Cita.findByPk(id_cita);

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    await cita.destroy();

    res.status(200).json({ message: "Cita eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    res.status(500).json({ message: "Error al eliminar cita" });
  }
};
// Obtener una cita por ID (admin o usuario)
exports.getCitaById = async (req, res) => {
  try {
    const { id_cita } = req.params;

    const cita = await Cita.findByPk(id_cita, {
      include: [
        { model: User, as: "usuario", attributes: ["id_usuario", "name", "email"] },
        { model: Service, as: "servicio", attributes: ["id_servicio", "name", "description"] },
      ],
    });

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    res.status(200).json(cita);
  } catch (error) {
    console.error("Error al obtener la cita:", error);
    res.status(500).json({ message: "Error al obtener la cita" });
  }
};

exports.adminCrearCita = async (req, res) => {
  try {
    const { id_usuario, id_servicio, fecha_hora, notes } = req.body;

    const usuario = await User.findByPk(id_usuario);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    const servicio = await Service.findByPk(id_servicio);
    if (!servicio) return res.status(404).json({ message: "Servicio no encontrado" });

    // Buscar la última cita del usuario para ese servicio
    const ultimaCita = await Cita.findOne({
      where: { id_usuario, id_servicio },
      order: [["fecha_hora", "DESC"]],
    });

    // Si hay una cita previa y no está finalizada, no se puede crear la siguiente
    if (ultimaCita && ultimaCita.estado !== "finalizada") {
      return res.status(400).json({
        message: "No puedes agendar una nueva sesión hasta finalizar la anterior.",
      });
    }

    // Calcular número de sesión
    const sesion_num = ultimaCita ? (ultimaCita.sesion_num || 1) + 1 : 1;

    // Crear la nueva cita en estado "agendada"
    const nuevaCita = await Cita.create({
      id_usuario,
      id_servicio,
      fecha_hora,
      notes,
      estado: "agendada",
      sesion_num,
    });

    res.status(201).json({
      message: "Cita creada correctamente",
      cita: nuevaCita,
    });
  } catch (error) {
    console.error("Error al crear cita desde admin:", error);
    res.status(500).json({ message: "Error al crear cita desde admin" });
  }
};

// Obtener info completa del usuario, su perfil y sus citas
exports.getPerfilPorCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await Cita.findByPk(id, {
      include: {
        model: User,
        as: "usuario",
        include: {
          model: PerfilUsuario,
          as: "perfil"
        }
      }
    });

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    const perfil = cita.usuario?.perfil;

    if (!perfil) return res.status(404).json({ message: "Perfil no encontrado para el usuario" });

    res.status(200).json({
      cita: {
        id_cita: cita.id_cita,
        fecha_hora: cita.fecha_hora,
        estado: cita.estado
      },
      usuario: {
        id_usuario: cita.usuario.id_usuario,
        nombre: cita.usuario.nombre,
        email: cita.usuario.email
      },
      perfil
    });

  } catch (error) {
    console.error("Error al obtener perfil desde cita:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
