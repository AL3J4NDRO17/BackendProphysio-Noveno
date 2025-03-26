require("dotenv").config()


const { sequelize } = require("./database")

// Import model definitions
const UserModel = require("../models/User")
const PerfilUsuarioModel = require("../models/PerfilUsuario")
const BlogModel = require("../models/Blog")
const CategoriaModel = require("../models/Categories")
const TokenModel = require("../models/Token");
const CompanyModel = require("../models/Company");
const SocialMediaLinkModel = require("../models/SocialMediaLinks");
const FaqModel = require("../models/Faq");
const PolicyModel = require("../models/Policy.js");
const CitaModel = require("../models/CIta")
const TestimonialModel = require("../models/Testimonial")
const ServiceModel = require("../models/Service.js")
const PreguntaSecretaModel = require("../models/PreguntaSecreta.js")
const LikeModel = require("../models/Like.js")
// Initialize models
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
}

// Set up associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models)
  }
})

// Sync models with database
// Sync models with database and log the progress
const mode = "alter" // "force" or "alter"

const syncModels = async () => {
  try {
    console.log("Iniciando la sincronización de los modelos...");

    // Use the mode variable to determine the synchronization type
    const syncOptions = mode === "force" ? { force: true } : { alter: true };
    
    await sequelize.models.PerfilUsuario.sync(syncOptions);
    await sequelize.models.User.sync(syncOptions);
    await sequelize.models.Token.sync(syncOptions);
    await sequelize.models.PreguntaSecreta.sync(syncOptions);
    await sequelize.models.Blog.sync(syncOptions);
    await sequelize.models.Like.sync(syncOptions);
    await sequelize.models.Categoria.sync(syncOptions);
    await sequelize.models.Service.sync(syncOptions);
    await sequelize.models.Cita.sync(syncOptions);
    await sequelize.models.Testimonial.sync(syncOptions);
    await sequelize.models.Company.sync(syncOptions);
    await sequelize.models.SocialLink.sync(syncOptions);
    await sequelize.models.Faqs.sync(syncOptions);
    await sequelize.models.Policy.sync(syncOptions);

    console.log("✅ Base de datos sincronizada correctamente.");
  } catch (error) {
    console.error("❌ Error al sincronizar la base de datos:", error);
  }
};

syncModels();
module.exports = {
  sequelize,
  ...models,
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
}

