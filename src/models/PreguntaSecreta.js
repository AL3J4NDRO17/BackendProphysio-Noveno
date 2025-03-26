const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const PreguntaSecreta = sequelize.define(
        "PreguntaSecreta",
        {
            id_pregunta: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            pregunta: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true, // Evita duplicados
            },
        },
        {
            tableName: "preguntas_secretas",
            timestamps: false, // No se necesitan timestamps aquí
        }
        
    );
    PreguntaSecreta.afterSync(async () => {
        const preguntasExistentes = await PreguntaSecreta.findOne();
     
    
        if (!preguntasExistentes) {
          await PreguntaSecreta.bulkCreate([
            { pregunta: '¿Cuál es el nombre de tu mascota?' },
            { pregunta: '¿Cuál es tu color favorito?' },
            { pregunta: '¿En qué ciudad naciste?' },
            { pregunta: '¿Cuál es tu comida favorita?' },
            { pregunta: '¿Tienes algún apodo?' }
          ]);
          console.log("Datos de ejemplo de preguntas secretas insertados.");
        }
      });
    return PreguntaSecreta;
};
