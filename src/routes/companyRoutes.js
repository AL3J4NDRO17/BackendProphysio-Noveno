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

router.post("/setCurrentLogo",CompanyController.setCurrentLogo)

router.post("deleteLogo",CompanyController.deleteLogo)

// ✅ Actualizar una empresa
router.put("/updateCompanies/:id", CompanyController.updateCompany);

// ✅ Eliminar una empresa
router.delete("/deleteCompanies/:id", CompanyController.deleteCompany);



///// ──────────────────────────────────────────────── /////
///            RUTAS DE REDES SOCIALES                 /////
/// ──────────────────────────────────────────────── /////

// ✅ Obtener todas las redes sociales de una empresa
router.get("/getAllSocialLink/:id", SocialMediaLinksController.getSocialLinksByCompany);

// ✅ Agregar una red social a una empresa
router.post("/createSocialLink", SocialMediaLinksController.createSocialLink);

// ✅ Actualizar un enlace de red social
router.put("/updateSocialLink/:id", SocialMediaLinksController.updateSocialLink);

// ✅ Eliminar una red social
router.delete("/deleteSocialLink/:id", SocialMediaLinksController.deleteSocialLink);

///// ──────────────────────────────────────────────── /////
///              RUTAS DE PREGUNTAS FRECUENTES         /////
/// ──────────────────────────────────────────────── /////

// ✅ Obtener todas las FAQs de una empresa
router.get("/getAllFaqs/:id", FaqController.getFaqsByCompany);
// ✅ Crear una nueva pregunta frecuente
router.post("/createFaq", FaqController.createFaq);

// ✅ Obtener una FAQ por su ID
router.get("/faq/:id", FaqController.getFaqsByCompany);

// ✅ Actualizar una FAQ
router.put("/faq/:id", FaqController.updateFaq);

// ✅ Eliminar una FAQ
router.delete("/faq/:id", FaqController.deleteFaq);

///// ──────────────────────────────────────────────── /////
///      RUTAS DE POLÍTICAS Y TÉRMINOS DE SERVICIO     /////
/// ──────────────────────────────────────────────── /////
// ✅ Obtener las políticas de una empresa
router.get("/policies/:company_id", PoliciesController.getPolicyByCompany);
// ✅ Crear o actualizar las políticas de una empresa
router.post("/policies", PoliciesController.createOrUpdatePolicy);

router.put("/policies/:company_id", PoliciesController.createOrUpdatePolicy);

// ✅ Eliminar las políticas de una empresa
router.delete("/policies/:company_id", PoliciesController.deletePolicy);



module.exports = router;
