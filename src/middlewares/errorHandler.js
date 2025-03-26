// middlewares/errorHandler.js (CommonJS)
exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Manejo de errores de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }

    // Cualquier otro error interno
    res.status(500).json({ message: 'Algo salió mal!' });
};
