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
        validate: {
          isIn: [["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]],
        },
      },
      duracion_sesion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60, // puedes cambiar el valor por defecto si necesitas
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

  // Hook personalizado para insertar horarios si no existen
  const insertarHorariosDefault = async () => {
    const yaExisten = await HorarioClinica.findOne();
    if (!yaExisten) {
      const horarios = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
      const bloques = [
        { hora_inicio: "08:00", hora_fin: "13:00" },
        { hora_inicio: "14:00", hora_fin: "17:00" },
      ];

      const datos = horarios.flatMap((dia) =>
        bloques.map((bloque) => ({
          dia,
          duracion_sesion: 60, // o el valor que manejes
          ...bloque,
        }))
      );

      await HorarioClinica.bulkCreate(datos);
      console.log("Horarios de clínica insertados con bloques.");
    }
  };

  // Ejecutar después del sync en otro archivo, por ejemplo:
  HorarioClinica.insertarHorariosDefault = insertarHorariosDefault;

  return HorarioClinica;
};
