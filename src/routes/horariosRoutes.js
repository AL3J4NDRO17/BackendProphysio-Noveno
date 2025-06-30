//Importacion del framework para crear apis
const express = require('express');

//Crear una nueva instancia para las rutas
const router = express.Router();

//Controlador de verificacion de sesion
const {getClinicHours,updateClinicHours} = require ('../controllers/clinicHoursController')

//Endpoints de la API
router.get('/getAllHorarios',getClinicHours);
router.put('/updateHorario/:id',updateClinicHours);

module.exports = router;
