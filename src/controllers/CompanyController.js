const { Company, SocialLink, Faqs } = require("../config/index");
const Faq = require("../models/Faq");
const { cloudinary } = require("../utils/upload/fileUpload");



exports.createCompany = async (req, res) => {
    try {
        console.log("🚀 Intentando crear una empresa...");

        // ✅ Verificar si ya hay al menos una empresa en la tabla
        const existingCompany = await Company.findOne({
            include: [
                { model: Faqs, as: "faqs" },
                { model: SocialLink, as: "socialLinks" }
            ]
        });

        if (existingCompany) {
            console.log("⚠️ Ya existe una empresa registrada. Retornando la existente...");
            return res.status(200).json(existingCompany);
        }

        // ✅ No hay empresas, crear una nueva
        console.log("✅ No se encontró ninguna empresa. Creando una nueva...");

        const newCompany = await Company.create({
            name: "Nueva Empresa",
            email: "",
            phone: "",
            address: "",
            mission: "",
            vision: ""
        });

        console.log("✅ Empresa creada con ID:", newCompany.company_id);

        // ✅ Crear FAQs asociadas a la empresa
        const defaultFaqs = [
            { company_id: newCompany.company_id, question: "¿Cuál es la misión de la empresa?", answer: "Nuestra misión es proporcionar el mejor servicio." },
            { company_id: newCompany.company_id, question: "¿Dónde estamos ubicados?", answer: "Nuestra empresa está ubicada en la mejor zona." }
        ];
        await Faqs.bulkCreate(defaultFaqs);
        console.log("✅ FAQs creadas correctamente.");

        // ✅ Crear enlaces sociales predeterminados
        const defaultSocialLinks = [
            { company_id: newCompany.company_id, platform: "Facebook", url: "https://facebook.com/empresa" },
            { company_id: newCompany.company_id, platform: "Twitter", url: "https://twitter.com/empresa" }
        ];
        await SocialLink.bulkCreate(defaultSocialLinks);
        console.log("✅ Redes sociales creadas correctamente.");

        // ✅ Obtener la empresa con sus relaciones y devolverla
        const fullCompanyData = await Company.findByPk(newCompany.company_id, {
            include: [
                { model: Faqs, as: "faqs" },
                { model: SocialLink, as: "socialLinks" }
            ]
        });

        res.status(201).json(fullCompanyData);
    } catch (error) {
        console.error("❌ Error al crear la empresa:", error);
        res.status(500).json({ message: "Error interno al crear la empresa" });
    }
};


// ✅ Obtener todas las empresas
exports.getCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll({
            include: [
                { model: SocialLink, as: "socialLinks" },
                { model: Faqs, as: "faqs" }, // Agregar FAQs en la respuesta
            ],
        });
        res.status(200).json(companies);
    } catch (error) {
        console.error("Error al obtener empresas:", error);
        res.status(500).json({ message: "Error al obtener empresas" });
    }
};

// ✅ Obtener una empresa por su ID con redes sociales y FAQs
exports.getCompanyById = async (req, res) => {
    try {
        let { companyId } = req.params;

        // ✅ Validar que `companyId` sea un número
        if (!companyId || isNaN(companyId)) {
            return res.status(400).json({ message: "ID de empresa inválido" });
        }

        companyId = parseInt(companyId); // Convertir a número

        console.log("🔍 Buscando empresa con ID:", companyId);
        const company = await Company.findByPk(companyId, {
            include: [
                { model: Faqs, as: "faqs" },
                { model: SocialLink, as: "socialLinks" }
            ]
        });

        if (!company) {
            console.log("⚠️ Empresa no encontrada.");
            return res.status(404).json({ message: "Empresa no encontrada" });
        }

        res.status(200).json(company);
    } catch (error) {
        console.error("❌ Error al obtener la empresa:", error);
        res.status(500).json({ message: "Error interno al obtener la empresa" });
    }
};

// ✅ Actualizar una empresa


exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { faqs, socialLinks, ...companyData } = req.body; // Separar datos de empresa, FAQ y SocialLinks

        // ✅ Verificar que `companyId` sea un número válido
        if (!id || isNaN(id)) {
            return res.status(400).json({ message: "ID de empresa inválido" });
        }

        const companyid = parseInt(id);

        // ✅ Buscar la empresa
        let company = await Company.findByPk(companyid, {
            include: [
                { model: Faqs, as: "faqs" },
                { model: SocialLink, as: "socialLinks" }
            ]
        });

        if (!company) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }

        // ✅ Actualizar datos de la empresa
        await company.update(companyData);

        // ✅ Si se enviaron `FAQ`, actualizar o crear nuevas
        if (faqs && Array.isArray(faqs)) {
            await Promise.all(
                faqs.map(async (faq) => {
                    if (faq.faq_id) {
                        // Si ya existe, actualizarlo
                        await FAQ.update(faq, { where: { faq_id: faq.faq_id, company_id: companyid } });
                    } else {
                        // Si no existe, crearlo
                        await FAQ.create({ ...faq, company_id: companyid });
                    }
                })
            );
        }

        // ✅ Si se enviaron `SocialLinks`, actualizar o crear nuevas
        if (socialLinks && Array.isArray(socialLinks)) {
            await Promise.all(
                socialLinks.map(async (link) => {
                    if (link.social_id) {
                        // Si ya existe, actualizarlo
                        await SocialLink.update(link, { where: { social_id: link.social_id, company_id: companyid } });
                    } else {
                        // Si no existe, crearlo
                        await SocialLink.create({ ...link, company_id: companyid });
                    }
                })
            );
        }

        // ✅ Obtener la empresa con los datos actualizados
        company = await Company.findByPk(id, {
            include: [
                { model: Faqs, as: "faqs" },
                { model: SocialLink, as: "socialLinks" }
            ]
        });

        res.status(200).json(company);
    } catch (error) {
        console.error("❌ Error al actualizar la empresa:", error);
        res.status(500).json({ message: "Error interno al actualizar la empresa" });
    }
};



