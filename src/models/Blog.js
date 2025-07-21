const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Blog = sequelize.define(
    "Blog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mainContent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bannerTitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bannerImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      attachedImages: {
        // Nuevo campo para imágenes adjuntas
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [], // Valor por defecto como array vacío
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "draft",
      },
      categoryId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Categorias", // Nombre de la tabla de categorías
          key: "id",
        },
        allowNull: false,
      },
    },
    {
      tableName: "Blogs",
    },
  )
  Blog.associate = (models) => {
    // Relación muchos a muchos con la tabla User (a través de Like)
    Blog.belongsToMany(models.User, {
      through: models.Like,
      foreignKey: "blogId",
      as: "usuariosQueDieronLike",
    })

    // Relación con la tabla Categoria (uno a muchos)
    Blog.belongsTo(models.Categoria, {
      foreignKey: "categoryId",
      as: "category",
    })
  }

  // Si no hay categorías existentes, crear una por defecto
  Blog.afterCreate(async (blog, options) => {
    const categoriaExistente = await sequelize.models.Categoria.findOne()
    if (!categoriaExistente) {
      await sequelize.models.Categoria.create({ nombre: "Categoria Ejemplo 1" })
    }
  })

  return Blog
}
