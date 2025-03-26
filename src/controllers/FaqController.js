const { Faq } = require("../config/index");

// ✅ Crear una nueva FAQ
exports.createFaq = async (req, res) => {
  try {
    const { company_id, question, answer } = req.body;
    const newFaq = await Faq.create({ company_id, question, answer });
    res.status(201).json(newFaq);
  } catch (error) {
    console.error("Error al crear la FAQ:", error);
    res.status(500).json({ message: "Error al crear la FAQ" });
  }
};

// ✅ Obtener todas las FAQs de una empresa
exports.getFaqsByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;
    const faqs = await Faq.findAll({ where: { company_id } });
    res.status(200).json(faqs);
  } catch (error) {
    console.error("Error al obtener las FAQs:", error);
    res.status(500).json({ message: "Error al obtener las FAQs" });
  }
};

// ✅ Obtener una FAQ por su ID
exports.getFaqById = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await Faq.findByPk(id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ no encontrada" });
    }

    res.status(200).json(faq);
  } catch (error) {
    console.error("Error al obtener la FAQ:", error);
    res.status(500).json({ message: "Error al obtener la FAQ" });
  }
};

// ✅ Actualizar una FAQ
exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    const faq = await Faq.findByPk(id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ no encontrada" });
    }

    await faq.update({ question, answer });
    res.status(200).json(faq);
  } catch (error) {
    console.error("Error al actualizar la FAQ:", error);
    res.status(500).json({ message: "Error al actualizar la FAQ" });
  }
};

// ✅ Eliminar una FAQ
exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await Faq.findByPk(id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ no encontrada" });
    }

    await faq.destroy();
    res.status(200).json({ message: "FAQ eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar la FAQ:", error);
    res.status(500).json({ message: "Error al eliminar la FAQ" });
  }
};