// ✅ Eliminar una empresa
exports.deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByPk(id);

        if (!company) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }

        await company.destroy();
        res.status(200).json({ message: "Empresa eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar la empresa:", error);
        res.status(500).json({ message: "Error al eliminar la empresa" });
    }
};
exports.uploadLogo = async (req, res) => {
    try {
        console.log("meto a acualizar logito")

        if (!req.file) {
            return res.status(400).json({ message: "No se ha subido ningún archivo" });
        }

        // Subir imagen a Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "company-logos",
        });

        const { company_id } = req.body;
        if (!company_id) {
            return res.status(400).json({ message: "ID de empresa requerido" });
        }

        // Buscar la empresa
        const company = await Company.findByPk(company_id);
        if (!company) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }

        // Agregar el logo actual al historial antes de actualizarlo
        const updatedLogosHistory = company.logo_url
            ? [company.logo_url, ...company.logos_history]  // Mantiene los logos anteriores
            : [...company.logos_history];

        // Actualizar la empresa con el nuevo logo
        await company.update({
            logo_url: result.secure_url,
            logos_history: updatedLogosHistory.slice(0, 5), // Máximo 5 logos anteriores
        });

        return res.json({ message: "Logo actualizado", logo_url: result.secure_url, logos_history: updatedLogosHistory });
    } catch (error) {
        console.log("Error al subir el logo:", error);
        return res.status(500).json({ message: "Error al subir el logo" });
    }
};
exports.getCompanyLogos = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await Company.findByPk(id);
        if (!company) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }

        res.json({ current_logo: company.logo_url, history: company.logos_history });
    } catch (error) {
        console.error("Error al obtener el historial de logos:", error);
        res.status(500).json({ message: "Error interno al obtener el historial de logos" });
    }
};
exports.setCurrentLogo = async (req, res) => {
    try {
        console.log(req.body)
        const { companyId, logo } = req.body;

        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }

        if (!company.logos_history.includes(logo)) {
            return res.status(400).json({ message: "El logo no pertenece al historial de esta empresa" });
        }

        // Mover el logo actual al historial y establecer el nuevo
        const updatedLogosHistory = [company.logo_url, ...company.logos_history.filter(url => url !== logo)];

        await company.update({
            logo_url: logo,
            logos_history: updatedLogosHistory.slice(0, 5),
        });

        res.json({ message: "Logo actualizado correctamente", logo_url: logo });
    } catch (error) {
        console.error("Error al establecer el logo actual:", error);
        res.status(500).json({ message: "Error al actualizar el logo" });
    }
};
exports.deleteLogo = async (req, res) => {
    try {
        const { companyId, logoUrl } = req.body;

        if (!companyId || !logoUrl) {
            return res.status(400).json({ message: "Faltan datos: companyId o logoUrl" });
        }

        // Buscar empresa
        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }

        // Extraer public_id desde la URL
        const urlParts = logoUrl.split("/");
        const fileNameWithExtension = urlParts[urlParts.length - 1]; // ej: abc123.jpg
        const folderName = urlParts[urlParts.length - 2]; // ej: company-logos
        const publicId = `${folderName}/${fileNameWithExtension.split(".")[0]}`; // company-logos/abc123

        // Eliminar de Cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Eliminar de logos_history
        const updatedHistory = company.logos_history.filter(url => url !== logoUrl);

        // Si el logo eliminado es el actual, limpiar
        const isCurrent = company.logo_url === logoUrl;
        await company.update({
            logo_url: isCurrent ? null : company.logo_url,
            logos_history: updatedHistory,
        });

        res.json({
            message: "Logo eliminado correctamente",
            current_logo: isCurrent ? null : company.logo_url,
            logos_history: updatedHistory,
        });
    } catch (error) {
        console.error("Error al eliminar el logo:", error);
        res.status(500).json({ message: "Error interno al eliminar el logo" });
    }
};
exports.updateLogo = async (req, res) => {
    try {
        console.log("🟡 Intentando actualizar logo...");

        if (!req.file) {
            return res.status(400).json({ message: "No se ha subido ningún archivo" });
        }

        const { company_id } = req.body;
        if (!company_id) {
            return res.status(400).json({ message: "ID de empresa requerido" });
        }

        const company = await Company.findByPk(company_id);
        if (!company) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }

        // 🧹 Eliminar el logo actual de Cloudinary si existe
        if (company.logo_url) {
            const urlParts = company.logo_url.split("/");
            const fileNameWithExtension = urlParts[urlParts.length - 1];
            const folderName = urlParts[urlParts.length - 2];
            const publicId = `${folderName}/${fileNameWithExtension.split(".")[0]}`;

            await cloudinary.uploader.destroy(publicId);
        }

        // 📤 Subir nuevo logo a Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "company-logos",
        });

        // ✅ Actualizar la empresa con el nuevo logo y limpiar historial
        await company.update({
            logo_url: result.secure_url,
            logos_history: [], // Si quieres mantener historial anterior, cambia esto
        });

        res.json({
            message: "Logo actualizado correctamente",
            logo_url: result.secure_url,
        });
    } catch (error) {
        console.error("Error al actualizar el logo:", error);
        res.status(500).json({ message: "Error interno al actualizar el logo" });
    }
};

