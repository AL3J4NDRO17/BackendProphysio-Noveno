const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SocialLink = sequelize.define(
    "SocialLink", {
    social_id: {
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
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
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
    tableName: "socialLinks",
  });

  SocialLink.associate = (models) => {
    SocialLink.belongsTo(models.Company, {
      foreignKey: "company_id",
      as: "company",
      onDelete: "CASCADE",
    });
  };

  return SocialLink;
};
