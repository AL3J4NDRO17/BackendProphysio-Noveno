const express = require("express")
const router = express.Router()

const { upload } = require("../utils/upload/fileUpload");

const {
  getAllPerfiles,
  getPerfilById,
  createPerfil,
  updatePerfil,
  deletePerfil,
} = require("../controllers/PerfilUsuarioController")

const {
  subirRadiografias
}= require("../controllers/RadiografiesController")

// GET todos los perfiles
router.get("/getAllUserData", getAllPerfiles)

// GET un perfil por ID
router.get("/userData/:id", getPerfilById)

// POST crear nuevo perfil
router.post("/createUserData", createPerfil)

// Subir Radiografias
router.post("/:idPerfil", upload.array("archivos", 5), subirRadiografias);

// PUT actualizar perfil existente
router.put("/updateUserData/:id", updatePerfil)

// DELETE eliminar perfil
router.delete("/deleteUserData/:id", deletePerfil)

module.exports = router
