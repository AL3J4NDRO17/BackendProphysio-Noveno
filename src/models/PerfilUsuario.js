const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const PerfilUsuario = sequelize.define(
    "PerfilUsuario",
    {
      id_perfil: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre_completo: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      edad: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      sexo: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      direccion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ciudad: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      estado: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      codigo_postal: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      medio_contacto_preferido: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      historial_medico: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      alergias: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      medicamentos_alergia: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      foto_perfil: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "perfiles_usuarios",
      timestamps: true,
    },
  )
  PerfilUsuario.associate = (models) => {
    PerfilUsuario.hasOne(models.User, {
      foreignKey: "id_perfil",
      as: "usuario",
    });

    PerfilUsuario.hasMany(models.RadiografiaUsuario, {
      foreignKey: "id_perfil",
      as: "radiografias",
    });
  };



  return PerfilUsuario
}

