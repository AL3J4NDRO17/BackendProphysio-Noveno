const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const {
  verificarCuentaTemplate,
  verificarContraTemplate,
  verificarOtpTemplate,
  reestablecerContraTemplate,
} = require("./emailTemplates"); // Importar plantillas

dotenv.config();

// 🔥 Configuración de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// 🔥 Función para enviar email con una plantilla específica
const sendEmail = async (email, subject, template, replacements) => {
  try {
    let htmlContent = template;

    // Verificar si htmlContent es una cadena
    if (typeof htmlContent !== 'string') {
      throw new Error('❌ El contenido del template no es una cadena de texto');
    }

    // Reemplazar las variables en la plantilla
    Object.keys(replacements).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g"); // Buscar `{{variable}}`
      htmlContent = htmlContent.replace(regex, replacements[key]); // Reemplazar con valor
    });
    
    await transporter.sendMail({
      from: `"ProPhysio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error(`❌ Error enviando correo a ${email}:`, error);
    return false;
  }
};


// 🔥 Funciones específicas para cada email
const sendActivationEmail = async (email, nombre, activationLink) => {
  console.log(email,nombre,activationLink)
  return sendEmail(email, "Activa tu cuenta en ProPhysio", verificarCuentaTemplate, {
    nombre,
    activationLink,
  });
};

const sendResetPasswordEmail = async (email, resetLink) => {
  return sendEmail(email, "Recupera tu contraseña", verificarContraTemplate, {
    resetLink,
  });
};

const sendOtpEmail = async (email, otpCode) => {
  return sendEmail(email, "Tu código OTP", verificarOtpTemplate, {
    otpCode,
  });
};

const sendRecoveryEmail = async (email, otpCode) => {
  return sendEmail(email, "Tu código OTP",reestablecerContraTemplate , {
    otpCode,
  });
};

module.exports = { transporter, sendActivationEmail, sendResetPasswordEmail, sendOtpEmail,sendRecoveryEmail };
