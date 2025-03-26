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
      id_servicio: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "agendada", // Estado inicial por defecto
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
    Cita.belongsTo(models.Service, {
      foreignKey: "id_servicio",
      as: "servicio",
      onDelete: "CASCADE", // Si se elimina un servicio, las citas relacionadas también se eliminan
    });

    // Relación con testimonios (una cita puede tener un testimonio)
    Cita.hasOne(models.Testimonial, {
      foreignKey: "id_cita",
      as: "testimonio",
      onDelete: "CASCADE",
    });
  };

  return Cita;
};
