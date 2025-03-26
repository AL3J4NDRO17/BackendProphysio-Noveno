const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Policy = sequelize.define("Policy", {
    policy_id: {
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
    privacy_policy: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    terms_conditions: {
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
  });

  Policy.associate = (models) => {
    Policy.belongsTo(models.Company, {
      foreignKey: "company_id",
      as: "company",
      onDelete: "CASCADE",
    });
  };

  return Policy;
};
