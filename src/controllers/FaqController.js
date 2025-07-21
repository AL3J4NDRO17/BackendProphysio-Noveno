const { Faqs, Company } = require("../config/index") // Asegúrate de que Faqs esté exportado desde tu config/index.js

exports.getFaqsByCompany = async (req, res) => {
  try {
   
    const { id } = req.params
    const faqs = await Faqs.findAll({ where: { company_id: id } })
    res.status(200).json(faqs)
  } catch (error) {
    console.error("Error al obtener FAQs por compañía:", error)
    res.status(500).json({ message: "Error interno del servidor al obtener FAQs." })
  }
}

exports.createFaq = async (req, res) => {
  try {
    const { company_id, question, answer } = req.body
    if (!company_id || !question || !answer) {
      return res.status(400).json({ message: "company_id, question y answer son requeridos." })
    }
    const newFaq = await Faqs.create({ company_id, question, answer })
    res.status(201).json(newFaq)
  } catch (error) {
    console.error("Error al crear FAQ:", error)
    res.status(500).json({ message: "Error interno del servidor al crear FAQ." })
  }
}

exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params
    const { question, answer } = req.body
    const faq = await Faqs.findByPk(id)
    if (!faq) {
      return res.status(404).json({ message: "FAQ no encontrada." })
    }
    await faq.update({ question, answer })
    res.status(200).json(faq)
  } catch (error) {
    console.error("Error al actualizar FAQ:", error)
    res.status(500).json({ message: "Error interno del servidor al actualizar FAQ." })
  }
}

exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params
    const faq = await Faqs.findByPk(id)
    if (!faq) {
      return res.status(404).json({ message: "FAQ no encontrada." })
    }
    await faq.destroy()
    res.status(200).json({ message: "FAQ eliminada correctamente." })
  } catch (error) {
    console.error("Error al eliminar FAQ:", error)
    res.status(500).json({ message: "Error interno del servidor al eliminar FAQ." })
  }
}
