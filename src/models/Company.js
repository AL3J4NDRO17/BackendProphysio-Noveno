const { DataTypes } = require("sequelize");

module. exports = (sequelize) => {
    const Company = sequelize.define(
        "Company",
        {
            company_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
            },
            phone: {
                type: DataTypes.STRING,
            },
            address: {
                type: DataTypes.STRING,
            },
            logo_url: {  // ✅ Logo actual
                type: DataTypes.STRING,
                allowNull: true,
            },
            logos_history: {  // ✅ Historial de logos (array de URLs)
                type: DataTypes.ARRAY(DataTypes.STRING), // Almacena un array de strings (URLs)
                defaultValue: [],
            },
            description: {
                type: DataTypes.TEXT,
            },
            mission: {
                type: DataTypes.TEXT,
            },
            vision: {
                type: DataTypes.TEXT,
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },{
            tableName: "company",
           
        });


    // Definir relaciones correctamente
    Company.associate = (models) => {
        Company.hasMany(models.SocialLink, {
            foreignKey: "company_id",
            as: "socialLinks",
            onDelete: "CASCADE",
        });

        Company.hasMany(models.Faqs, {
            foreignKey: "company_id",
            as: "faqs",
            onDelete: "CASCADE",
        });
    };

    return Company;
};
