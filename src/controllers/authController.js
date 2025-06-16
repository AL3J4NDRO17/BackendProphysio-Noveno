
const dotenv = require('dotenv');

dotenv.config();

// exports.getCurrentUser = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "No autorizado." });
//     }

//     const user = await User.findByPk(req.user.id_usuario, {
//       attributes: ["id_usuario", "nombre", "email", "rol"],
//     });

//     if (!user) {
//       return res.status(404).json({ message: "Usuario no encontrado." });
//     }

//     res.status(200).json({ user });
//   } catch (error) {
//     console.error("Error obteniendo usuario:", error);
//     res.status(500).json({ message: "Error en el servidor." });
//   }
// };

//Funcion para cerrar sesion
exports.logout = async (req, res) => {
  res.clearCookie("authToken", { httpOnly: true, secure: true, sameSite: "None" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "None" });
  res.status(200).json({ message: "Cierre de sesión exitoso." });
};

// exports.getMe = async (req, res) => {
//   console.log(req.user)
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "No autorizado." });
//     }

//     const user = await User.findByPk(req.user.id, {
//       attributes: ["id_usuario", "nombre", "email", "rol"], // 🔥 Incluir el campo `rol`
//     });
//     if (!user) {
//       return res.status(404).json({ message: "Usuario no encontrado." });
//     }

//     res.status(200).json({ user });
//   } catch (error) {
//     console.error("Error obteniendo usuario:", error);
//     res.status(500).json({ message: "Error en el servidor." });
//   }
// };

