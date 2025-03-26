
// Importar modelo de usuario
const { User } = require("../config/index")

// Obtener todos los usuarios
exports.getAllUsers = async (req, res, next) => {
  try {

    const users = await User.findAll({
      attributes: ["id_usuario", "email", "nombre", "rol", "activo"], // Excluir password
    });
    console.log(users)
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// Obtener un usuario por su ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      attributes: ["id_usuario", "email", "nombre", "rol", "activo"], // Excluir password
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, email } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    user.nombre = nombre || user.nombre;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({ message: "Perfil actualizado con éxito." });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // 🔥 Evitar que un usuario se elimine a sí mismo
    if (req.user.id === user.id_usuario) {
      return res.status(403).json({ message: "No puedes eliminar tu propia cuenta." });
    }

    await user.destroy();

    res.status(200).json({ message: "Usuario eliminado con éxito." });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};

exports.getIncidents = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["intentos_fallidos", "bloqueado", "fecha_bloqueo", "email"],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

