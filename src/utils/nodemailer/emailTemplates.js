const fs = require("fs");
const path = require("path");

// Función para leer una plantilla HTML
const loadTemplate = (templateName) => {
  try {
    const templatePath = path.join(__dirname, "./views", templateName);
    return fs.readFileSync(templatePath, "utf8"); // Lee el archivo y devuelve el contenido
  } catch (error) {
    console.error(`❌ Error cargando la plantilla ${templateName}:`, error);
    return ""; // Retorna string vacío si hay error
  }
};

// Exportamos las plantillas
module.exports = {
  verificarCuentaTemplate: loadTemplate("verificarCuenta.html"),
  verificarContraTemplate: loadTemplate("verificarContra.html"),
  verificarOtpTemplate: loadTemplate("verificarOtp.html"),
  reestablecerContraTemplate: loadTemplate("reestablecerContra.html"),
};
