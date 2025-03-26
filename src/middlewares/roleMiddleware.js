
//Funcion que verifica el rol para posteriormente ser comparado 
exports.authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }
    next();
  };
};
