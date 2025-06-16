const express = require("express")
const router = express.Router()
const {
createCita,
getAllCitas,
deleteCita,
updateCitaEstado,
getCitaById,
confirmarCita,
getPerfilPorCita
} = require("../controllers/CitaController")

const { upload } = require("../utils/upload/fileUpload");


// GET todas las citas
router.get("/getAllCitas", getAllCitas)

// GET perfil por cita
router.get("/getPerfilPorCita/:id", getPerfilPorCita)

// POST crear nueva cita
router.post("/createCita", upload.single("file"), createCita)

router.get("/getCitaById/:id", getCitaById) 

// PUT actualizar estado de cita
router.put("/updateCitaEstado/:id", updateCitaEstado)

router.post("/confirmarCitaToken", confirmarCita) // Actualizar cita (puede ser crear o actualizar)



// DELETE eliminar cita
router.delete("/deleteCita/:id", deleteCita)
    
module.exports = router
