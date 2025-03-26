const { body } = require("express-validator")
const { PerfilUsuario, User } = require("../config/index")

// Obtener todos los perfiles
exports.getAllPerfiles = async (req, res) => {
  try {
    const perfiles = await PerfilUsuario.findAll({
      include: [{ model: User, as: "usuario" }],
    })
    res.json(perfiles)
  } catch (err) {
    console.error("Error en getAllPerfiles:", err)
    res.status(500).json({ error: "Error al obtener los perfiles" })
  }
}

// Obtener perfil por ID
exports.getPerfilById = async (req, res) => {
  try {
    const { id } = req.params
    const perfil = await PerfilUsuario.findByPk(id, {
      include: [{ model: User, as: "usuario" }],
    })
    if (!perfil) return res.status(404).json({ error: "Perfil no encontrado" })
    res.json(perfil)
  } catch (err) {
    console.error("Error en getPerfilById:", err)
    res.status(500).json({ error: "Error al obtener el perfil" })
  }
}

// Crear nuevo perfil
exports.createPerfil = async (req, res) => {
  try {
    const nuevoPerfil = await PerfilUsuario.create(req.body)
    res.status(201).json(nuevoPerfil)
  } catch (err) {
    console.error("Error en createPerfil:", err)
    res.status(500).json({ error: "Error al crear el perfil" })
  }
}

// Actualizar perfil
exports.updatePerfil = async (req, res) => {
  try {
    const { id } = req.params
    console.log(req.body);
    const perfil = await PerfilUsuario.findByPk(id)
    if (!perfil) return res.status(404).json({ error: "Perfil no encontrado" })
    await perfil.update(req.body)
    res.json(perfil)
  } catch (err) {
    console.error("Error en updatePerfil:", err)
    res.status(500).json({ error: "Error al actualizar el perfil" })
  }
}

// Eliminar perfil
exports.deletePerfil = async (req, res) => {
  try {
    const { id } = req.params
    const perfil = await PerfilUsuario.findByPk(id)
    if (!perfil) return res.status(404).json({ error: "Perfil no encontrado" })
    await perfil.destroy()
    res.json({ message: "Perfil eliminado correctamente" })
  } catch (err) {
    console.error("Error en deletePerfil:", err)
    res.status(500).json({ error: "Error al eliminar el perfil" })
  }
}

