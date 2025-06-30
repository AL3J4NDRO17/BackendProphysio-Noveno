require("dotenv").config();
const { sequelize } = require("./database");

// Importa modelos
const UserModel = require("../models/User");
const PerfilUsuarioModel = require("../models/PerfilUsuario");
const BlogModel = require("../models/Blog");
const CategoriaModel = require("../models/Categories");
const TokenModel = require("../models/Token");
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
};

// Aplica asociaciones
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Exporta todo
module.exports = {
  sequelize,
  ...models,
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
};
