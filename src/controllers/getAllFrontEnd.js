const { Company, SocialLink, Faqs } = require("../config/index");



exports.getFullCompanyData = async (req, res) => {
  try {
    // Tomamos la primera empresa registrada (puedes adaptarlo si manejas múltiples)
    const company = await Company.findOne({
      include: [
        { model: Faqs, as: "faqs" },
        { model: SocialLink, as: "socialLinks" },
      ],
    });

    if (!company) {
      return res.status(404).json({ message: "No hay empresa registrada" });
    }

    // Preparar la respuesta unificada
    const fullData = {
      id: company.company_id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
      mission: company.mission,
      vision: company.vision,
      logo_url: company.logo_url,
      logos_history: company.logos_history || [],
      socialLinks: company.socialLinks || [],
      faqs: company.faqs || [],
    };

    return res.status(200).json(fullData);
  } catch (error) {
    console.error("Error al obtener datos completos de la empresa:", error);
    return res.status(500).json({ message: "Error interno al cargar datos de la empresa" });
  }
};
