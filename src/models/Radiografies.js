// models/RadiografiaUsuario.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RadiografiaUsuario = sequelize.define(
    "RadiografiaUsuario",
    {
      id_radiografia: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_perfil: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "radiografias_usuarios",
      timestamps: true,
    }
  );

  RadiografiaUsuario.associate = (models) => {
    RadiografiaUsuario.belongsTo(models.PerfilUsuario, {
      foreignKey: "id_perfil",
      as: "perfil",
    });
  };

  return RadiografiaUsuario;
};
