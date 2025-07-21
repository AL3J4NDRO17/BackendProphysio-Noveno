const { Cita, User, PerfilUsuario, RadiografiaUsuario } = require("../config/index")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const cloudinary = require("cloudinary").v2
const dotenv = require("dotenv")
const { transporter } = require("../utils/nodemailer/nodemailerConfig")
dotenv.config()

// Crear una cita (usuario)
exports.createCita = async (req, res) => {
  try {
    console.log("req.files-------------------------------------")
    console.log(req.files)
    const { id_usuario, fecha_hora, notes, duracion, numero_sesion, foto_documento_descripcion } = req.body // Añadir foto_documento_descripcion
    const usuario = await User.findByPk(id_usuario, {
      include: [{ model: PerfilUsuario, as: "perfil" }], // Incluir el perfil para obtener id_perfil
    })

    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" })
    if (!usuario.perfil) return res.status(404).json({ message: "Perfil de usuario no encontrado" })

    // Verificar si ya tiene una cita agendada o pendiente
    const citaExistente = await Cita.findOne({
      where: {
        id_usuario,
        estado: ["confirmada", "pendiente"],
      },
    })
    if (citaExistente) {
      return res.status(400).json({
        message: "Ya tienes una cita activa. No puedes agendar otra.",
      })
    }



    // Crear la cita en la base de datos (sin foto_documento en Cita)
    const cita = await Cita.create({
      id_usuario,
      fecha_hora,
      notes,
      estado: "pendiente",
      token_confirmacion: "", // temporal
      duracion, // Guardar la duración de la sesión
      numero_sesion, // Guardar el número de sesión
    })
    let fotoDocumentoUrl = null
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fotoDocumentoUrl = file.path // Multer ya te da la URL de Cloudinary
        // Crear una entrada en el modelo RadiografiaUsuario para cada archivo
        await RadiografiaUsuario.create({
          id_perfil: usuario.perfil.id_perfil, // Usar el id_perfil del usuario
          id_cita: cita.id_cita, // Asociar la radiografía a la cita recién creada
          url: fotoDocumentoUrl,
          descripcion: foto_documento_descripcion || null, // Usar la descripción del body
        })
        console.log("Radiografía guardada en RadiografiaUsuario:", fotoDocumentoUrl)
      }
    }
    const tokenJWT = jwt.sign({ id_cita: cita.id_cita }, process.env.JWT_SECRET || "secreto", { expiresIn: "1d" })
    cita.token_confirmacion = tokenJWT
    await cita.save()

    await enviarCorreoConfirmacion(usuario.email, cita.id_cita, tokenJWT)
    console.log("Cita creada:", cita)
    return res.status(201).json({ message: "Cita pendiente, confirma en el correo." })
  } catch (error) {
    console.error("Error al crear cita:", error)
    res.status(500).json({ message: "Error al crear cita" })
  }
}

// Confirmar cita vía link
exports.confirmarCita = async (req, res) => {
  try {
    const { token } = req.body
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto")
    const { id_cita } = decoded
    const cita = await Cita.findByPk(id_cita)

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" })

    cita.estado = "confirmada"
    await cita.save()

    res.status(200).json({ message: "Cita confirmada correctamente" })
  } catch (error) {
    console.error("Error al confirmar cita:", error)
    return res.status(400).json({ message: "Token inválido o expirado" })
  }
}

// Función auxiliar: subir archivo a Cloudinary
function subirArchivoCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
      if (error) reject(error)
      else resolve(result.secure_url)
    })
    uploadStream.end(fileBuffer)
  })
}

// Función auxiliar: enviar correo de confirmación
async function enviarCorreoConfirmacion(email, id_cita, token) {
  const confirmURL = `${process.env.CLIENT_URL}/user/confirmAppointment?id=${token}`
  const html = `
    <h2>Gracias por agendar tu cita</h2>
    <p>Haz clic en el siguiente botón para confirmar:</p>
    <a href="${confirmURL}" style="padding:10px 15px; background:#28a745; color:#fff; text-decoration:none;">Confirmar Cita</a>
    <p>Si no fuiste tú, ignora este mensaje.</p>
  `
  await transporter.sendMail({
    from: '"Clínica ProPhysio" <TU_CORREO@gmail.com>',
    to: email,
    subject: "Confirma tu cita",
    html,
  })
}

