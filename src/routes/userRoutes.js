const express = require('express');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { authorizeRole } = require('../middlewares/roleMiddleware');
const { getAllUsers, getUserById, updateUser, deleteUser ,getIncidents,searchUsers, getUserWithProfile} = require('../controllers/userController');

const router = express.Router();

// Obtener todos los usuarios (solo Admin)
router.get('/getAllUsers', authenticateUser, authorizeRole(['admin']), getAllUsers);

// Buscar usuarios por término (admin)
router.get('/search', authenticateUser, authorizeRole(['admin']), searchUsers);


// Obtener un usuario por ID (admin o el propio usuario)
router.get('/:id', authenticateUser, getUserById);

// Obtener perfil completo de un paciente (usuario + perfil asociado)
router.get('/:id/profile', authenticateUser, getUserWithProfile);

// Obtener usuarios con incidentes
router.get('/getIncidents', authenticateUser, getIncidents);

// Actualizar perfil (admin o el propio usuario)
router.put('/:id', authenticateUser, updateUser);

// Eliminar usuario (solo Admin)
router.delete('/:id', authenticateUser, authorizeRole(['admin']), deleteUser);


module.exports = router;
