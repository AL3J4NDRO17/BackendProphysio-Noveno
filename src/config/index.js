require("dotenv").config();
const { sequelize } = require("./database");
const { Sequelize } = require("sequelize");

// Importa modelos
const UserModel = require("../models/User");
const PerfilUsuarioModel = require("../models/PerfilUsuario");
const BlogModel = require("../models/Blog");
const CategoriaModel = require("../models/Categories");
const TokenModel = require("../models/Token.js");
const CompanyModel = require("../models/Company");
const SocialMediaLinkModel = require("../models/SocialMediaLinks");
const FaqModel = require("../models/Faq");
const PolicyModel = require("../models/Policy.js");
const CitaModel = require("../models/Cita.js");
const TestimonialModel = require("../models/Testimonial");
const ServiceModel = require("../models/Service.js");
const PreguntaSecretaModel = require("../models/PreguntaSecreta.js");
const LikeModel = require("../models/Like.js");
const HorarioClinicaModel = require("../models/Horarios.js");
const RadiografiaUsuarioModel = require("../models/Radiografies.js")
// Inicializa modelos
const models = {
  User: UserModel(sequelize),
  PerfilUsuario: PerfilUsuarioModel(sequelize),
  Blog: BlogModel(sequelize),
  Categoria: CategoriaModel(sequelize),
  Token: TokenModel(sequelize),
  Testimonial: TestimonialModel(sequelize),
  Cita: CitaModel(sequelize),
  Company: CompanyModel(sequelize),
  SocialLink: SocialMediaLinkModel(sequelize),
  Faqs: FaqModel(sequelize),
  Policy: PolicyModel(sequelize),
  Service: ServiceModel(sequelize),
  PreguntaSecreta: PreguntaSecretaModel(sequelize),
  Like: LikeModel(sequelize),
  HorarioClinica: HorarioClinicaModel(sequelize),
  RadiografiaUsuario: RadiografiaUsuarioModel(sequelize)
};

// Aplica asociaciones
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

const syncDatabase = async () => {
  try {
    console.log("Iniciando la sincronización de la base de datos...")
    const Migrate = new Sequelize(
      "postgresql://prophysiobd_user:YYx7WsNZHSMRpnHGEKSOjNi6JqP5WdZB@dpg-d1viuper433s73fni5j0-a.oregon-postgres.render.com/prophysiobd",
      {
        dialect: "postgres",
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      }
    );
    await Migrate.sync({ alter: true }); // o sin force si no quieres borrar datos
    // Orden de sincronización basado en dependencias de claves foráneas
    const modelOrder = [
      "Company",
      "PreguntaSecreta",
      "PerfilUsuario",
      "Categoria",
      "Service",
      "HorarioClinica",
      "User",
      "Policy",
      "SocialLink",
      "Faqs",
      "Token",
      "Blog",
      "Like",
      "Cita",
      "Testimonial",
      "RadiografiaUsuario"
    ]

    for (const modelName of modelOrder) {
      const model = models[modelName]
      if (model) {
        console.log(`Sincronizando modelo: ${modelName}...`)
        await model.sync({ alter: true })
        console.log(`Modelo ${modelName} sincronizado con éxito.`)

        // Ejecutar hooks o funciones de inicialización de datos si existen
        if (modelName === "HorarioClinica" && model.insertarHorariosDefault) {
          await model.insertarHorariosDefault()
        }
        // Los hooks afterSync de Categoria y PreguntaSecreta se ejecutan automáticamente
        // al llamar a .sync() en sus respectivos modelos.
      } else {
        console.warn(`Advertencia: El modelo ${modelName} no se encontró.`)
      }
    }

    console.log("¡Sincronización de la base de datos completada con éxito!")
  } catch (error) {
    console.error("Error durante la sincronización de la base de datos:", error)
    process.exit(1) // Salir con un código de error
  }
}

// Exporta todo
module.exports = {
  sequelize,
  ...models,
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  syncDatabase, // Exporta la función de sincronización
};