// Obtener todas las citas (admin)
exports.getAllCitas = async (req, res) => {
  console.log("Obteniendo todas las citas...")
  try {
    const citas = await Cita.findAll({
      attributes: [
        "id_cita",
        "id_usuario",
        "fecha_hora",
        "notes",
        "estado",
        "duracion", // Mantenido
        "numero_sesion",
        "motivo_cancelacion",
        "motivo_postergacion",
      ],
      include: [
        {
          model: User,
          as: "usuario",
          attributes: ["id_usuario", "nombre", "email"],
          include: [
            {
              model: PerfilUsuario,
              as: "perfil",
              include: [
                {
                  model: RadiografiaUsuario,
                  as: "radiografias", // Asegúrate de que 'radiografias' sea el alias correcto de tu asociación
                  attributes: ["id_radiografia", "url", "descripcion", "createdAt"], // Incluir atributos relevantes
                },
              ],
            },
          ],
        },
      ],
    })
    console.log("Citas", citas)
    res.status(200).json(citas)
  } catch (error) {
    console.error("Error al obtener citas:", error)
    res.status(500).json({ message: "Error al obtener citas" })
  }
}

// Actualizar cita (generalizado para admin)
exports.updateCita = async (req, res) => {
  try {
    console.log(req.params)
    const { id } = req.params
    const {
      estado,
      fecha_hora,
      notes,
      duracion, // Mantenido
      numero_sesion,
      // 'nombre_paciente' ELIMINADO de la desestructuración
      motivo_cancelacion,
      motivo_postergacion,
    } = req.body

    const cita = await Cita.findByPk(id)

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" })

    // Actualizar campos si están presentes en el body
    if (estado !== undefined) cita.estado = estado
    if (fecha_hora !== undefined) cita.fecha_hora = fecha_hora
    if (notes !== undefined) cita.notes = notes
    if (duracion !== undefined) cita.duracion = duracion // Mantenido
    if (numero_sesion !== undefined) cita.numero_sesion = numero_sesion
    // 'nombre_paciente' ELIMINADO de la lógica de actualización
    if (motivo_cancelacion !== undefined) cita.motivo_cancelacion = motivo_cancelacion
    if (motivo_postergacion !== undefined) cita.motivo_postergacion = motivo_postergacion

    await cita.save()

    res.status(200).json(cita)
  } catch (error) {
    console.error("Error al actualizar cita:", error)
    res.status(500).json({ message: "Error al actualizar cita" })
  }
}

// Eliminar cita (admin)
exports.deleteCita = async (req, res) => {
  try {
    const { id } = req.params
    const cita = await Cita.findByPk(id)

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" })

    await cita.destroy()

    res.status(200).json({ message: "Cita eliminada con éxito" })
  } catch (error) {
    console.error("Error al eliminar cita:", error)
    res.status(500).json({ message: "Error al eliminar cita" })
  }
}

// Obtener una cita por ID (admin o usuario)
exports.getCitaById = async (req, res) => {
  try {
    const { id_cita } = req.params
    const cita = await Cita.findByPk(id_cita, {
      include: [
        {
          model: User,
          as: "usuario",
          attributes: ["id_usuario", "nombre", "email"],
          include: [
            {
              model: PerfilUsuario,
              as: "perfil",
              include: [
                {
                  model: RadiografiaUsuario,
                  as: "radiografias", // Asegúrate de que 'radiografias' sea el alias correcto de tu asociación
                  attributes: ["id_radiografia", "url", "descripcion", "createdAt"],
                },
              ],
            },
          ],
        },
      ],
    })
    if (!cita) return res.status(404).json({ message: "Cita no encontrada" })
    res.status(200).json(cita)
  } catch (error) {
    console.error("Error al obtener la cita:", error)
    res.status(500).json({ message: "Error al obtener la cita" })
  }
}


