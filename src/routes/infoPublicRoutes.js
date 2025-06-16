const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/CompanyController");
const FaqController = require("../controllers/FaqController");
const PoliciesController = require("../controllers/policiesController");
const BlogController = require("../controllers/blogController");
const categoriaController = require("../controllers/categoriesController");
const testimonioController = require("../controllers/testimonialController");
const resetPasswordController= require("../controllers/resetPasswordController")
const registerController = require('../controllers/registerController')

///// ──────────────────────────────────────────────── /////
///               RUTAS PÚBLICAS SIN LOGIN            /////
/// ──────────────────────────────────────────────── /////


// ✅ Obtener todas las empresas disponibles
router.get("/companies", CompanyController.getCompanies);

// ✅ Obtener una empresa específica por su ID
router.get("/companies/:id", CompanyController.getCompanyById);

// ✅ Obtener las FAQs de una empresa
router.get("/faqs/:company_id", FaqController.getFaqsByCompany);

// ✅ Obtener una FAQ por su ID
router.get("/faq/:id", FaqController.getFaqById);

// ✅ Obtener las políticas y términos de servicio de una empresa
router.get("/policies/:company_id", PoliciesController.getPolicyByCompany);

//Categorias
router.get('/getAllCategoria', categoriaController.getCategorias);

// Obtener categoría por ID
router.get('/getbyIdCategoria/:id', categoriaController.getCategoriaById);

//Blogs 
router.get('/list', BlogController.getBlogs);
router.get('/getBlogById/:id',BlogController.getBlogById)

//Testimonios
router.get("/getAllTestimonial", testimonioController.getAllTestimonios);

//Solicitar Todas las preguntas secretas
router.get("/getAllPreguntasSecretas",registerController.getAllPreguntasSecretas);


//Solicitar reestablecimiento de contraseña
router.post("/requestRecoverPass", resetPasswordController.solicitarCodigoRecuperacion);

//ReestablecerContraseña
router.post("/SetRecoverPass", resetPasswordController.restablecerPasswordConCodigo);

//ReestablecerContraseña por pregunta secreta
router.post("/requestRecoverByQuestion", resetPasswordController.verificarPreguntaSecreta);

//Solicitar reestablecimiento de pregunta secreta
router.post("/requestSecretQuestion", resetPasswordController.solicitarPreguntaSecreta);


//Verificar codigo
router.post("/verifyCode", resetPasswordController.verificarCodigoOTPRessetPass);

module.exports = router;
