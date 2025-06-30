const { HorarioClinica } = require("../config/index") // Ajusta la ruta si usas otra estructura

exports.getClinicHours = async (req, res) => {
  try {
    const horarios = await HorarioClinica.findAll({
      attributes: ["id", "dia", "hora_inicio", "hora_fin", "duracion_sesion"], // Añadido 'id' y 'duracion_sesion'
      order: [
        ["dia", "ASC"],
        ["hora_inicio", "ASC"],
      ], // Opcional: ordena por día y hora
    })
    console.log("Horarios obtenidos:", horarios)

    res.json(horarios)
  } catch (error) {
    console.error("Error al obtener los horarios de la clínica:", error)
    res.status(500).json({ error: "Error al obtener horarios" })
  }
}

exports.updateClinicHours = async (req, res) => {
  const nuevosHorarios = req.body // Se espera un arreglo con objetos: { id?, dia, hora_inicio, hora_fin, duracion_sesion }

  if (!Array.isArray(nuevosHorarios)) {
    return res.status(400).json({ error: "Formato de horarios inválido. Se espera un arreglo." })
  }

  const transaction = await HorarioClinica.sequelize.transaction() // Iniciar una transacción

  try {
    const existingHorarios = await HorarioClinica.findAll({ transaction })
    const existingIds = new Set(existingHorarios.map((h) => h.id))
    const newHorarioIds = new Set(nuevosHorarios.filter((h) => h.id !== null && h.id !== undefined).map((h) => h.id))

    // 1. Eliminar horarios que ya no están presentes en la nueva lista
    const idsToDelete = [...existingIds].filter((id) => !newHorarioIds.has(id))
    if (idsToDelete.length > 0) {
      await HorarioClinica.destroy({ where: { id: idsToDelete }, transaction })
    }

    // 2. Crear o actualizar horarios
    for (const nuevoHorario of nuevosHorarios) {
      // Asegurarse de que todos los campos requeridos estén presentes para cada horario
      if (
        !nuevoHorario.dia ||
        !nuevoHorario.hora_inicio ||
        !nuevoHorario.hora_fin ||
        nuevoHorario.duracion_sesion === undefined
      ) {
        throw new Error("Cada horario debe tener 'dia', 'hora_inicio', 'hora_fin' y 'duracion_sesion'.")
      }

      if (nuevoHorario.id && existingIds.has(nuevoHorario.id)) {
        // Actualizar registro existente
        await HorarioClinica.update(
          {
            dia: nuevoHorario.dia,
            hora_inicio: nuevoHorario.hora_inicio,
            hora_fin: nuevoHorario.hora_fin,
            duracion_sesion: nuevoHorario.duracion_sesion,
          },
          { where: { id: nuevoHorario.id }, transaction },
        )
      } else {
        // Crear nuevo registro (id es nulo o no encontrado en los existentes)
        await HorarioClinica.create(
          {
            dia: nuevoHorario.dia,
            hora_inicio: nuevoHorario.hora_inicio,
            hora_fin: nuevoHorario.hora_fin,
            duracion_sesion: nuevoHorario.duracion_sesion,
          },
          { transaction },
        )
      }
    }

    await transaction.commit() // Confirmar la transacción

    // Obtener y devolver la lista actualizada de horarios de la BD para asegurar la consistencia
    const updatedHorarios = await HorarioClinica.findAll({
      attributes: ["id", "dia", "hora_inicio", "hora_fin", "duracion_sesion"],
      order: [
        ["dia", "ASC"],
        ["hora_inicio", "ASC"],
      ],
    })

    res.json({ mensaje: "Horarios actualizados correctamente.", horarios: updatedHorarios })
  } catch (error) {
    await transaction.rollback() // Revertir en caso de error
    console.error("Error al actualizar horarios:", error)
    res.status(500).json({ error: "Error al actualizar los horarios de la clínica: " + error.message })
  }
}
