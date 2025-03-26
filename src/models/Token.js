// Token.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Token = sequelize.define('Token', {
        id_token: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            references: {
                model: 'usuarios', // este nombre debe coincidir con el `tableName` de tu modelo User
                key: 'id_usuario',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tipo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_expiracion: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        tableName: 'Token',
    });

    // Relación con User
    Token.associate = (models) => {
        // Establecer relación inversa: un token pertenece a un usuario
        Token.belongsTo(models.User, {
            foreignKey: 'id_usuario',
            as: 'usuario',  // Alias para la relación
        });
    };


    return Token;
};
