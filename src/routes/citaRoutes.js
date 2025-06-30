const express = require("express")
const router = express.Router()
const {
createCita,adminCrearCita,confirmarCita,deleteCita,getAllCitas,getCitaById,getPerfilPorCita,updateCita
} = require("../controllers/CitaController")

const { upload } = require("../utils/upload/fileUpload");


// GET todas las citas
router.get("/getAllCitas", getAllCitas)

// GET perfil por cita
router.get("/getPerfilPorCita/:id", getPerfilPorCita)

// POST crear nueva cita
router.post("/createCita", upload.single("file"), createCita)

router.get("/getCitaById/:id", getCitaById)

router.put("/updateCitaEstado/:id", updateCita)

router.post("/confirmarCitaToken", confirmarCita) // Actualizar cita (puede ser crear o actualizar)



// DELETE eliminar cita
router.delete("/deleteCita/:id", deleteCita)
    
module.exports = router