// adminCrearCita
exports.adminCrearCita = async (req, res) => {
  try {
    // 'nombre_paciente' ELIMINADO de la desestructuración
    const { id_usuario, id_servicio, fecha_hora, notes, duracion, numero_sesion } = req.body

    const usuario = await User.findByPk(id_usuario)
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" })

    // Buscar la última cita del usuario
    const ultimaCita = await Cita.findOne({
      where: { id_usuario },
      order: [["fecha_hora", "DESC"]],
    })

    if (
      ultimaCita &&
      ultimaCita.estado !== "completada" &&
      ultimaCita.estado !== "cancelada" &&
      ultimaCita.estado !== "inasistencia"
    ) {
      return res.status(400).json({
        message: "No puedes agendar una nueva sesión hasta finalizar la anterior.",
      })
    }

    const sesion_num_calculated = ultimaCita ? (ultimaCita.numero_sesion || 0) + 1 : 1
    const final_numero_sesion = numero_sesion || sesion_num_calculated

    const nuevaCita = await Cita.create({
      id_usuario,
      fecha_hora,
      notes,
      estado: "pendiente",
      numero_sesion: final_numero_sesion,
      duracion, // Mantenido
      // 'nombre_paciente' ELIMINADO de aquí
    })

    res.status(201).json({
      message: "Cita creada correctamente",
      cita: nuevaCita,
    })
  } catch (error) {
    console.error("Error al crear cita desde admin:", error)
    res.status(500).json({ message: "Error al crear cita desde admin" })
  }
}

// Obtener info completa del usuario, su perfil y sus citas
exports.getPerfilPorCita = async (req, res) => {
  try {
    const { id } = req.params // Asumo que 'id' es id_cita
    const cita = await Cita.findByPk(id, {
      attributes: [
        "id_cita",
        "fecha_hora",
        "estado",
        "notes",
        "duracion", // Mantenido
        "numero_sesion",
        // 'nombre_paciente' ELIMINADO de aquí
        "foto_documento",
        "motivo_cancelacion",
        "motivo_postergacion",
      ],
      include: {
        model: User,
        as: "usuario",
        attributes: ["id_usuario", "nombre", "email"],
        include: {
          model: PerfilUsuario,
          as: "perfil",
        },
      },
    })

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" })

    const perfil = cita.usuario?.perfil
    if (!perfil) return res.status(404).json({ message: "Perfil no encontrado para el usuario" })

    res.status(200).json({
      cita: cita, // Devolver el objeto cita completo
      usuario: {
        id_usuario: cita.usuario.id_usuario,
        nombre: cita.usuario.nombre,
        email: cita.usuario.email,
      },
      perfil,
    })
  } catch (error) {
    console.error("Error al obtener perfil desde cita:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}
exports.marcarAsistida = async (req, res) => {
  try {
    const { id } = req.params
    const cita = await Cita.findByPk(id)

    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada." })
    }

    cita.estado = "completada"
    await cita.save()

    res.status(200).json(cita)
  } catch (error) {
    console.error("Error al marcar cita como asistida:", error)
    res.status(500).json({ message: "Error interno del servidor al marcar cita como asistida." })
  }
}

// Asegurarse de que la definición de `marcarInasistencia` al final del archivo sea la siguiente:

// Nueva función para marcar cita como inasistencia
exports.marcarInasistencia = async (req, res) => {
  try {
    const { id } = req.params
    const cita = await Cita.findByPk(id)

    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada." })
    }

    cita.estado = "inasistencia"
    await cita.save()

    res.status(200).json(cita)
  } catch (error) {
    console.error("Error al marcar cita como inasistencia:", error)
    res.status(500).json({ message: "Error interno del servidor al marcar cita como inasistencia." })
  }
}
exports.cancelarCita = async (req, res) => {
  try {
    console.log(req.body)
    console.log(req.params)
    const { id } = req.params
    const { motivo_cancelacion } = req.body

    const cita = await Cita.findByPk(id)

    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada." })
    }

    cita.estado = "cancelada"
    cita.motivo_cancelacion = motivo_cancelacion || null // Guardar el motivo
    await cita.save()

    res.status(200).json(cita)
  } catch (error) {
    console.error("Error al cancelar cita:", error)
    res.status(500).json({ message: "Error interno del servidor al cancelar cita." })
  }
}

// Nueva función para postergar cita
exports.postergarCita = async (req, res) => {
  try {
    const { id } = req.params
    const { fecha_hora, motivo_postergacion } = req.body // Espera la nueva fecha y el motivo

    const cita = await Cita.findByPk(id)

    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada." })
    }

    cita.estado = "postergada"
    cita.fecha_hora = fecha_hora // Actualiza la fecha de la cita
    cita.motivo_postergacion = motivo_postergacion || null // Guardar el motivo
    await cita.save()

    res.status(200).json(cita)
  } catch (error) {
    console.error("Error al postergar cita:", error)
    res.status(500).json({ message: "Error interno del servidor al postergar cita." })
  }
}