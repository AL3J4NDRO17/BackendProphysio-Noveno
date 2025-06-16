const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const Categoria = sequelize.define(
    "Categoria",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
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
      preview_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "Categorias",
    },
  )

  Categoria.associate = (models) => {
    // Relación con Blogs
    Categoria.hasMany(models.Blog, {
      foreignKey: "categoryId", // Changed from 'categoria_id' to match Blog model
      as: "Blogs",
    })
  }

  Categoria.afterSync(async () => {
    const categoriasExistentes = await Categoria.findOne();

    if (!categoriasExistentes) {
      await Categoria.bulkCreate([
        { nombre: 'Categoria Ejemplo 1' },
        { nombre: 'Categoria Ejemplo 2' },
      ]);
      console.log("Datos de ejemplo de categorias insertados");
    }
  });
  return Categoria;
}

