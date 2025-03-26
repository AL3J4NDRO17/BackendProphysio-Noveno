// controllers/categoriaController.js
const  {Categoria}  = require('../config/index');

// Crear una nueva categoría
exports.createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    const newCategoria = await Categoria.create({ nombre });
    res.status(201).json(newCategoria);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
};

// Obtener todas las categorías
exports.getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
  
    res.status(200).json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: 'Error al obtener las categorías' });
  }
};

// Obtener una categoría por su ID
exports.getCategoriaById = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.status(200).json(categoria);
  } catch (error) {
    console.error("Error al obtener la categoría:", error);
    res.status(500).json({ message: 'Error al obtener la categoría' });
  }
};

// Actualizar una categoría
exports.updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    categoria.nombre = nombre;
    await categoria.save();
    res.status(200).json(categoria);
  } catch (error) {
    console.error("Error al actualizar la categoría:", error);
    res.status(500).json({ message: 'Error al actualizar la categoría' });
  }
};

// Eliminar una categoría
exports.deleteCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    await categoria.destroy();
    res.status(200).json({ message: 'Categoría eliminada con éxito' });
  } catch (error) {
    console.error("Error al eliminar la categoría:", error);
    res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
};
