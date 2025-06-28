const { Servicio } = require('../config/index'); // o según tu estructura

exports.getServicios = async (req, res) => {
  try {
    const servicios = await Servicio.findAll();
    res.json(servicios);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ message: "Error al obtener los servicios." });
  }
};

exports.getServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findByPk(id);

    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado." });
    }

    res.json(servicio);
  } catch (error) {
    console.error("Error al obtener el servicio:", error);
    res.status(500).json({ message: "Error al obtener el servicio." });
  }
};
