const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Testimonial = sequelize.define(
    "Testimonial",
    {
      id_testimonio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: true, // Puede ser NULL si lo crea un admin
      },
      nombre_usuario: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      puntaje: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comentarios: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      aprobado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      creado_por_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Diferenciar testimonios de admin y usuarios
      },
    },
    {
      tableName: "testimonials",
      timestamps: true,
    }
  );

  Testimonial.associate = (models) => {
    Testimonial.belongsTo(models.User, {
      foreignKey: "id_usuario",
      as: "usuario",
      onDelete: "CASCADE",
    });
  };

  return Testimonial;
};
