const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const User = sequelize.define(
        "User",
        {
            id_usuario: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            nombre: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(150),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            activo: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            fecha_registro: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            rol: {
                type: DataTypes.ENUM("admin", "usuario", "empleado"),
                allowNull: false,
                defaultValue: "usuario",
            },
            intentos_fallidos: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            bloqueado: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            fecha_bloqueo: {
                type: DataTypes.DATE,  // Debería ser DataTypes.DATE, que manejará las fechas en UTC
                allowNull: true,
                get() {
                    const value = this.getDataValue('fecha_bloqueo');
                    return value ? new Date(value).toISOString() : null; // Asegura que se guarde en UTC
                },
            },
            fecha_desbloqueo: {
                type: DataTypes.DATE,  // Lo mismo aquí
                allowNull: true,
                get() {
                    const value = this.getDataValue('fecha_desbloqueo');
                    return value ? new Date(value).toISOString() : null; // Asegura que se guarde en UTC
                },
            },
            folio: {
                type: DataTypes.STRING(10),
                allowNull: true,
                unique: true,
            },
            id_pregunta: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "preguntas_secretas",
                    key: "id_pregunta",
                },
            },
            respuesta_secreta: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            id_perfil: {
                type: DataTypes.INTEGER,
                allowNull: true,  // Puede ser null si aún no se ha asignado un perfil
                references: {
                    model: 'perfiles_usuarios', // Usa el nombre real de la tabla
                    key: "id_perfil"
                },
                onDelete: "SET NULL", // Si se elimina el perfil, se establece el id_perfil a null
                onUpdate: "CASCADE", // Si se actualiza el id_perfil en perfiles_usuarios, se actualiza en usuarios
            },


        },
        {
            tableName: "usuarios",
            timestamps: false,
        }
    );



    User.associate = (models) => {
        User.hasMany(models.Token, {
            foreignKey: 'id_usuario',
            as: 'tokens'
        });
        User.belongsTo(models.PreguntaSecreta, {
            foreignKey: "id_pregunta",
            as: "preguntaSecreta",
        });

        User.belongsTo(models.PerfilUsuario, {
            foreignKey: "id_perfil",
            as: "perfil",
        });

    };
    User.beforeCreate(async (user, options) => {
        // Intenta generar un folio único
        let folioGenerado;
        let existente;

        do {
            folioGenerado = generarFolio();
            existente = await User.findOne({ where: { folio: folioGenerado } });
        } while (existente);

        user.folio = folioGenerado;
    });
    User.afterCreate(async (user, options) => {
        try {
            const perfil = await sequelize.models.PerfilUsuario.create({
                nombre_completo: user.nombre,
            });

            user.id_perfil = perfil.id_perfil;
            await user.save({ fields: ["id_perfil"] });
        } catch (error) {
            console.error("Error al crear el perfil y las preguntas secretas:", error);
        }
    });

    return User;
};
