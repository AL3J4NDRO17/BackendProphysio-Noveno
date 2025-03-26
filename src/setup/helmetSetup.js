const helmet = require("helmet");

const helmetConfig = helmet({
  hidePoweredBy: true, //Oculta el encabezado X-Powered-By 
  frameguard: { action: "deny" },// Protege contra ataques de "clickjacking" bloqueando el uso de <iframe> en tu sitio.
  xssFilter: true,// Habilita la protección contra ataques XSS (Cross-Site Scripting).
  noSniff: true,//Activa X-Content-Type-Options: nosniff, lo que evita que el navegador "adivine" el tipo de archivo.
  hsts: { maxAge: 31536000 }, //HTTPS
  contentSecurityPolicy: { //que limita qué recursos se pueden cargar en tu sitio.
    directives: {
      defaultSrc: ["'self'"], // Solo permite cargar contenido desde la misma página (self).
      scriptSrc: ["'self'", "'trusted-cdn.com'"], //Scripts de un mismo sitio web
      objectSrc: ["'none'"], //Bloquea <object>, <embed>, y <applet>.
      upgradeInsecureRequests: [], //Fuerza que todas las solicitudes HTTP se conviertan en HTTPS automáticamente.
    },
  },
});

module.exports = helmetConfig;
