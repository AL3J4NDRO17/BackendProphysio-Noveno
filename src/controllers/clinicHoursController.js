const { HorarioClinica } = require("../config/index") // Ajusta la ruta si usas otra estructura

const DIAS_ES_A_EN = {
  "Domingo": "Sunday",
  "Lunes": "Monday",
  "Martes": "Tuesday",
  "Miércoles": "Wednesday",
  "Jueves": "Thursday",
  "Viernes": "Friday",
  "Sábado": "Saturday",
}

exports.getClinicHours = async (req, res) => {
  try {
    const horarios = await HorarioClinica.findAll({
      attributes: ["id", "dia", "hora_inicio", "hora_fin", "duracion_sesion","hora_comida_inicio","hora_comida_fin"],
      order: [
        ["dia", "ASC"],
        ["hora_inicio", "ASC"],
      ],
    })

    const horariosTraducidos = horarios.map((horario) => ({
      ...horario.toJSON(),
      dia: DIAS_ES_A_EN[horario.dia] || horario.dia, // Traduce si existe, si no deja igual
    }))

    console.log("Horarios traducidos:", horariosTraducidos)

    res.json(horariosTraducidos)
  } catch (error) {
    console.error("Error al obtener los horarios de la clínica:", error)
    res.status(500).json({ error: "Error al obtener horarios" })
  }
}


exports.updateClinicHours = async (req, res) => {
  const nuevosHorarios = req.body.horarios; // Accede al arreglo correctamente
  console.log("Horarios recibidos:", nuevosHorarios);

  if (!Array.isArray(nuevosHorarios)) {
    return res.status(400).json({ error: "Formato de horarios inválido. Se espera un arreglo." });
  }

  const diasInglesAEspanol = {
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
    Sunday: "Domingo",
  };

  const transaction = await HorarioClinica.sequelize.transaction();
  try {
    const existingHorarios = await HorarioClinica.findAll({ transaction });
    const existingIds = new Set(existingHorarios.map((h) => h.id));
    const newHorarioIds = new Set(
      nuevosHorarios.filter((h) => h.id !== null && h.id !== undefined).map((h) => h.id),
    );

    const idsToDelete = [...existingIds].filter((id) => !newHorarioIds.has(id));
    if (idsToDelete.length > 0) {
      await HorarioClinica.destroy({ where: { id: idsToDelete }, transaction });
    }

    for (const nuevoHorario of nuevosHorarios) {
      if (
        !nuevoHorario.dia ||
        !nuevoHorario.hora_inicio ||
        !nuevoHorario.hora_fin ||
        nuevoHorario.duracion_sesion === undefined
      ) {
        throw new Error("Cada horario debe tener 'dia', 'hora_inicio', 'hora_fin' y 'duracion_sesion'.");
      }

      // Validar que si se proporciona una hora de comida, ambas estén presentes
      if ((nuevoHorario.hora_comida_inicio && !nuevoHorario.hora_comida_fin) || (!nuevoHorario.hora_comida_inicio && nuevoHorario.hora_comida_fin)) {
        throw new Error("Si se especifica una hora de inicio de comida, también se debe especificar una hora de fin de comida, y viceversa.");
      }

      const diaEnEspanol = diasInglesAEspanol[nuevoHorario.dia] || nuevoHorario.dia;

      // Preparar los datos para la actualización/creación
      const dataToSave = {
        dia: diaEnEspanol,
        hora_inicio: nuevoHorario.hora_inicio,
        hora_fin: nuevoHorario.hora_fin,
        duracion_sesion: nuevoHorario.duracion_sesion,
        // Añadir los nuevos campos, asegurando que las cadenas vacías se conviertan a null
        hora_comida_inicio: nuevoHorario.hora_comida_inicio === "" ? null : nuevoHorario.hora_comida_inicio,
        hora_comida_fin: nuevoHorario.hora_comida_fin === "" ? null : nuevoHorario.hora_comida_fin,
      };

      if (nuevoHorario.id && existingIds.has(nuevoHorario.id)) {
        await HorarioClinica.update(
          dataToSave,
          { where: { id: nuevoHorario.id }, transaction },
        );
      } else {
        await HorarioClinica.create(
          dataToSave,
          { transaction },
        );
      }
    }

    await transaction.commit();

    // Asegúrate de incluir los nuevos campos en los atributos que se devuelven
    const updatedHorarios = await HorarioClinica.findAll({
      attributes: ["id", "dia", "hora_inicio", "hora_fin", "duracion_sesion", "hora_comida_inicio", "hora_comida_fin"],
      order: [
        ["dia", "ASC"],
        ["hora_inicio", "ASC"],
      ],
    });

    res.json({ mensaje: "Horarios actualizados correctamente.", horarios: updatedHorarios });
  } catch (error) {
    await transaction.rollback();
    console.error("Error al actualizar horarios:", error);
    res.status(500).json({ error: "Error al actualizar los horarios de la clínica: " + error.message });
  }
};