const { Policy, Company } = require("../config/index");

// ✅ Crear o actualizar las políticas de una empresa
exports.createOrUpdatePolicy = async (req, res) => {
  try {
    const { company_id, privacy_policy, terms_conditions } = req.body;

    // Verificar si la empresa existe
    const company = await Company.findByPk(company_id);
    if (!company) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    // Buscar si ya existen políticas para esta empresa
    let policy = await Policy.findOne({ where: { company_id } });

    if (policy) {
      // Si existe, actualizarla
      await policy.update({ privacy_policy, terms_conditions });
      return res.status(200).json(policy);
    } else {
      // Si no existe, crearla
      const newPolicy = await Policy.create({ company_id, privacy_policy, terms_conditions });
      return res.status(201).json(newPolicy);
    }
  } catch (error) {
    console.error("Error al gestionar políticas:", error);
    res.status(500).json({ message: "Error al gestionar políticas" });
  }
};

// ✅ Obtener las políticas de una empresa
exports.getPolicyByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;
    const policy = await Policy.findOne({ where: { company_id } });

    if (!policy) {
      return res.status(404).json({ message: "Políticas no encontradas" });
    }

    res.status(200).json(policy);
  } catch (error) {
    console.error("Error al obtener políticas:", error);
    res.status(500).json({ message: "Error al obtener políticas" });
  }
};

// ✅ Eliminar las políticas de una empresa
exports.deletePolicy = async (req, res) => {
  try {
    const { company_id } = req.params;

    const policy = await Policy.findOne({ where: { company_id } });

    if (!policy) {
      return res.status(404).json({ message: "Políticas no encontradas" });
    }

    await policy.destroy();
    res.status(200).json({ message: "Políticas eliminadas con éxito" });
  } catch (error) {
    console.error("Error al eliminar políticas:", error);
    res.status(500).json({ message: "Error al eliminar políticas" });
  }
};
