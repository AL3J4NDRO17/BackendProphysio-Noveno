const jwt = require("jsonwebtoken");
const { User } = require("../config/index");
const dotenv = require('dotenv');

dotenv.config();

exports.checkSession = async (req, res) => {
  const token = req.cookies.authToken;
  const refreshToken = req.cookies.refreshToken;

  if (!token) {
    res.clearCookie("authToken");
    res.clearCookie("refreshToken");
    return res.status(401).json({ isAuthenticated: false, message: "No hay sesión activa" });
  }

  try {
    // Intentar verificar el access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
    const user = await User.findByPk(decoded.id, {
      attributes: ["id_usuario", "nombre", "email", "rol", "id_perfil"]
    });

    if (!user) {
      return res.status(401).json({ isAuthenticated: false, message: "Usuario no encontrado" });
    }

    return res.status(200).json({
      isAuthenticated: true,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        id_Perfil: user.id_perfil
      },
    });

  } catch (error) {
    // Verificamos si el error fue porque el token expiró
    if (error.name === 'TokenExpiredError') {
      console.log("AuthToken expirado, verificando RefreshToken...");

      if (!refreshToken) {
        return res.status(401).json({ isAuthenticated: false, message: "Sesión expirada y no se encontró refresh token." });
      }

      // Intentar verificar el refresh token
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decodedRefresh) => {
        if (err) {
          return res.status(403).json({ isAuthenticated: false, message: "Refresh token inválido o expirado" });
        }

        const user = await User.findByPk(decodedRefresh.id, {
          attributes: ["id_usuario", "nombre", "email", "rol", "id_perfil"]
        });

        if (!user) {
          return res.status(404).json({ isAuthenticated: false, message: "Usuario no encontrado" });
        }

        if (user.rol === "admin") {
          console.log("El usuario es admin, no se puede renovar el token sin reautenticación.");
          return res.status(403).json({
            isAuthenticated: false,
            message: "Los administradores deben volver a iniciar sesión por seguridad.",
          });
        }

        // Generar nuevo access token
        const newAccessToken = jwt.sign(
          {
            id: user.id_usuario,
            email: user.email,
            role: user.rol,
            id_Perfil: user.id_perfil
          },
          process.env.JWT_SECRET,
          { expiresIn: "8h" } // Puedes bajarlo a 10s si es para pruebas
        );

        console.log("Nuevo authToken generado:", newAccessToken);

        res.cookie("authToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
        });

        return res.status(200).json({
          isAuthenticated: true,
          user: {
            id: user.id_usuario,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            id_Perfil: user.id_perfil
          },
        });
      });
    } else {
      return res.status(406).json({ isAuthenticated: false, message: "Token inválido" });
    }
  }
};
