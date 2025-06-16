/**
 * Crea un Error marcado como crítico.
 * @param {string} message - Mensaje de error
 * @returns {Error} error con .critical = true
 */
const createCriticalError = (message) => {
    const error = new Error(message);
    error.critical = true;
    return error;
};

module.exports = { createCriticalError };
