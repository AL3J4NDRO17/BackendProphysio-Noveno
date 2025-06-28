const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HorarioClinica = sequelize.define(
    "HorarioClinica",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      dia: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      hora_fin: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "horarios_clinica",
    }
  );

  HorarioClinica.afterSync(async () => {
    const yaExisten = await HorarioClinica.findOne();
    if (!yaExisten) {
      await HorarioClinica.bulkCreate([
        // Lunes
        { dia: "Lunes", hora_inicio: "08:00", hora_fin: "13:00" },
        { dia: "Lunes", hora_inicio: "14:00", hora_fin: "17:00" },
        // Martes
        { dia: "Martes", hora_inicio: "08:00", hora_fin: "13:00" },
        { dia: "Martes", hora_inicio: "14:00", hora_fin: "17:00" },
        // Miércoles
        { dia: "Miércoles", hora_inicio: "08:00", hora_fin: "13:00" },
        { dia: "Miércoles", hora_inicio: "14:00", hora_fin: "17:00" },
        // Jueves
        { dia: "Jueves", hora_inicio: "08:00", hora_fin: "13:00" },
        { dia: "Jueves", hora_inicio: "14:00", hora_fin: "17:00" },
        // Viernes
        { dia: "Viernes", hora_inicio: "08:00", hora_fin: "13:00" },
        { dia: "Viernes", hora_inicio: "14:00", hora_fin: "17:00" },
      ]);
      console.log("Horarios de clínica insertados con bloques.");
    }
  });

  return HorarioClinica;
};
