const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Faqs = sequelize.define("Faqs", {
    faq_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "company",
        key: "company_id",
      },
      onDelete: "CASCADE",
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
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
  },{
    tableName: "faqs",
  });

  Faqs.associate = (models) => {
    Faqs.belongsTo(models.Company, {
      foreignKey: "company_id",
      as: "company",
      onDelete: "CASCADE",
    });
  };

  return Faqs;
};
