const { SocialLink, Company } = require("../config/index") // Asegúrate de que SocialLink esté exportado desde tu config/index.js

exports.getSocialLinksByCompany = async (req, res) => {
  try {
    const { id } = req.params

    const socialLinks = await SocialLink.findAll({ where: { company_id: id } })
    res.status(200).json(socialLinks)
  } catch (error) {
    console.error("Error al obtener enlaces sociales por compañía:", error)
    res.status(500).json({ message: "Error interno del servidor al obtener enlaces sociales." })
  }
}

exports.createSocialLink = async (req, res) => {
  try {
    const { company_id, platform, url } = req.body
    if (!company_id || !platform || !url) {
      return res.status(400).json({ message: "company_id, platform y url son requeridos." })
    }
    const newLink = await SocialLink.create({ company_id, platform, url })
    res.status(201).json(newLink)
  } catch (error) {
    console.error("Error al crear enlace social:", error)
    res.status(500).json({ message: "Error interno del servidor al crear enlace social." })
  }
}

exports.updateSocialLink = async (req, res) => {
  try {
    const { id } = req.params
    const { platform, url } = req.body
    console.log("Datos recibidos para actualizar enlace social:", { id, platform, url })
    const socialLink = await SocialLink.findOne(platform)
    if (!socialLink) {
      return res.status(404).json({ message: "Enlace social no encontrado." })
    }
    await socialLink.update({ platform, url })
    res.status(200).json(socialLink)
  } catch (error) {
    console.error("Error al actualizar enlace social:", error)
    res.status(500).json({ message: "Error interno del servidor al actualizar enlace social." })
  }
}

exports.deleteSocialLink = async (req, res) => {
  try {
    const { id } = req.params
    const socialLink = await SocialLink.findByPk(id)
    if (!socialLink) {
      return res.status(404).json({ message: "Enlace social no encontrado." })
    }
    await socialLink.destroy()
    res.status(200).json({ message: "Enlace social eliminado correctamente." })
  } catch (error) {
    console.error("Error al eliminar enlace social:", error)
    res.status(500).json({ message: "Error interno del servidor al eliminar enlace social." })
  }
}
