
//Biblioteca para generar y generar tokens JWT
const jwt = require("jsonwebtoken");

//Modelo de la base de datos para Usuario
const { User } = require("../config/index")

//Funcion para renovar el token de acceso
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Asegúrate de que el token se envíe en las cookies
    if (!refreshToken) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Verificar el refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Refresh token inválido o expirado" });
      }

      // Obtener el usuario con el ID del decoded del refresh token
      const user = await User.findByPk(decoded.id_usuario, { attributes: ["id_usuario", "email", "rol"] });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Generar un nuevo refresh token
      const newRefreshToken = jwt.sign(
        { id_usuario: user.id_usuario, email: user.email, role: user.rol },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" } // Tiempo de expiración del refresh token
      );

      // Establecer el nuevo refresh token en las cookies
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true, // Asegúrate de que se use en HTTPS en producción
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      // Generar un nuevo access token
      const newAccessToken = jwt.sign(
        { id_usuario: user.id_usuario, email: user.email, role: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: "15m" } // Tiempo de expiración del access token
      );

      // Regresar el nuevo access token
      return res.status(200).json({
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    console.error("Error al renovar tokens:", error);
    res.status(500).json({ message: "Error al renovar tokens." });
  }
};