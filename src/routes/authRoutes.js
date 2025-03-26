//Importacion del framework para crear apis
const express = require('express');

//Crear una nueva instancia para las rutas
const router = express.Router();

//Controlador de cierre de sesion
const { logout } = require('../controllers/authController');

//Controlador de verificacion de sesion
const {checkSession} = require ('../controllers/sessionController')

//Controlador de inicio de sesion y verificacion de otp y reenvio
const {login ,verifyLoginCode,resendOtp } = require('../controllers/loginController')

//Controlador de registro y activar cuenta
const { register,activateAccount,getAllPreguntasSecretas } = require('../controllers/registerController')

//Endpoints de la API
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/activate', activateAccount);
router.post('/resendOtp', resendOtp);
router.post('/verifyLogin', verifyLoginCode);
router.get('/checkSession', checkSession);
router.get('/getAllPreguntasSecretas', getAllPreguntasSecretas);

module.exports = router;
