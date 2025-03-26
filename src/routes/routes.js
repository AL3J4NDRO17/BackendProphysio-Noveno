/*
Este archivo se encarga de definir las rutas de la API, 
es decir, las URL que el cliente puede solicitar al servidor.
*/


//Importacion del framework para crear apis
const express = require('express');

//Crear una nueva instancia para las rutas
const router = express.Router();

//Rutas de autenticación
const authRoutes = require('./authRoutes');

//Rutas de usuarios
const userRoutes = require('./userRoutes');

//Rutas de blogs
const blogRoutes = require('./blogRoutes');

//Rutas de categorías
const categoryRoutes = require("./categoriesRoutes")

//Rutas de empresa
const companyRoutes = require('./companyRoutes');

//Rutas de Testimonios
const testimonialRoutes = require('./testimonialRoutes')

//Rutas de Perfil de Usuario
const perfilRoutes = require('./perfilRoutes')

//RutasPublicas
const infoPublicRoutes = require('./infoPublicRoutes');



//Middlewares
const { authenticateUser } = require('../middlewares/authMiddleware'); // Corregido
const { authorizeRole } = require('../middlewares/roleMiddleware');

//Csrf

//Endpoints de la API protegidos dependiendo de la ruta
router.use('/auth', authRoutes);
router.use('/users', authenticateUser, userRoutes);
router.use('/blog', blogRoutes, authenticateUser, authorizeRole(['admin']),)
router.use('/categoria', categoryRoutes, authenticateUser, authorizeRole(['admin']),)
router.use('/companie', companyRoutes, authenticateUser, authorizeRole(['admin']),);
router.use('/testimonial', testimonialRoutes, authenticateUser, authorizeRole(['admin']),);
router.use('/perfil', perfilRoutes, authenticateUser);


router.use('/public', infoPublicRoutes);


//Ruta de prueba para verificar que el servidor está funcionando
router.get('/test', (req, res) => {
    res.status(200).json({
        message: 'Servidor funcionando correctamente',
        timestamp: new Date(),
    });
});


router.get("/csrf-token", (req, res) => {
    const csrfToken = req.csrfToken();

    res.setHeader("X-CSRF-Token", csrfToken);

    

    res.status(200).json({ csrfToken });
});

module.exports = router;
