const { SocialMediaLink, Company } = require("../config/index");

// ✅ Agregar una red social a una empresa
exports.addSocialMediaLink = async (req, res) => {
    try {
        const { company_id, platform, url } = req.body;

        // Verificar si la empresa existe
        const company = await Company.findByPk(company_id);
        if (!company) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }

        const newLink = await SocialMediaLink.create({ company_id, platform, url });
        res.status(201).json(newLink);
    } catch (error) {
        console.error("Error al agregar red social:", error);
        res.status(500).json({ message: "Error al agregar la red social" });
    }
};

// ✅ Obtener todas las redes sociales de una empresa
exports.getSocialMediaLinksByCompany = async (req, res) => {
    try {
        const { company_id } = req.params;
        const socialLinks = await SocialMediaLink.findAll({ where: { company_id } });
        res.status(200).json(socialLinks);
    } catch (error) {
        console.error("Error al obtener redes sociales:", error);
        res.status(500).json({ message: "Error al obtener redes sociales" });
    }
};

// ✅ Actualizar un enlace de red social
exports.updateSocialMediaLink = async (req, res) => {
    try {
        const { id } = req.params;
        const { platform, url } = req.body;
        const socialLink = await SocialMediaLink.findByPk(id);

        if (!socialLink) {
            return res.status(404).json({ message: "Red social no encontrada" });
        }

        await socialLink.update({ platform, url });
        res.status(200).json(socialLink);
    } catch (error) {
        console.error("Error al actualizar la red social:", error);
        res.status(500).json({ message: "Error al actualizar la red social" });
    }
};

// ✅ Eliminar una red social
exports.deleteSocialMediaLink = async (req, res) => {
    try {
        const { id } = req.params;
        const socialLink = await SocialMediaLink.findByPk(id);

        if (!socialLink) {
            return res.status(404).json({ message: "Red social no encontrada" });
        }

        await socialLink.destroy();
        res.status(200).json({ message: "Red social eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar la red social:", error);
        res.status(500).json({ message: "Error al eliminar la red social" });
    }
};
