const express = require('express');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { authorizeRole } = require('../middlewares/roleMiddleware');
const { getAllUsers, getUserById, updateUser, deleteUser ,getIncidents} = require('../controllers/userController');

const router = express.Router();

// Obtener todos los usuarios (solo Admin)
router.get('/getAllUsers', authenticateUser, authorizeRole(['admin']), getAllUsers);

// Obtener un usuario por ID (admin o el propio usuario)
router.get('/:id', authenticateUser, getUserById);

// Obtener usuarios con incidentes
router.get('/getIncidents', authenticateUser, getIncidents);

// Actualizar perfil (admin o el propio usuario)
router.put('/:id', authenticateUser, updateUser);

// Eliminar usuario (solo Admin)
router.delete('/:id', authenticateUser, authorizeRole(['admin']), deleteUser);

module.exports = router;
