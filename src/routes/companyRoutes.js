const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/CompanyController");
const SocialMediaLinksController = require("../controllers/SocialMediaLinksController");
const FaqController = require("../controllers/FaqController");
const PoliciesController = require("../controllers/policiesController");

const { upload, cloudinary } = require('../utils/upload/fileUpload');  // Asegúrate de tener la configuración de multer aquí

///// ──────────────────────────────────────────────── /////
///                   RUTAS DE EMPRESAS                /////
/// ──────────────────────────────────────────────── /////

// ✅ Crear una nueva empresa
router.post("/createCompanie", CompanyController.createCompany);

// ✅ Obtener todas las empresas
router.get("/getAllCompanies", CompanyController.getCompanies);

router.get("/getCompanyLogos/:id",CompanyController.getCompanyLogos)

// ✅ Obtener una empresa por su ID
router.get("/getByIdcompanies/:id", CompanyController.getCompanyById);

router.post("/uploadLogo", upload.single("file"),CompanyController.uploadLogo)

// ✅ Actualizar una empresa
router.put("/updateCompanies/:id", CompanyController.updateCompany);

// ✅ Eliminar una empresa
router.delete("/deleteCompanies/:id", CompanyController.deleteCompany);


///// ──────────────────────────────────────────────── /////
///            RUTAS DE REDES SOCIALES                 /////
/// ──────────────────────────────────────────────── /////

// ✅ Agregar una red social a una empresa
router.post("/createSocialLink", SocialMediaLinksController.addSocialMediaLink);

// ✅ Obtener todas las redes sociales de una empresa
router.get("/getAllSocialLink", SocialMediaLinksController.getSocialMediaLinksByCompany);

// ✅ Actualizar un enlace de red social
router.put("/updateSocialLink", SocialMediaLinksController.updateSocialMediaLink);

// ✅ Eliminar una red social
router.delete("/deleteSocialLink", SocialMediaLinksController.deleteSocialMediaLink);

///// ──────────────────────────────────────────────── /////
///              RUTAS DE PREGUNTAS FRECUENTES         /////
/// ──────────────────────────────────────────────── /////

// ✅ Crear una nueva pregunta frecuente
router.post("/faqs", FaqController.createFaq);

// ✅ Obtener todas las FAQs de una empresa
router.get("/faqs/:company_id", FaqController.getFaqsByCompany);

// ✅ Obtener una FAQ por su ID
router.get("/faq/:id", FaqController.getFaqById);

// ✅ Actualizar una FAQ
router.put("/faq/:id", FaqController.updateFaq);

// ✅ Eliminar una FAQ
router.delete("/faq/:id", FaqController.deleteFaq);

///// ──────────────────────────────────────────────── /////
///      RUTAS DE POLÍTICAS Y TÉRMINOS DE SERVICIO     /////
/// ──────────────────────────────────────────────── /////

// ✅ Crear o actualizar las políticas de una empresa
router.post("/policies", PoliciesController.createOrUpdatePolicy);

// ✅ Obtener las políticas de una empresa
router.get("/policies/:company_id", PoliciesController.getPolicyByCompany);

// ✅ Eliminar las políticas de una empresa
router.delete("/policies/:company_id", PoliciesController.deletePolicy);



module.exports = router;
