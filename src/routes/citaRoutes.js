const express = require("express")
const router = express.Router()
const {
createCita,marcarAsistida,marcarInasistencia,adminCrearCita,confirmarCita,deleteCita,getAllCitas,getCitaById,getPerfilPorCita,updateCita,cancelarCita,postergarCita
} = require("../controllers/CitaController")

const {getRadiografiasPorPerfil}=require("../controllers/RadiografiesController")

const { upload } = require("../utils/upload/fileUpload");


// GET todas las citas
router.get("/getAllCitas", getAllCitas)

// GET perfil por cita
router.get("/getPerfilPorCita/:id", getPerfilPorCita)

// POST crear nueva cita
router.post("/createCita", upload.any(), createCita);

router.get("/getRadiografies/:id",getRadiografiasPorPerfil)

router.post("/adminCreateCita",adminCrearCita)

router.get("/getCitaById/:id", getCitaById)

router.put("/updateCitaEstado/:id", updateCita)

router.put("/postergarCita/:id",postergarCita)

router.put("/cancelarCita/:id",cancelarCita)

router.post("/confirmarCitaToken", confirmarCita) // Actualizar cita (puede ser crear o actualizar)

router.put("/markAsistio/:id",marcarAsistida)

router.put("/markInasistencia/:id",marcarInasistencia)

// DELETE eliminar cita
router.delete("/deleteCita/:id", deleteCita)
    
module.exports = router
