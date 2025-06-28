// controllers/companyController.js
const { Company, SocialLink, Service,HorarioClinica,sequelize,Cita,User } = require('../config/index');


exports.getCompaniesWithAddressAndSocialLinks = async (req, res) => {
    try {
        
        const companies = await Company.findAll({
            attributes: ['address', 'latitude', 'longitude','phone'],
            include: [
                {
                    model: SocialLink,
                    as: "socialLinks",
                    attributes: ['url', 'platform'],
                }
            ],
        });

        // Transformar cada compañía para separar socialLinks
        const transformed = companies.map(company => {
            const companyData = company.toJSON();

            const socialLinks = companyData.socialLinks || [];

            // Convertir array en propiedades separadas
            const socialLinksSeparated = socialLinks.reduce((acc, link) => {
                const key = link.platform.toLowerCase(); // ejemplo: 'facebook', 'twitter'
                acc[key] = link.url;
                return acc;
            }, {});

            // Construir objeto final sin socialLinks array
            const { socialLinks: _, ...rest } = companyData;

            return {
                ...rest,
                ...socialLinksSeparated
            };
        });
     
        res.status(200).json({ companies: transformed });
        

    } catch (error) {
        console.error("Error al obtener compañías:", error);
        res.status(500).json({ message: "Error al obtener compañías." });
    }
};


exports.getServices = async (req, res) => {
  try {
    const servicios = await Service.findAll({
      where: { activo: true },
      attributes: ["nombre", "descripcion", "precio"]
    })

    const servicesForWearOS = servicios.map(servicio => ({
      name: servicio.nombre,
      description: servicio.descripcion,
      price: servicio.precio.toString() // Convertir a string
    }))

    res.json(servicesForWearOS)
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({ message: "Error al obtener servicios." })
  }
}

exports.getSchedules = async (req, res) => {
  try {
    const horarios = await HorarioClinica.findAll({
      order: [
        // Ordenar por día de la semana
        [
          sequelize.literal(`CASE 
          WHEN dia = 'Lunes' THEN 1
          WHEN dia = 'Martes' THEN 2
          WHEN dia = 'Miércoles' THEN 3
          WHEN dia = 'Jueves' THEN 4
          WHEN dia = 'Viernes' THEN 5
          WHEN dia = 'Sábado' THEN 6
          WHEN dia = 'Domingo' THEN 7
          ELSE 8
        END`),
        ],
        ["hora_inicio", "ASC"],
      ],
    })

    // Agrupar horarios por día
    const horariosAgrupados = {}

    horarios.forEach((horario) => {
      const dia = horario.dia
      const bloqueHorario = `${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`

      if (!horariosAgrupados[dia]) {
        horariosAgrupados[dia] = []
      }

      horariosAgrupados[dia].push(bloqueHorario)
    })

    // Convertir a formato para Wear OS
    const schedulesForWearOS = Object.keys(horariosAgrupados).map((dia) => ({
      day: dia,
      hours: horariosAgrupados[dia].join(", "),
      description: horariosAgrupados[dia].length > 1 ? "Horario dividido" : "Horario continuo",
    }))

    res.json(schedulesForWearOS)
  } catch (error) {
    console.error("Error al obtener horarios para Wear OS:", error)
    res.status(500).json({ message: "Error al obtener los horarios." })
  }
}

// Nuevo endpoint para buscar cita por folio del usuario (Wear OS)
exports.getAppointmentByFolio = async (req, res) => {
  console.log("Recibiendo solicitud para buscar cita por folio")
  try {
    const { folio } = req.params

    if (!folio) {
      return res.status(400).json({ message: "El folio es requerido." })
    }

    // Primero buscar el usuario por folio
    const usuario = await User.findOne({
      where: { folio: folio.toUpperCase() },
    })

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado con ese folio." })
    }
 
    // Buscar la cita más reciente del usuario que no esté completada
    const cita = await Cita.findOne({
      where: {
        id_usuario: usuario.id_usuario,
        estado: ["pendiente", "confirmada", "cancelada", "postergada"], // Excluir completadas
      },
      include: [
        {
          model: User,
          as: "usuario",
          attributes: ["nombre", "folio"],
        },
      ],
      order: [["fecha_hora", "DESC"]], // La más reciente primero
    })
    console.log("Cita encontrada:", cita)
    if (!cita) {
      return res.status(404).json({ message: "No se encontraron citas pendientes para este folio." })
    }

  
    // Mapear el estado para Wear OS
    let estadoWearOS = cita.estado
    if (cita.estado === "pendiente") {
      estadoWearOS = "confirmada" // Mostrar como confirmada si está pendiente
    } else if (cita.estado === "postergada") {
      estadoWearOS = "recordatorio" // Mostrar como recordatorio si está postergada
    }

    // Formatear la respuesta para Wear OS
    const appointmentForWearOS = {
      folio: usuario.folio,
      patientName: usuario.nombre.split(" ").slice(0, 2).join(" "), // Solo el primer nombre
      sessionNumber: cita.numero_sesion,
      fecha_hora: cita.fecha_hora.toISOString(), // Enviar fecha completa
      status: estadoWearOS,
      notes: cita.notes || null,
    }
    console.log("Respuesta para Wear OS:", appointmentForWearOS)
    res.json(appointmentForWearOS)
  } catch (error) {
    console.error("Error al buscar cita por folio:", error)
    res.status(500).json({ message: "Error al buscar la cita." })
  }
}