const { RadiografiaUsuario, PerfilUsuario } = require("../config");

const subirRadiografias = async (req, res) => {
  const id_perfil = req.params.idPerfil;
  console.log("entro", req.params)
  try {
    const perfil = await PerfilUsuario.findByPk(id_perfil);
    if (!perfil) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No se recibieron archivos" });
    }

    const resultados = [];

    for (const file of files) {
      const nueva = await RadiografiaUsuario.create({
        id_perfil,
        url: file.path, // Cloudinary ya da la URL final en .path
        descripcion: req.body.descripcion || null,
      });

      resultados.push(nueva);
    }

    res.status(201).json({ mensaje: "Radiografías subidas", radiografias: resultados });
  } catch (error) {
    console.error("Error al subir radiografías:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const getRadiografiasPorPerfil = async (req, res) => {
  const id_perfil = req.params.id;

  try {
    const radiografias = await RadiografiaUsuario.findAll({
      where: { id_perfil },
      order: [["createdAt", "DESC"]],
    });

    if (radiografias.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron radiografías para este perfil" });
    }

    res.status(200).json({ radiografias });
  } catch (error) {
    console.error("Error al obtener radiografías:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
module.exports = {
  subirRadiografias,getRadiografiasPorPerfil
};