const express = require("express")
const router = express.Router()
const {
  getAllPerfiles,
  getPerfilById,
  createPerfil,
  updatePerfil,
  deletePerfil,
} = require("../controllers/PerfilUsuarioController")

// GET todos los perfiles
router.get("/getAllUserData", getAllPerfiles)

// GET un perfil por ID
router.get("/userData/:id", getPerfilById)

// POST crear nuevo perfil
router.post("/createUserData", createPerfil)

// PUT actualizar perfil existente
router.put("/updateUserData/:id", updatePerfil)

// DELETE eliminar perfil
router.delete("/deleteUserData/:id", deletePerfil)

module.exports = router
