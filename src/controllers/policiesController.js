const { Policy, Company } = require("../config/index") // Asegúrate de que Policy esté exportado desde tu config/index.js

exports.getPolicyByCompany = async (req, res) => {
  try {
   
    const { company_id } = req.params
    const policy = await Policy.findOne({ where: { company_id } })
    if (!policy) {
      return res.status(404).json({ message: "Política no encontrada para esta empresa." })
    }
    res.status(200).json(policy)
  } catch (error) {
    console.error("Error al obtener política por compañía:", error)
    res.status(500).json({ message: "Error interno del servidor al obtener política." })
  }
}

exports.createOrUpdatePolicy = async (req, res) => {
  try {
    console.log(req.body)
    const { company_id, privacy_policy, terms_conditions, policy_id } = req.body

    if (!company_id) {
      return res.status(400).json({ message: "company_id es requerido." })
    }

    let policy
    if (policy_id) {
      // Intentar actualizar
      policy = await Policy.findByPk(policy_id)
      if (!policy) {
        return res.status(404).json({ message: "Política no encontrada para actualizar." })
      }
      await policy.update({ privacy_policy, terms_conditions })
    } else {
      // Intentar crear o encontrar existente por company_id
      policy = await Policy.findOne({ where: { company_id } })
      if (policy) {
        // Si ya existe una política para esta empresa, actualizarla
        await policy.update({ privacy_policy, terms_conditions })
      } else {
        // Si no existe, crear una nueva
        policy = await Policy.create({ company_id, privacy_policy, terms_conditions })
      }
    }
    res.status(200).json(policy)
  } catch (error) {
    console.error("Error al crear o actualizar política:", error)
    res.status(500).json({ message: "Error interno del servidor al crear o actualizar política." })
  }
}

exports.deletePolicy = async (req, res) => {
  try {
    const { id } = req.params
    const policy = await Policy.findByPk(id)
    if (!policy) {
      return res.status(404).json({ message: "Política no encontrada." })
    }
    await policy.destroy()
    res.status(200).json({ message: "Política eliminada correctamente." })
  } catch (error) {
    console.error("Error al eliminar política:", error)
    res.status(500).json({ message: "Error interno del servidor al eliminar política." })
  }
}
