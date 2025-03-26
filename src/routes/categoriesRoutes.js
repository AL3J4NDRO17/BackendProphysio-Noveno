//Importacion del framework para crear apis
const express = require('express');

//Crear una nueva instancia para las rutas
const router = express.Router();

//Middlewares}
const { authorizeRole } = require('../middlewares/roleMiddleware');

//Controlador de categorías
const categoriaController = require('../controllers/categoriesController');

// Crear categoría
router.post('/createCategoria', categoriaController.createCategoria);

// Obtener todas las categorías
router.get('/getAllCategoria', categoriaController.getCategorias);

// Obtener categoría por ID
router.get('/getbyIdCategoria/:id', categoriaController.getCategoriaById);

// Actualizar categoría
router.put('/updateCategoria/:id', categoriaController.updateCategoria);

// Eliminar categoría
router.delete('/deleteCategoria/:id', categoriaController.deleteCategoria);

module.exports = router;
