const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Cita = sequelize.define(
    "Cita",
    {
      id_cita: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      numero_sesion: {
        type: DataTypes.INTEGER,
        allowNull: false, // o true si puede ser opcional
        defaultValue: 1   // opcional
      },
      fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM("pendiente", "confirmada", "cancelada", "completada", "postergada"),
        allowNull: false,
        defaultValue: "pendiente", // Estado inicial por defecto
      },
      foto_documento: {
        type: DataTypes.STRING,
        allowNull: true,
        // Aquí se guarda la URL del archivo subido (imagen, PDF, etc.)
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "citas",
      timestamps: false,
    }
  );

  Cita.associate = (models) => {
    // Relación con usuarios (cada cita pertenece a un usuario)
    Cita.belongsTo(models.User, {
      foreignKey: "id_usuario",
      as: "usuario",
      onDelete: "CASCADE", // Si el usuario se elimina, sus citas también
    });

    // Relación con servicios (cada cita pertenece a un servicio)
    // Cita.belongsTo(models.Service, {
    //   foreignKey: "id_servicio",
    //   as: "servicio",
    //   onDelete: "CASCADE", // Si se elimina un servicio, las citas relacionadas también se eliminan
    // });

    // Relación con testimonios (una cita puede tener un testimonio)

  };

  return Cita;
};
