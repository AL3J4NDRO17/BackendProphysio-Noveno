// models/Like.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    const Like = sequelize.define(
      "Like",
      {
        userId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: "usuarios", // nombre de tu tabla de usuarios
            key: "id_usuario",
          },
        },
        blogId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: sequelize.model.Blog, // nombre de tu tabla de blogs
            key: "id",
          },
        },
      },
      {
        tableName: "likes",
        timestamps: true, // Así puedes saber cuándo se dio like
        updatedAt: false, // No hace falta saber cuándo se actualizó, solo cuándo se creó
      }
    )
  
    Like.associate = (models) => {
      Like.belongsTo(models.User, {
        foreignKey: "userId",
        as: "usuario",
      })
  
      Like.belongsTo(models.Blog, {
        foreignKey: "blogId",
        as: "blog",
      })
    }
  
    return Like
  }
  